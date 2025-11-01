"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { SidebarMenuButton } from "@/components/ui/sidebar";

const ModeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // useSyncExternalStore avoids the setState-in-effect warning
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return null;

  const current = theme === "system" ? resolvedTheme : theme;

  return (
    <SidebarMenuButton
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
    >
      {current === "dark" ? <Sun /> : <Moon />}
      <span>{current === "dark" ? "Light Mode" : "Dark Mode"}</span>
    </SidebarMenuButton>
  );
};

export default ModeToggle;
