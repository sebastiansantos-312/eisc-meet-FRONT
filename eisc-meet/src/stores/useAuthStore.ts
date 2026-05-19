import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile,
  type Unsubscribe,
  type User,
} from "firebase/auth";
import { create } from "zustand";
import { auth } from "../services/firebase/firebase.config";
import {
  createInitialUserProfile,
  completeUserProfile,
  getUserProfile,
  isUsernameAvailable,
  updateUserProfile,
  type InitialUserExtras,
} from "../repositories/user.repository";
import { joinDisplayName, normalizeUsername, type UserData } from "../types/user.types";

type RegisterPayload = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

type CompleteProfilePayload = {
  firstName: string;
  lastName: string;
  username: string;
};

type AuthStore = {
  authUser: User | null;
  profile: UserData | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  initAuthObserver: () => Unsubscribe;
  loginWithGoogle: () => Promise<UserData>;
  loginWithEmail: (email: string, password: string) => Promise<UserData>;
  registerWithEmail: (payload: RegisterPayload) => Promise<UserData>;
  logout: () => Promise<void>;
  fetchProfile: (uid: string) => Promise<UserData | null>;
  updateProfile: (data: Partial<Omit<UserData, "uid" | "createdAt">>) => Promise<void>;
  completeProfile: (data: CompleteProfilePayload) => Promise<UserData>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
  clearError: () => void;
};

const resolveProfile = async (user: User, extraData?: InitialUserExtras) => {
  const existingProfile = await getUserProfile(user.uid);
  return existingProfile ?? createInitialUserProfile(user, extraData);
};

const authErrorMessage = (error: unknown) => {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";

  if (error instanceof Error && error.message.includes("Google")) return error.message;
  if (code.includes("email-already-in-use")) return "Este correo ya tiene una cuenta.";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "Correo o contrasena incorrectos.";
  if (code.includes("weak-password")) return "La contrasena debe tener al menos 6 caracteres.";
  if (code.includes("popup-closed-by-user")) return "Cerraste la ventana de Google antes de terminar.";
  if (code.includes("operation-not-allowed")) return "Este metodo de autenticacion no esta habilitado en Firebase.";
  if (error instanceof Error && error.message.includes("username")) return error.message;
  if (error instanceof Error && error.message.includes("uso")) return error.message;

  return "No se pudo completar la autenticacion. Intenta de nuevo.";
};

const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  profile: null,
  loading: true,
  profileLoading: false,
  error: null,

  initAuthObserver: () => {
    set({ loading: true });

    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        set({ authUser: null, profile: null, loading: false, profileLoading: false });
        return;
      }

      set({ authUser: user, profileLoading: true, error: null });

      try {
        const profile = await resolveProfile(user);
        set({ profile, loading: false, profileLoading: false });
      } catch (error) {
        set({ error: authErrorMessage(error), loading: false, profileLoading: false });
      }
    });
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });

    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const profile = await resolveProfile(result.user);
      set({ authUser: result.user, profile, loading: false });
      return profile;
    } catch (error) {
      set({ error: authErrorMessage(error), loading: false });
      throw error;
    }
  },

  loginWithEmail: async (email, password) => {
    set({ loading: true, error: null });

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await resolveProfile(result.user);
      set({ authUser: result.user, profile, loading: false });
      return profile;
    } catch (error) {
      set({ error: authErrorMessage(error), loading: false });
      throw error;
    }
  },

  registerWithEmail: async ({ firstName, lastName, username, email, password }) => {
    set({ loading: true, error: null });

    try {
      const normalizedUsername = normalizeUsername(username);
      const usernameAvailable = await isUsernameAvailable(normalizedUsername);

      if (!usernameAvailable) {
        throw new Error("Este username ya esta en uso.");
      }

      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.includes("google.com") && !methods.includes("password")) {
        throw new Error("Este correo ya existe con Google. Entra con Google para continuar.");
      }

      if (methods.includes("password")) {
        return get().loginWithEmail(email, password);
      }

      const name = joinDisplayName(firstName, lastName);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateFirebaseProfile(result.user, { displayName: name ?? undefined });
      const profile = await createInitialUserProfile(result.user, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: normalizedUsername,
        name,
        profileCompleted: true,
      });
      set({ authUser: result.user, profile, loading: false });
      return profile;
    } catch (error) {
      set({ error: authErrorMessage(error), loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });

    try {
      await signOut(auth);
      set({ authUser: null, profile: null, loading: false, profileLoading: false });
    } catch (error) {
      set({ error: authErrorMessage(error), loading: false });
      throw error;
    }
  },

  fetchProfile: async (uid) => {
    set({ profileLoading: true, error: null });

    try {
      const profile = await getUserProfile(uid);
      set({ profile, profileLoading: false });
      return profile;
    } catch (error) {
      set({ error: authErrorMessage(error), profileLoading: false });
      throw error;
    }
  },

  updateProfile: async (data) => {
    const { authUser } = get();

    if (!authUser) {
      set({ error: "Debes iniciar sesion para actualizar tu perfil." });
      return;
    }

    set({ profileLoading: true, error: null });

    try {
      const profile = await updateUserProfile(authUser.uid, data);
      set({ profile, profileLoading: false });
    } catch (error) {
      set({ error: authErrorMessage(error), profileLoading: false });
      throw error;
    }
  },

  completeProfile: async ({ firstName, lastName, username }) => {
    const { authUser } = get();

    if (!authUser) {
      const error = new Error("Debes iniciar sesion para completar tu perfil.");
      set({ error: error.message });
      throw error;
    }

    set({ profileLoading: true, error: null });

    try {
      const profile = await completeUserProfile(authUser.uid, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: normalizeUsername(username),
      });

      const displayName = joinDisplayName(profile.firstName ?? "", profile.lastName ?? "");
      if (displayName) {
        await updateFirebaseProfile(authUser, { displayName });
      }

      set({ profile, profileLoading: false });
      return profile;
    } catch (error) {
      set({ error: authErrorMessage(error), profileLoading: false });
      throw error;
    }
  },

  checkUsernameAvailable: async (username) => {
    const { authUser } = get();
    return isUsernameAvailable(username, authUser?.uid);
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
