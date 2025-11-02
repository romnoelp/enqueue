"use client";

import { signIn as authSignIn } from "next-auth/react";

const signIn = async () => {
  await authSignIn("google", { 
    callbackUrl: "/dashboard",
  });
};

export default signIn;
