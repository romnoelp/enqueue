import { apiFetch } from "@/app/lib/backend/api";
import { setEmployeeRole } from "@/app/(main)/(people)/employees/_utils/role";
import type { UserRole } from "@/types/auth";

const REJECT_REASON = "Rejected by admin";

export const acceptPendingUser = (uid: string, role: UserRole) =>
  setEmployeeRole(uid, role);

export const rejectPendingUser = (email: string) =>
  apiFetch("/admin/block-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, reason: REJECT_REASON }),
  });
