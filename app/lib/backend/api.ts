// Fetch wrapper for API routes with Better Auth cookie-based sessions
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, { 
    ...options, 
    headers, 
    cache: "no-store",
    credentials: "include", // Include cookies for Better Auth session
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Something went wrong");
  }

  return response.json();
};
