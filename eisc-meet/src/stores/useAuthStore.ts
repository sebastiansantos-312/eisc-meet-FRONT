import {
  createUserWithEmailAndPassword,
  deleteUser,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithPopup,
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
  deleteUserProfile,
  getUserProfile,
  isUsernameAvailable,
  updateUserProfile,
  type InitialUserExtras,
} from "../repositories/user.repository";
import { institutionalEmailDomain, isInstitutionalEmail, joinDisplayName, normalizeUsername, type UserData } from "../types/user.types";

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
  deleteAccount: () => Promise<void>;
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

const institutionalEmailError = `Usa tu correo institucional ${institutionalEmailDomain}.`;
let manualRegistrationInProgress = false;

const assertInstitutionalUser = (user: User) => {
  if (!isInstitutionalEmail(user.email)) {
    throw new Error(institutionalEmailError);
  }
};

const authErrorMessage = (error: unknown) => {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (error instanceof Error && error.message.includes("Google")) return error.message;
  if (error instanceof Error && error.message.includes("Failed to fetch")) {
    return "No se pudo conectar con el backend principal. Verifica que eisc-firebase este corriendo.";
  }
  if (code.includes("email-already-in-use")) return "Este correo ya tiene una cuenta.";
  if (code.includes("invalid-email")) return "El correo no tiene un formato valido.";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "Correo o contrasena incorrectos.";
  if (code.includes("weak-password")) return "La contrasena debe tener al menos 6 caracteres.";
  if (code.includes("network-request-failed")) return "No hay conexion con Firebase. Revisa tu internet e intenta de nuevo.";
  if (code.includes("permission-denied")) return "Firestore rechazo la operacion. Revisa las reglas para users y usernames.";
  if (code.includes("popup-closed-by-user")) return "Cerraste la ventana de Google antes de terminar.";
  if (code.includes("operation-not-allowed")) {
    return `Este metodo de autenticacion no esta habilitado en el proyecto Firebase que usa la app${projectId ? ` (${projectId})` : ""}.`;
  }
  if (error instanceof Error && error.message.includes("username")) return error.message;
  if (error instanceof Error && error.message.includes("uso")) return error.message;
  if (error instanceof Error && error.message) return error.message;

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

      if (!isInstitutionalEmail(user.email)) {
        await signOut(auth);
        set({ authUser: null, profile: null, loading: false, profileLoading: false, error: institutionalEmailError });
        return;
      }

      if (manualRegistrationInProgress) {
        set({ authUser: user, profileLoading: true, error: null });
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
      assertInstitutionalUser(result.user);
      const profile = await resolveProfile(result.user);
      set({ authUser: result.user, profile, loading: false });
      return profile;
    } catch (error) {
      if (error instanceof Error && error.message === institutionalEmailError) {
        await signOut(auth).catch(() => undefined);
      }
      set({ error: authErrorMessage(error), loading: false });
      throw error;
    }
  },

  loginWithEmail: async (email, password) => {
    set({ loading: true, error: null });

    try {
      if (!isInstitutionalEmail(email)) {
        throw new Error(institutionalEmailError);
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      assertInstitutionalUser(result.user);
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
    manualRegistrationInProgress = true;

    try {
      const normalizedUsername = normalizeUsername(username);
      const normalizedEmail = email.trim().toLowerCase();

      if (!isInstitutionalEmail(normalizedEmail)) {
        throw new Error(institutionalEmailError);
      }

      const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);

      if (methods.includes("google.com") && !methods.includes("password")) {
        throw new Error("Este correo ya existe con Google. Entra con Google para continuar.");
      }

      if (methods.includes("password")) {
        throw new Error("Este correo ya tiene una cuenta.");
      }

      const name = joinDisplayName(firstName, lastName);
      const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

      let profile: UserData;

      try {
        await updateFirebaseProfile(result.user, { displayName: name ?? undefined });
        profile = await createInitialUserProfile(result.user, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: normalizedUsername,
          name,
          provider: "password",
          profileCompleted: true,
        });
      } catch (profileError) {
        await deleteUser(result.user).catch(() => undefined);
        throw profileError;
      }

      set({ authUser: result.user, profile, loading: false });
      return profile;
    } catch (error) {
      console.error("[EISC Meet] registerWithEmail failed:", error);
      set({ error: authErrorMessage(error), loading: false });
      throw error;
    } finally {
      manualRegistrationInProgress = false;
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

  deleteAccount: async () => {
    const { authUser } = get();

    if (!authUser) {
      const error = new Error("Debes iniciar sesion para eliminar tu cuenta.");
      set({ error: error.message });
      throw error;
    }

    set({ loading: true, error: null });

    try {
      const providerIds = authUser.providerData.map((provider) => provider.providerId);

      if (providerIds.includes("google.com")) {
        await reauthenticateWithPopup(authUser, new GoogleAuthProvider());
      }

      await deleteUserProfile();
      await signOut(auth);
      set({ authUser: null, profile: null, loading: false, profileLoading: false });
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      const message = code.includes("requires-recent-login")
        ? "Por seguridad, vuelve a iniciar sesion y elimina la cuenta de nuevo."
        : authErrorMessage(error);

      console.error("[EISC Meet] deleteAccount failed:", error);
      set({ error: message, loading: false, profileLoading: false });
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
      const nextDisplayName = typeof data.name !== "undefined" ? data.name ?? undefined : undefined;

      if (typeof nextDisplayName !== "undefined") {
        await updateFirebaseProfile(authUser, {
          displayName: nextDisplayName,
        });
      }

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
