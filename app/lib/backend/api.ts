import { auth } from "./firebase";

const getToken = async (forceRefresh = false) => {
  const user = auth.currentUser;
  if (user) return await user.getIdToken(forceRefresh);

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) return token;
  }

  return "";
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getToken();
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const url = `${process.env.NEXT_PUBLIC_CUID_REQUEST_URL}${endpoint}`;
  const response = await fetch(url, { ...options, headers, cache: "no-store" });

  if (response.status === 401) {
    const newToken = await getToken(true);
    if (newToken) {
      const retryHeaders = new Headers(headers);
      retryHeaders.set("Authorization", `Bearer ${newToken}`);

      return fetch(url, {
        ...options,
        headers: retryHeaders,
        cache: "no-store",
      });
    }
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Something went wrong");
  }

  return response.json();
};
