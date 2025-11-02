"use client";

import { apiFetch } from "@/app/lib/backend/api";
import { Employees } from "@/types";
import { useEffect, useState } from "react";

const Employee = () => {
  const [employees, setEmployees] = useState<Employees | null>(null);
                                
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
  const data = await apiFetch<Employees>("/admin/employees");
        setEmployees(data);
      } catch (error) {
        console.error("Failed to load employees", error);
        setEmployees(null);
      }
    };
    fetchEmployees();
  }, []);
  
  console.log(employees);
  return <div>Employees page</div>;
};

export default Employee;
