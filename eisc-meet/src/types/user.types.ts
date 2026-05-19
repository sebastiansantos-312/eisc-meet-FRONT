export type AcademicYear = "freshman" | "sophomore" | "junior" | "senior" | "graduate" | "";

export type UserData = {
  uid: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  name: string | null;
  email: string | null;
  photoURL?: string | null;
  profileCompleted?: boolean;
  bio?: string;
  university?: string;
  major?: string;
  year?: AcademicYear;
  gpa?: string;
  studyHours?: number;
  sessionsJoined?: number;
  allowStudyInvites?: boolean;
  enableEmailNotifications?: boolean;
  showStudyHoursPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export const buildInitialUserData = (
  uid: string,
  name: string | null,
  email: string | null,
  photoURL: string | null,
  extras: Partial<Pick<UserData, "firstName" | "lastName" | "username" | "profileCompleted">> = {},
): UserData => ({
  uid,
  firstName: extras.firstName ?? splitDisplayName(name).firstName,
  lastName: extras.lastName ?? splitDisplayName(name).lastName,
  username: extras.username,
  name,
  email,
  photoURL,
  profileCompleted: extras.profileCompleted ?? Boolean(extras.username),
  bio: "",
  university: "",
  major: "",
  year: "",
  gpa: "",
  studyHours: 0,
  sessionsJoined: 0,
  allowStudyInvites: true,
  enableEmailNotifications: true,
  showStudyHoursPublic: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const splitDisplayName = (name: string | null) => {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
};

export const joinDisplayName = (firstName: string, lastName: string) => {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || null;
};

export const normalizeUsername = (username: string) => {
  return username.trim().toLowerCase();
};

export const isValidUsername = (username: string) => {
  return /^[a-z0-9_]{3,20}$/.test(normalizeUsername(username));
};
