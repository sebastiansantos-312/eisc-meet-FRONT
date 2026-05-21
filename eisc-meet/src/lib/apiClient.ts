import { auth } from "../services/firebase/firebase.config";

const API_URL = import.meta.env.VITE_BACKEND_FIREBASE_URL || "http://localhost:9000";

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
};

export const apiFetchJson = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await apiFetch(path, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof data?.error === "string" ? data.error : "No se pudo completar la solicitud.";
    throw new Error(message);
  }

  return data as T;
};
