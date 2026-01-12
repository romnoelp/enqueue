import { apiFetch } from "@/app/lib/backend/api";
import type { ActivityLog } from "@/types/activity";

export const fetchLogs = async (
  startDate: Date,
  endDate: Date
): Promise<ActivityLog[]> => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  try {
    const res = await apiFetch<{ data?: ActivityLog[] }>(
      "/admin/activity-logs",
      {
        query: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      }
    );

    return res.data ?? [];
  } catch {
    return [];
  }
};
