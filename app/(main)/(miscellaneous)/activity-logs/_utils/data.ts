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

  const params = new URLSearchParams({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  });

  try {
    const res = await apiFetch<{ activities: ActivityLog[] }>(
      `/admin/get-activity?${params}`
    );
    return res.activities ?? [];
  } catch {
    return [];
  }
};
