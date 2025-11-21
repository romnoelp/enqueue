"use client";

import { ReactNode } from "react";
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
  const handleRefresh = () => {
    console.log("Refresh");
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar />
      <SidebarInset>
        <DashboardHeader onRefresh={handleRefresh} isRefreshing={false} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayoutClient;
