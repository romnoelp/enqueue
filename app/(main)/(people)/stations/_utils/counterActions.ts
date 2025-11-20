import { apiFetch } from "@/app/lib/backend/api";

export type CounterApiItem = {
  id?: string | number;
  counterNumber?: number;
  uid?: string | null;
};

export async function fetchCountersApi(stationId: string | number) {
  return apiFetch<{ counterList?: Array<CounterApiItem> }>(
    `/counter/get/${encodeURIComponent(String(stationId))}`
  );
}

export async function fetchAvailableEmployees() {
  return apiFetch<{
    availableCashiers?: Array<{ uid: string; name?: string; email?: string }>;
  }>(`/admin/available-cashier-employees`);
}

export async function fetchAssignedUserLabels(uidList: string[]) {
  const emails: Record<string, string> = {};
  await Promise.all(
    uidList.map(async (uid) => {
      try {
        const userResponse = await apiFetch<{ userData?: { email?: string; name?: string; displayName?: string } }>(
          `/admin/user-data/${encodeURIComponent(String(uid))}`
        );
        const userData = userResponse?.userData ?? {};
        const label = userData.name || userData.displayName || userData.email || uid;
        if (label) emails[uid] = label;
      } catch {
        // ignore
      }
    })
  );
  return emails;
}

export async function createCounterApi(stationId: string | number, counterNumber: number) {
  return apiFetch<{ counter?: { id?: string; counterNumber?: number } }>(
    `/counter/add/${encodeURIComponent(String(stationId))}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ counterNumber }),
    }
  );
}

export async function updateCounterApi(
  stationId: string | number,
  counterId: string | number,
  body: Record<string, unknown>
) {
  return apiFetch(
    `/counter/update/${encodeURIComponent(String(stationId))}/${encodeURIComponent(String(counterId))}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

export async function deleteCounterApi(stationId: string | number, counterId: string | number) {
  return apiFetch(
    `/counter/delete/${encodeURIComponent(String(stationId))}/${encodeURIComponent(String(counterId))}`,
    { method: "DELETE" }
  );
}
