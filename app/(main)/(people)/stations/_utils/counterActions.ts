// // import { apiFetch } from "@/app/lib/backend/api";

// export type CounterApiItem = {
//   id?: string | number;
//   number?: number;
//   stationId?: string | number;
//   cashierUid?: string | null;
// };

// export async function fetchCountersApi(stationId: string | number) {
//   const data = await apiFetch<{ counters?: Array<CounterApiItem>; nextCursor?: string | null }>(
//     `/counters/counters`,
//     {
//       query: { stationId: String(stationId), limit: 200 },
//     }
//   );

//   const counters = Array.isArray(data?.counters) ? data.counters : [];
//   // Backend currently does not reliably filter by stationId, so filter client-side.
//   const filtered = counters.filter(
//     (counter) => String(counter.stationId ?? "") === String(stationId)
//   );

//   return { counterList: filtered, nextCursor: data?.nextCursor ?? null };
// }

// export async function fetchAvailableEmployees() {
//   return apiFetch<{
//     availableCashiers?: Array<{ uid: string; name?: string; email?: string }>;
//   }>(`/admin/available-cashier-employees`);
// }

// export async function fetchAssignedUserLabels(uidList: string[]) {
//   const emails: Record<string, string> = {};
//   await Promise.all(
//     uidList.map(async (uid) => {
//       try {
//         const userResponse = await apiFetch<{ userData?: { email?: string; name?: string; displayName?: string } }>(
//           `/admin/user-data/${encodeURIComponent(String(uid))}`
//         );
//         const userData = userResponse?.userData ?? {};
//         const label = userData.name || userData.displayName || userData.email || uid;
//         if (label) emails[uid] = label;
//       } catch {
//         // ignore
//       }
//     })
//   );
//   return emails;
// }

// export async function createCounterApi(stationId: string | number, counterNumber: number) {
//   return apiFetch<{ message?: string; counter?: CounterApiItem }>(
//     `/counters/counters`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ stationId: String(stationId), number: counterNumber }),
//     }
//   );
// }

// export async function updateCounterApi(
//   counterId: string | number,
//   body: { stationId: string | number; number: number; cashierUid?: string | null }
// ) {
//   return apiFetch(
//     `/counters/counters/${encodeURIComponent(String(counterId))}`,
//     {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     }
//   );
// }

// export async function deleteCounterApi(
//   counterId: string | number,
//   body: { stationId: string | number; number: number; cashierUid?: string | null }
// ) {
//   return apiFetch(
//     `/counters/counters/${encodeURIComponent(String(counterId))}`,
//     {
//       method: "DELETE",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     }
//   );
// }
