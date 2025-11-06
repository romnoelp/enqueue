import type Employee from "@/types/employee";

export type RawPendingUser = {
  uid: string;
  email?: string;
  name?: string;
  role?: string;
  createdAt?: number;
};

export const normalizePendingUsersResponse = (data: unknown): Employee[] => {
  const users =
    data && typeof data === "object" && "pendingUsers" in (data as Record<string, unknown>)
      ? ((data as { pendingUsers?: unknown }).pendingUsers as unknown[] | undefined) ?? []
      : Array.isArray(data)
      ? (data as unknown[])
      : [];

  return users
    .filter((u): u is RawPendingUser => !!u && typeof u === "object")
    .map((u) => u as RawPendingUser)
    .map((u): Employee => ({
      uid: u.uid,
      name: u.name ?? u.email?.split("@")[0] ?? "Unknown",
      email: u.email ?? "unknown@example.com",
      role: (u.role as Employee["role"]) ?? "pending",
    }));
};
