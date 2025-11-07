"use client";

import { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { DashboardHeader } from "@/components/ui/dashboard-header";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const handleRefresh = () => {
    console.log("Refresh");
  };

  const handleExport = () => {
    console.log("Export");
  };

  return (
    <>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <DashboardHeader
            onRefresh={handleRefresh}
            onExport={handleExport}
            isRefreshing={false}
          />
          <div style={{ viewTransitionName: 'main-content' }}>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default DashboardLayout;
