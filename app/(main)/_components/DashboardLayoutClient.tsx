"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { DashboardHeader } from "@/components/ui/dashboard-header";

interface DashboardLayoutClientProps {
  children: ReactNode;
  defaultOpen: boolean;
}

const DashboardLayoutClient = ({
  children,
  defaultOpen,
}: DashboardLayoutClientProps) => {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      // Trigger Next.js to revalidate and refresh server data
      router.refresh();
    } catch (err) {
      console.error("Refresh failed", err);
    } finally {
      // Ensure spinner shows briefly even if refresh is fast
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar />
      <SidebarInset>
        <DashboardHeader
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayoutClient;
