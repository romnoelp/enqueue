import { apiFetch } from "@/app/lib/backend/api";
import { setEmployeeRole } from "@/app/(main)/(people)/employees/_utils/role";
import type { UserRole } from "@/types/auth";

const REJECT_REASON = "Rejected by admin";

// Accept pending user and assign role
const acceptPendingUser = (userId: string, role: UserRole) =>
  setEmployeeRole(userId, role);

// Reject pending user and add to blacklist
const rejectPendingUser = (email: string) =>
  apiFetch("/admin/block-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, reason: REJECT_REASON }),
  });

export { acceptPendingUser, rejectPendingUser };


