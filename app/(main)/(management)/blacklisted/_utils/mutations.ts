import { apiFetch } from "@/app/lib/backend/api";

// Remove email from blacklist
const unblockEmail = (email: string) =>
  apiFetch(`/admin/unblock-email/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });

// Add email to blacklist with reason
const blockEmail = (email: string, reason: string) =>
  apiFetch("/admin/block-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, reason }),
  });

export { unblockEmail, blockEmail };


