"use client";

import type Employee from "@/types/employee";
import type { UserRole } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { SELECTABLE_ROLES, getRoleLabel } from "../_utils/role";
// Icons are handled inside RoleOptionButton
import RoleOptionButton from "./RoleOptionButton";
import React from "react";

type ChangeRoleDialogProps = {
  open: boolean;
  employee: Employee | null;
  selectedRole: UserRole | null;
  onSelectedRoleChange: (role: UserRole) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  errorMessage?: string | null;
};

const ChangeRoleDialog = ({
  open,
  employee,
  selectedRole,
  onSelectedRoleChange,
  onClose,
  onSave,
  isSaving,
}: ChangeRoleDialogProps) => {
  const isSaveDisabled =
    isSaving || !employee || !selectedRole || selectedRole === employee.role;

  const fromRoleLabel = employee ? getRoleLabel(employee.role) : null;
  const toRoleLabel = selectedRole ? getRoleLabel(selectedRole) : null;
  const firstSelectable = SELECTABLE_ROLES.find(
    (candidateRole) => candidateRole !== employee?.role
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change employee role</DialogTitle>
          <DialogDescription>
            <Badge variant="secondary">Current: {fromRoleLabel}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex w-full items-center gap-2 overflow-x-auto">
            {SELECTABLE_ROLES.filter((role) => role !== employee?.role).map(
              (role) => {
                const isSelected = selectedRole === role;
                return (
                  <RoleOptionButton
                    key={role}
                    role={role}
                    isSelected={isSelected}
                    onSelect={onSelectedRoleChange}
                    autoFocus={!selectedRole && role === firstSelectable}
                  />
                );
              }
            )}
          </div>

          {employee && selectedRole && selectedRole !== employee.role ? (
            <p className="text-xs text-muted-foreground">
              Will change from{" "}
              <span className="font-medium">{fromRoleLabel}</span> to{" "}
              <span className="font-medium">{toRoleLabel}</span>.
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            className="mt-4"
            onClick={onSave}
            disabled={isSaveDisabled}
            aria-disabled={isSaveDisabled}
            aria-label="Change role"
          >
            {isSaving ? <BounceLoader /> : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRoleDialog;
