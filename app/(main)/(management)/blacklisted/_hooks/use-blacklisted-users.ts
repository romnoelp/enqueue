import { useState, useEffect } from "react";
import { apiFetch } from "@/app/lib/backend/api";
import { normalizeBlacklistedResponse } from "../_utils/data";
import type { Blacklist } from "@/types/blacklist";
import { toast } from "sonner";

// Custom hook to fetch and manage blacklisted users
export const useBlacklistedUsers = () => {
  const [blacklisted, setBlacklisted] = useState<Blacklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlacklisted = async () => {
      try {
        const data = await apiFetch("/admin/get-blacklist");
        setBlacklisted(normalizeBlacklistedResponse(data));
      } catch (error) {
        console.error("Failed to load blacklisted users", error);
        toast.error("Failed to load blacklisted users");
        setBlacklisted([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlacklisted();
  }, []);

  const addUser = (newUser: Blacklist) => {
    setBlacklisted((prevList) => [newUser, ...prevList]);
  };

  const removeUser = (targetUser: Blacklist) => {
    setBlacklisted((prevList) => prevList.filter((user) => user.email !== targetUser.email));
  };

  return {
    blacklisted,
    isLoading,
    addUser,
    removeUser,
  };
};
