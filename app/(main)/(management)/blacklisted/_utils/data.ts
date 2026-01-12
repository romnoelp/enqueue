import type { Blacklist } from "@/types/blacklist";

type RawBlacklistedUser = {
  email: string;
  reason: string;
};

// Normalize API response to Blacklist array
const normalizeBlacklistedResponse = (apiResponse: unknown): Blacklist[] => {
  const users =
    apiResponse && typeof apiResponse === "object" && "blacklist" in (apiResponse as Record<string, unknown>)
      ? ((apiResponse as { blacklist?: unknown }).blacklist as unknown[] | undefined) ?? []
      : apiResponse && typeof apiResponse === "object" && "data" in (apiResponse as Record<string, unknown>)
      ? ((apiResponse as { data?: unknown }).data as unknown[] | undefined) ?? []
      : Array.isArray(apiResponse)
      ? (apiResponse as unknown[])
      : [];

  return users
    .filter((user): user is RawBlacklistedUser => !!user && typeof user === "object" && "email" in user)
    .map((user) => user as RawBlacklistedUser)
    .map((user): Blacklist => ({
      email: user.email,
      reason: user.reason ?? "No reason provided",
    }));
};

export { normalizeBlacklistedResponse };
export type { RawBlacklistedUser };


