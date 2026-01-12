import { apiFetch } from "@/app/lib/backend/api";
import type { UserRole } from "@/types/auth";

export const setEmployeeRole = async (uid: string, role: UserRole) => {
  return apiFetch<{ message: string }>("/admin/assign-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: uid, role }),
  });
};

export const SELECTABLE_ROLES: UserRole[] = [
  "superAdmin",
  "admin",
  "cashier",
  "information",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  superAdmin: "Super Admin",
  admin: "Admin",
  cashier: "Cashier",
  information: "Information",
  pending: "Pending",
};

export const getRoleLabel = (role: UserRole): string => ROLE_LABELS[role] ?? role;
