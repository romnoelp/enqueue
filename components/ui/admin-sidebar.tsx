"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Activity,
  BarChart3,
  ShieldMinus,
  QrCode,
  Clock,
  ChevronUp,
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";

import { signOut, useSession } from "next-auth/react";
import ModeToggle from "../theming/ModeToggle";

const menuItems = [
  { title: "Employees", icon: Users, href: "/employees" },
  { title: "Stations", icon: QrCode, href: "/stations" },
  { title: "Pending Accounts", icon: Clock, href: "/pending-accounts" },
  { title: "Blacklisted", icon: ShieldMinus, href: "/blacklisted" },
  { title: "Activity", icon: Activity, href: "/activity-logs" },
  { title: "Analytics", icon: BarChart3, href: "/analytics" },
];
export const AdminSidebar = memo(() => {
  const { data: session } = useSession();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link prefetch={false} href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image src="/neu.png" alt="NEU Logo" width={80} height={80} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">enQueue</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link prefetch={false} href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ModeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
});

AdminSidebar.displayName = "AdminSidebar";
