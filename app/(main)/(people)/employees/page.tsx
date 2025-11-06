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

const Employee = () => {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await apiFetch<{ employees: Employee[] } | Employee[]>("/admin/employees");
        console.log("Fetched employees:", data); // Debug log
        
        // Handle both response formats
        if (Array.isArray(data)) {
          setEmployees(data);
        } else if (data && typeof data === 'object' && 'employees' in data) {
          setEmployees(data.employees);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error("Failed to load employees", error);
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Filter employees based on search and role filter
  const filteredEmployees = useMemo(() => {
    return searchAndFilterEmployees(employees, searchQuery, roleFilter);
  }, [employees, searchQuery, roleFilter]);

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
        <ScrollArea className="flex-1 mt-4">
          {isLoading && (
            <motion.div
              className="absolute inset-0 flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 70 }}
            >
              <BounceLoader />
            </motion.div>
          )}

          {!isLoading && filteredEmployees.length === 0 && (
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredEmployees.map((emp, index) => (
              <motion.div
                key={emp.uid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.02 * index,
                  type: "spring",
                  stiffness: 70,
                }}
              >
                <EmployeeCard
                  name={emp.name}
                  email={emp.email}
                  role={emp.role}
                />
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
export default Employee;
