"use client";

import { apiFetch } from "@/app/lib/backend/api";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import MeshyCards from "@/components/mvpblocks/meshy-cards";
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
  return (
    <div className="border border-red-900 h-full flex justify-center items-center">
      <div className="border border-orange-500">
        {employees ? (
          employees?.employees.map((employee) => (
            <MeshyCards
              key={employee.uid}
              name={employee.name}
              email={employee.email}
              role={employee.role}
            />
          ))
        ) : (
          <BounceLoader />
        )}
      </div>
    </div>
  );
};

export default Employee;
