type NextRequestInit = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

type ApiFetchOptions = NextRequestInit & {
  /** When false, the raw Response is returned instead of parsed JSON. */
  parseJson?: boolean;
  /** Key/value query params appended to the request URL. */
  query?: Record<string, string | number | boolean | null | undefined> | URLSearchParams;
};

const isFormDataLike = (value: unknown): value is FormData | URLSearchParams => {
  return value instanceof FormData || value instanceof URLSearchParams;
};

const resolveUrl = (endpoint: string) => {
  if (/^https?:/i.test(endpoint)) {
    return endpoint;
  }

  // Use same-origin proxy by default to avoid CORS when calling Firebase Functions.
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const base = envBase && !/^https?:/i.test(envBase) ? envBase : "/api/backend";
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  return `${normalizedBase}${normalizedPath}`;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

let cachedFirebaseIdToken: string | null = null;
let cachedFirebaseIdTokenFetchedAt = 0;

const maybeGetFirebaseIdToken = async (): Promise<string | null> => {
  // Server-side requests should not try to use browser auth.
  if (typeof window === "undefined") {
    return null;
  }

  // Best-effort caching: avoid calling getSession/getIdToken on every request.
  // Firebase ID tokens are valid for ~1 hour, but refreshes are handled by the SDK.
  if (cachedFirebaseIdToken && Date.now() - cachedFirebaseIdTokenFetchedAt < 5 * 60 * 1000) {
    return cachedFirebaseIdToken;
  }

  try {
    const [{ auth }, { GoogleAuthProvider, signInWithCredential }, { getSession }] = await Promise.all([
      import("./firebase"),
      import("firebase/auth"),
      import("next-auth/react"),
    ]);

    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      cachedFirebaseIdToken = token;
      cachedFirebaseIdTokenFetchedAt = Date.now();
      return token;
    }

    const session = await getSession();
    const googleIdToken = session?.googleIdToken;
    if (!googleIdToken) {
      return null;
    }

    const credential = GoogleAuthProvider.credential(googleIdToken);
    const result = await signInWithCredential(auth, credential);
    const token = await result.user.getIdToken();
    cachedFirebaseIdToken = token;
    cachedFirebaseIdTokenFetchedAt = Date.now();
    return token;
  } catch {
    return null;
  }
};

// Fetch wrapper for API routes with Better Auth cookie-based sessions
export const apiFetch = async <T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> => {
  const {
    parseJson = true,
    body,
    headers,
    cache,
    credentials,
    query,
    method,
    ...rest
  } = options;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  if (!requestHeaders.has("Authorization")) {
    const firebaseIdToken = await maybeGetFirebaseIdToken();
    if (firebaseIdToken) {
      requestHeaders.set("Authorization", `Bearer ${firebaseIdToken}`);
    }
  }

  let requestBody: BodyInit | undefined = body as BodyInit | undefined;

  if (requestBody !== undefined && !isFormDataLike(requestBody)) {
    if (!requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }

    if (requestHeaders.get("Content-Type") === "application/json" && typeof requestBody !== "string") {
      requestBody = JSON.stringify(requestBody);
    }
  }

  let url = resolveUrl(endpoint);

  if (query) {
    const searchParams = query instanceof URLSearchParams ? query : new URLSearchParams();

    if (!(query instanceof URLSearchParams)) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    if (queryString) {
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}${queryString}`;
    }
  }

  const requestInit: RequestInit = {
    ...rest,
    body: requestBody,
    headers: requestHeaders,
    cache: cache ?? "no-store",
    credentials: credentials ?? "include",
    method: method ?? "GET",
  };

  const response = await fetch(url, requestInit);

  if (!response.ok) {
    let errorPayload: unknown = null;
    const contentType = response.headers.get("content-type") ?? "";

    try {
      errorPayload = contentType.includes("application/json") ? await response.json() : await response.text();
    } catch {
      errorPayload = response.statusText || "Request failed";
    }

    const message =
      typeof errorPayload === "string"
        ? errorPayload
        : (errorPayload as { message?: string }).message ?? JSON.stringify(errorPayload);

    throw new ApiError(
      response.status,
      message || `Request failed with status ${response.status}`,
      errorPayload
    );
  }

  if (!parseJson) {
    return response as unknown as T;
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  // Some legacy endpoints send an empty JSON body. Guard against parse errors.
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (parseError) {
    throw new ApiError(response.status, "Failed to parse JSON response", {
      cause: parseError instanceof Error ? parseError.message : parseError,
      body: text,
    });
  }
};
