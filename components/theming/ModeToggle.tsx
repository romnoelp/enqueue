"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ThemeToggler } from "@/components/animate-ui/primitives/effects/theme-toggler";
import { useSyncExternalStore } from "react";

const ModeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // useSyncExternalStore avoids the hydration mismatch
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <SidebarMenuButton>
        <Moon />
        <span>Dark Mode</span>
      </SidebarMenuButton>
    );
  }

  return (
    <ThemeToggler
      theme={theme as "light" | "dark" | "system"}
      resolvedTheme={resolvedTheme as "light" | "dark"}
      setTheme={setTheme}
      direction="ltr"
    >
      {({ effective, resolved, toggleTheme }) => {
        const current = effective === "system" ? resolved : effective;

        return (
          <SidebarMenuButton
            onClick={() => toggleTheme(current === "dark" ? "light" : "dark")}
          >
            {current === "dark" ? <Sun /> : <Moon />}
            <span>{current === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </SidebarMenuButton>
        );
      }}
    </ThemeToggler>
  );
};

export default ModeToggle;
