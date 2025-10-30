"use client";

import { ReactNode } from "react";
import { useState, useEffect } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Users, Activity, DollarSign, Eye } from "lucide-react";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { RecentActivity } from "@/components/ui/recent-activity";
import { RevenueChart } from "@/components/ui/revenue-chart";
import { UsersTable } from "@/components/ui/users-table";
import { SystemStatus } from "@/components/ui/system-status";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    console.log("Exporting data...");
  };

  return (
    <>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <DashboardHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={handleRefresh}
            onExport={handleExport}
            isRefreshing={isRefreshing}
          />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default DashboardLayout;
