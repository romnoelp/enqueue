import type Employee from "@/types/employee";

type RawPendingUser = {
  uid: string;
  email?: string;
  name?: string;
  role?: string;
  createdAt?: number;
};

// Normalize API response to Employee array
const normalizePendingUsersResponse = (apiResponse: unknown): Employee[] => {
  const users =
    apiResponse && typeof apiResponse === "object" && "pendingUsers" in (apiResponse as Record<string, unknown>)
      ? ((apiResponse as { pendingUsers?: unknown }).pendingUsers as unknown[] | undefined) ?? []
      : Array.isArray(apiResponse)
      ? (apiResponse as unknown[])
      : [];

  return users
    .filter((user): user is RawPendingUser => !!user && typeof user === "object")
    .map((user) => user as RawPendingUser)
    .map((user): Employee => ({
      uid: user.uid,
      name: user.name ?? user.email?.split("@")[0] ?? "Unknown",
      email: user.email ?? "unknown@example.com",
      role: (user.role as Employee["role"]) ?? "pending",
    }));
};

export { normalizePendingUsersResponse };

export type { RawPendingUser };

