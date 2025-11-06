import type Employee from "@/types/employee";
import { UserRole } from "@/types/auth";

/**
 * Filter employees by search query (name or email)
 */
export const searchEmployees = (
  employees: Employee[],
  query: string
): Employee[] => {
  if (!query.trim()) {
    return employees;
  }

  const searchTerm = query.toLowerCase().trim();

  return employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm) ||
      employee.email.toLowerCase().includes(searchTerm)
  );
};

/**
 * Filter employees by role
 */
export const filterEmployeesByRole = (
  employees: Employee[],
  role: UserRole | "all"
): Employee[] => {
  if (role === "all") {
    return employees;
  }

  return employees.filter((employee) => employee.role === role);
};

/**
 * Combined search and filter for employees
 */
export const searchAndFilterEmployees = (
  employees: Employee[],
  searchQuery: string,
  roleFilter: UserRole | "all"
): Employee[] => {
  let result = employees;

  // Apply role filter first
  result = filterEmployeesByRole(result, roleFilter);

  // Then apply search
  result = searchEmployees(result, searchQuery);

  return result;
};
