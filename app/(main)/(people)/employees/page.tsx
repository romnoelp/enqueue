"use client";

import { authClient } from "@/app/lib/auth-client";

const Employees = () => {
  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient.useSession();

  return <div>Employees page</div>;
};

export default Employees;
