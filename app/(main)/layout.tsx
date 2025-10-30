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

// Dashboard stats data
const stats = [
  {
    title: "Total Users",
    value: "12,345",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Revenue",
    value: "$45,678",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Active Sessions",
    value: "2,456",
    change: "+15%",
    changeType: "positive" as const,
    icon: Activity,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Page Views",
    value: "34,567",
    change: "-2.4%",
    changeType: "negative" as const,
    icon: Eye,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

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
        </SidebarInset>
      </SidebarProvider>
      {children}
    </>
  );
};

export default DashboardLayout;
