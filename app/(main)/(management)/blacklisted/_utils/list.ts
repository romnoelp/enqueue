import type { Blacklist } from "@/types/blacklist";

// Remove user from blacklist
const removeBlacklistedUser = (blacklist: Blacklist[], targetUser: Blacklist): Blacklist[] => {
  const { email } = targetUser;

  return blacklist.filter((user) => user.email !== email);
};

// Search blacklisted users by email or reason
const searchBlacklistedUsers = (blacklist: Blacklist[], searchQuery: string): Blacklist[] => {
  if (!searchQuery.trim()) return blacklist;

  const lowerQuery = searchQuery.toLowerCase();
  return blacklist.filter(
    (user) =>
      user.email.toLowerCase().includes(lowerQuery) ||
      user.reason.toLowerCase().includes(lowerQuery)
  );
};

export { removeBlacklistedUser, searchBlacklistedUsers };


