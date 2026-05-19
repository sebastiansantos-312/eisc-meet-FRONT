import type { User } from "firebase/auth";
import { deleteDoc, doc, getDoc, runTransaction, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase/firebase.config";
import { buildInitialUserData, isValidUsername, normalizeUsername, type UserData } from "../types/user.types";

const usersCollection = "users";
const usernamesCollection = "usernames";

export type InitialUserExtras = Partial<
  Pick<
    UserData,
    | "firstName"
    | "lastName"
    | "name"
    | "username"
    | "provider"
    | "profileCompleted"
    | "bio"
    | "university"
    | "major"
    | "year"
    | "gpa"
    | "allowStudyInvites"
    | "enableEmailNotifications"
    | "showStudyHoursPublic"
  >
>;

const userDocRef = (uid: string) => doc(db, usersCollection, uid);
const usernameDocRef = (username: string) => doc(db, usernamesCollection, normalizeUsername(username));

export const getUsernameOwner = async (username: string): Promise<string | null> => {
  const snapshot = await getDoc(usernameDocRef(username));
  return snapshot.exists() ? String(snapshot.data().uid) : null;
};

export const isUsernameAvailable = async (username: string, currentUid?: string): Promise<boolean> => {
  if (!isValidUsername(username)) {
    return false;
  }

  const ownerUid = await getUsernameOwner(username);
  return !ownerUid || ownerUid === currentUid;
};

const assertValidUsername = (username: string) => {
  if (!isValidUsername(username)) {
    throw new Error("El username debe tener 3 a 20 caracteres y solo usar letras, numeros o guion bajo.");
  }
};

export const getUserProfile = async (uid: string): Promise<UserData | null> => {
  const snapshot = await getDoc(userDocRef(uid));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserData;
};

export const createInitialUserProfile = async (
  authUser: User,
  extraData: InitialUserExtras = {},
): Promise<UserData> => {
  const now = new Date().toISOString();
  const normalizedUsername = extraData.username ? normalizeUsername(extraData.username) : undefined;

  if (normalizedUsername) {
    assertValidUsername(normalizedUsername);
  }

  const profile: UserData = {
    ...buildInitialUserData(
      authUser.uid,
      extraData.name ?? authUser.displayName,
      authUser.email,
      authUser.photoURL,
      {
        firstName: extraData.firstName,
        lastName: extraData.lastName,
        profileCompleted: Boolean(normalizedUsername),
        provider: extraData.provider,
      },
    ),
    ...extraData,
    uid: authUser.uid,
    email: authUser.email,
    photoURL: authUser.photoURL,
    profileCompleted: Boolean(normalizedUsername),
    createdAt: now,
    updatedAt: now,
  };

  if (normalizedUsername) {
    profile.username = normalizedUsername;
  } else {
    delete profile.username;
  }

  if (!normalizedUsername) {
    await setDoc(userDocRef(authUser.uid), profile, { merge: true });
    return profile;
  }

  await runTransaction(db, async (transaction) => {
    const usernameRef = usernameDocRef(normalizedUsername);
    const usernameSnapshot = await transaction.get(usernameRef);

    if (usernameSnapshot.exists() && usernameSnapshot.data().uid !== authUser.uid) {
      throw new Error("Este username ya esta en uso.");
    }

    transaction.set(userDocRef(authUser.uid), profile, { merge: true });
    transaction.set(usernameRef, {
      uid: authUser.uid,
      username: normalizedUsername,
      createdAt: now,
    });
  });

  return profile;
};

export const upsertUserProfile = async (profile: UserData): Promise<UserData> => {
  const nextProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(userDocRef(profile.uid), nextProfile, { merge: true });
  return nextProfile;
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<Omit<UserData, "uid" | "createdAt">>,
): Promise<UserData> => {
  const currentProfile = await getUserProfile(uid);

  if (!currentProfile) {
    throw new Error("No se pudo cargar el perfil actual.");
  }

  if (data.username && normalizeUsername(data.username) !== currentProfile.username) {
    const now = new Date().toISOString();
    const nextUsername = normalizeUsername(data.username);
    assertValidUsername(nextUsername);

    const payload = {
      ...data,
      username: nextUsername,
      profileCompleted: true,
      updatedAt: now,
    };

    await runTransaction(db, async (transaction) => {
      const nextUsernameRef = usernameDocRef(nextUsername);
      const nextUsernameSnapshot = await transaction.get(nextUsernameRef);

      if (nextUsernameSnapshot.exists() && nextUsernameSnapshot.data().uid !== uid) {
        throw new Error("Este username ya esta en uso.");
      }

      if (currentProfile.username && currentProfile.username !== nextUsername) {
        transaction.delete(usernameDocRef(currentProfile.username));
      }

      transaction.set(nextUsernameRef, {
        uid,
        username: nextUsername,
        createdAt: now,
      });
      transaction.update(userDocRef(uid), payload);
    });

    const updatedProfile = await getUserProfile(uid);

    if (!updatedProfile) {
      throw new Error("No se pudo cargar el perfil actualizado.");
    }

    return updatedProfile;
  }

  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(userDocRef(uid), payload);

  const updatedProfile = await getUserProfile(uid);

  if (!updatedProfile) {
    throw new Error("No se pudo cargar el perfil actualizado.");
  }

  return updatedProfile;
};

export const completeUserProfile = async (
  uid: string,
  data: Pick<UserData, "firstName" | "lastName" | "username">,
): Promise<UserData> => {
  const name = [data.firstName?.trim(), data.lastName?.trim()].filter(Boolean).join(" ") || null;

  return updateUserProfile(uid, {
    firstName: data.firstName?.trim(),
    lastName: data.lastName?.trim(),
    username: data.username,
    name,
    profileCompleted: true,
  });
};

export const deleteUserProfile = async (uid: string): Promise<void> => {
  const profile = await getUserProfile(uid);

  if (profile?.username) {
    await deleteDoc(usernameDocRef(profile.username));
  }

  await deleteDoc(userDocRef(uid));
};
