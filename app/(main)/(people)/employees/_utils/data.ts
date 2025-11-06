import type Employee from "@/types/employee";

export const normalizeEmployeesResponse = (data: unknown): Employee[] => {
  if (Array.isArray(data)) {
    return data as Employee[];
  }

  if (data && typeof data === "object" && "employees" in (data as Record<string, unknown>)) {
    const list = (data as { employees?: unknown }).employees;
    return Array.isArray(list) ? (list as Employee[]) : [];
  }

  return [];
};
