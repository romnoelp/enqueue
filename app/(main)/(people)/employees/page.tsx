"use client";

import { apiFetch } from "@/app/lib/backend/api";
import { AuthUser } from "@/types";
import { useEffect, useState } from "react";

interface EmployeesResponse {
  employees: AuthUser[];
}

const Employees = () => {
  const [employees, setEmployees] = useState<EmployeesResponse | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      const data = await apiFetch("/admin/employees");
      setEmployees(data as EmployeesResponse);
    };
    fetchEmployees();
  }, []);
  
  console.log("Emp", employees);
  return <div>Employees page</div>;
};

export default Employees;
