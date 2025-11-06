import type Employee from "@/types/employee";
import type { UserRole } from "@/types/auth";

const updateEmployeeRoleInList = (
  list: Employee[],
  uid: string,
  role: UserRole,
): Employee[] => {
  return list.map((employee) =>
    employee.uid === uid ? { ...employee, role } : employee,
  );
};

export default updateEmployeeRoleInList;
