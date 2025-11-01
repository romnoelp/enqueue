"use client";

import { memo, use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Activity,
  BarChart3,
  ShieldMinus,
  QrCode,
  Clock,
  User2,
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { authClient } from "@/app/lib/authentication/auth-client";
import ModeToggle from "../theming/ModeToggle";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { Button } from "./button";

const menuItems = [
  { title: "Employees", icon: Users, href: "/employees" },
  { title: "Stations", icon: QrCode, href: "/stations" },
  { title: "Pending Accounts", icon: Clock, href: "/pending-accounts" },
  { title: "Blacklisted", icon: ShieldMinus, href: "/blacklisted" },
  { title: "Activity", icon: Activity, href: "/activity-logs" },
  { title: "Analytics", icon: BarChart3, href: "/analytics" },
];
import { useRouter } from "next/navigation";

export const AdminSidebar = memo(() => {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      const { data: session, error } = await authClient.getSession();
      if (active) setSession(session);
    };

    loadSession();
    return () => {
      active = false;
    };
  }, []);

  console.log(session);

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

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar>
                    {session?.user?.image ? (
                      <AvatarImage src={session.user.image} />
                    ) : (
                      <AvatarFallback>CN</AvatarFallback>
                    )}
                  </Avatar>

                  <p>{session?.user?.name ?? "Loading..."}</p>

                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <Button
                    size={"sm"}
                    variant={"ghost"}
                    className="w-full"
                    onClick={async () => {
                      await authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            router.push("/");
                          },
                        },
                      });
                    }}
                  >
                    Sign out
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
});

AdminSidebar.displayName = "AdminSidebar";
