import { ReactNode } from "react";
import { cookies } from "next/headers";
import DashboardLayoutClient from "./_components/DashboardLayoutClient";

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <DashboardLayoutClient defaultOpen={defaultOpen}>
      <div className="p-6 h-full w-full">{children}</div>
    </DashboardLayoutClient>
  );
};

export default DashboardLayout;
