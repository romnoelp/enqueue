"use client";

import { Button } from "@/components/ui/button";
import { getRoleLabel } from "../_utils/role";
import ROLE_ICONS from "../_utils/icons";
import type { UserRole } from "@/types/auth";
import { Info } from "lucide-react";
import React from "react";

interface RoleOptionButtonProps {
  role: UserRole | string;
  isSelected: boolean;
  onSelect: (role: UserRole) => void;
  autoFocus?: boolean;
}

const RoleOptionButton = ({
  role,
  isSelected,
  onSelect,
  autoFocus,
}: RoleOptionButtonProps) => {
  const Icon = ROLE_ICONS[role] ?? Info;
  return (
    <Button
      key={role}
      type="button"
      variant={isSelected ? "default" : "outline"}
      size="sm"
      className="justify-start gap-2 shrink-0 h-8 px-3 min-w-28"
      onClick={() => onSelect(role as UserRole)}
      aria-pressed={isSelected}
      autoFocus={autoFocus}
    >
      <Icon className="h-4 w-4" />
      <span className="leading-none">{getRoleLabel(role as UserRole)}</span>
    </Button>
  );
};

export default RoleOptionButton;
