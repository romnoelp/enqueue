"use client";

import { apiFetch } from "@/app/lib/backend/api";
import { useEffect, useState } from "react";

const Employees = () => {
  const [employees, setEmployees] = useState<any>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      const data = await apiFetch("/admin/employees");
      setEmployees(data);
    };
    fetchEmployees();
  }, []);
  console.log("Emp", employees);
  return <div>Employees page</div>;
};

export default Employees;
