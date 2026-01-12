import { apiFetch } from "@/app/lib/backend/api";

// Remove email from blacklist
const unblockEmail = (email: string) =>
  apiFetch(`/admin/blacklist/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });

// Add email to blacklist with reason
const blockEmail = (email: string, reason: string) =>
  apiFetch("/admin/blacklist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, reason }),
  });

export { unblockEmail, blockEmail };


