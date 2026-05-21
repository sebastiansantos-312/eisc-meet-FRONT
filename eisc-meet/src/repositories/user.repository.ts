import type { User } from "firebase/auth";
import { apiFetchJson } from "../lib/apiClient";
import { buildInitialUserData, isValidUsername, normalizeUsername, type UserData } from "../types/user.types";

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

export const getUsernameOwner = async (username: string): Promise<string | null> => {
  const result = await apiFetchJson<{ available: boolean }>("/api/users/check-username", {
    method: "POST",
    body: JSON.stringify({ username: normalizeUsername(username) }),
  });

  return result.available ? null : "reserved";
};

export const isUsernameAvailable = async (username: string, _currentUid?: string): Promise<boolean> => {
  if (!isValidUsername(username)) {
    return false;
  }

  const result = await apiFetchJson<{ available: boolean }>("/api/users/check-username", {
    method: "POST",
    body: JSON.stringify({ username: normalizeUsername(username) }),
  });

  return result.available;
};

const assertValidUsername = (username: string) => {
  if (!isValidUsername(username)) {
    throw new Error("El username debe tener 3 a 20 caracteres y solo usar letras, numeros o guion bajo.");
  }
};

export const getUserProfile = async (_uid?: string): Promise<UserData | null> => {
  try {
    return await apiFetchJson<UserData>("/api/users/me");
  } catch (error) {
    if (error instanceof Error && error.message.includes("Perfil no encontrado")) {
      return null;
    }

    throw error;
  }
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

  return apiFetchJson<UserData>("/api/users/me", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
};

export const upsertUserProfile = async (profile: UserData): Promise<UserData> => {
  return apiFetchJson<UserData>("/api/users/me", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
};

export const updateUserProfile = async (
  _uid: string,
  data: Partial<Omit<UserData, "uid" | "createdAt">>,
): Promise<UserData> => {
  const payload = {
    ...data,
    ...(data.username ? { username: normalizeUsername(data.username) } : {}),
  };

  return apiFetchJson<UserData>("/api/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
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

export const deleteUserProfile = async (_uid?: string): Promise<void> => {
  await apiFetchJson<{ ok: boolean }>("/api/users/me", {
    method: "DELETE",
  });
};
