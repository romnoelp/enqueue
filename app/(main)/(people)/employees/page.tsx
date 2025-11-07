"use client";

import { apiFetch } from "@/app/lib/backend/api";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as motion from "motion/react-client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import EmployeeCard from "@/components/mvpblocks/employee-card";
import type Employee from "@/types/employee";
import { UserRole } from "@/types/auth";
import Actions from "./_components/Actions";
import { searchAndFilterEmployees } from "@/lib/employee-utils";
import {
  setEmployeeRole,
  getRoleLabel,
} from "@/app/(main)/(people)/employees/_utils/role";
import { normalizeEmployeesResponse } from "@/app/(main)/(people)/employees/_utils/data";
import ChangeRoleDialog from "./_components/ChangeRoleDialog";
import { toast } from "sonner";
import updateEmployeeRoleInList from "@/app/(main)/(people)/employees/_utils/employee-list";

const Employee = () => {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await apiFetch("/admin/employees");
        setEmployees(normalizeEmployeesResponse(data));
      } catch (error) {
        console.error("Failed to load employees", error);
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return searchAndFilterEmployees(employees, searchQuery, roleFilter);
  }, [employees, searchQuery, roleFilter]);

  const openRoleDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedRole(null);
    setErrorMessage(null);
  };

  const closeRoleDialog = () => {
    setSelectedEmployee(null);
    setSelectedRole(null);
    setIsSaving(false);
    setErrorMessage(null);
  };

  const handleSaveRole = async () => {
    if (!selectedEmployee?.uid) {
      closeRoleDialog();
      return;
    }
    if (!selectedRole || selectedRole === selectedEmployee.role) {
      closeRoleDialog();
      return;
    }
    try {
      setIsSaving(true);
      setErrorMessage(null);
      await setEmployeeRole(selectedEmployee.uid, selectedRole);

      setEmployees((prevEmployees) =>
        updateEmployeeRoleInList(
          prevEmployees,
          selectedEmployee.uid!,
          selectedRole
        )
      );
      toast.success(
        `${selectedEmployee.name}'s role changed to ${getRoleLabel(
          selectedRole
        )}`
      );
      closeRoleDialog();
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
          ? error.message
          : "Failed to update role";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!session) {
    return (
      <div className="h-full flex justify-center items-center">
        <BounceLoader />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-full flex flex-col p-4">
        <Actions
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          totalCount={employees.length}
          filteredCount={filteredEmployees.length}
        />

        {isLoading ? (
          <motion.div
            className="flex-1 flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 70 }}
          >
            <BounceLoader />
          </motion.div>
        ) : (
          <ScrollArea className="h-full flex-1 mt-4">
            {filteredEmployees.length === 0 && (
              <motion.div
                className="flex justify-center items-center h-64"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-gray-500 dark:text-gray-400">
                  No employees found matching your criteria.
                </p>
              </motion.div>
            )}

            {filteredEmployees.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredEmployees.map((employee, index) => (
                  <motion.button
                    key={employee.uid ?? employee.email}
                    type="button"
                    onClick={() => openRoleDialog(employee)}
                    className="text-left"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.02 * index,
                      type: "spring",
                      stiffness: 70,
                    }}
                  >
                    <EmployeeCard
                      name={employee.name}
                      email={employee.email}
                      role={employee.role}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </div>

      <ChangeRoleDialog
        open={!!selectedEmployee}
        employee={selectedEmployee}
        selectedRole={selectedRole}
        onSelectedRoleChange={(newRole) => setSelectedRole(newRole)}
        onClose={closeRoleDialog}
        onSave={handleSaveRole}
        isSaving={isSaving}
        errorMessage={errorMessage}
      />
    </div>
  );
};
export default Employee;
