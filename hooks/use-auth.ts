"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified: boolean;
}

interface Session {
  user: User;
  session: {
    userId: string;
    expiresAt: Date;
  };
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/get-session", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setSession(data);
        } else {
          setSession(null);
          // Optionally redirect to home if not authenticated
          // router.push("/");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signOut = async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
      setSession(null);
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return {
    session,
    user: session?.user,
    loading,
    isAuthenticated: !!session,
    signOut,
  };
}
