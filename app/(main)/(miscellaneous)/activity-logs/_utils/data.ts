import { apiFetch } from "@/app/lib/backend/api";
import type { ActivityLog } from "@/types/activity";

export const fetchLogs = async (
  startDate: Date,
  endDate: Date
): Promise<ActivityLog[]> => {
  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
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
