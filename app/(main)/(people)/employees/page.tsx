"use client";

import { apiFetch } from "@/app/lib/backend/api";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as motion from "motion/react-client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import EmployeeCard from "@/components/mvpblocks/employee-card";
import type Employee from "@/types/employee";

const employeesList: Employee[] = [
  {
    uid: "emp-001",
    name: "Romnoel Petracorta",
    role: "admin",
    email: "alice.johnson@neu.edu.ph",
  },
  {
    uid: "emp-002",
    name: "Lourie Jane Abao",
    role: "cashier",
    email: "marcus.lee@neu.edu.ph",
  },
  {
    uid: "emp-003",
    name: "Richmond Baltazar",
    role: "information",
    email: "sofia.rivera@neu.edu.ph",
  },
  {
    uid: "emp-004",
    name: "Kevin Ros Lisboa",
    role: "pending",
    email: "david.kim@neu.edu.ph",
  },
  {
    uid: "emp-005",
    name: "Rea Angeline Petracorta",
    role: "cashier",
    email: "nina.patel@neu.edu.ph",
  },
  {
    uid: "emp-006",
    name: "Ethan Wright",
    role: "superAdmin",
    email: "ethan.wright@neu.edu.ph",
  },
  {
    uid: "emp-007",
    name: "Clara Zhang",
    role: "information",
    email: "clara.zhang@neu.edu.ph",
  },
  {
    uid: "emp-008",
    name: "Lucas Martins",
    role: "cashier",
    email: "lucas.martins@neu.edu.ph",
  },
  {
    uid: "emp-009",
    name: "Olivia Brown",
    role: "admin",
    email: "olivia.brown@neu.edu.ph",
  },
  {
    uid: "emp-010",
    name: "Henry Carter",
    role: "information",
    email: "henry.carter@neu.edu.ph",
  },
  {
    uid: "emp-011",
    name: "Amelia Evans",
    role: "superAdmin",
    email: "amelia.evans@neu.edu.ph",
  },
  {
    uid: "emp-012",
    name: "Noah Anderson",
    role: "pending",
    email: "noah.anderson@neu.edu.ph",
  },
  {
    uid: "emp-013",
    name: "Mia Torres",
    role: "cashier",
    email: "mia.torres@neu.edu.ph",
  },
  {
    uid: "emp-014",
    name: "Liam Robinson",
    role: "admin",
    email: "liam.robinson@neu.edu.ph",
  },
  {
    uid: "emp-015",
    name: "Emma Wilson",
    role: "information",
    email: "emma.wilson@neu.edu.ph",
  },
  {
    uid: "emp-016",
    name: "James Hall",
    role: "cashier",
    email: "james.hall@neu.edu.ph",
  },
  {
    uid: "emp-017",
    name: "Ava Scott",
    role: "pending",
    email: "ava.scott@neu.edu.ph",
  },
  {
    uid: "emp-018",
    name: "Benjamin Lopez",
    role: "admin",
    email: "benjamin.lopez@neu.edu.ph",
  },
  {
    uid: "emp-019",
    name: "Ella Murphy",
    role: "information",
    email: "ella.murphy@neu.edu.ph",
  },
  {
    uid: "emp-020",
    name: "Daniel Hughes",
    role: "superAdmin",
    email: "daniel.hughes@neu.edu.ph",
  },
  {
    uid: "emp-021",
    name: "Harper Brooks",
    role: "admin",
    email: "harper.brooks@neu.edu.ph",
  },
  {
    uid: "emp-022",
    name: "Isaac Turner",
    role: "cashier",
    email: "isaac.turner@neu.edu.ph",
  },
  {
    uid: "emp-023",
    name: "Zoe Clark",
    role: "information",
    email: "zoe.clark@neu.edu.ph",
  },
  {
    uid: "emp-024",
    name: "Evelyn Reed",
    role: "pending",
    email: "evelyn.reed@neu.edu.ph",
  },
  {
    uid: "emp-025",
    name: "Mason Baker",
    role: "cashier",
    email: "mason.baker@neu.edu.ph",
  },
  {
    uid: "emp-026",
    name: "Chloe Adams",
    role: "information",
    email: "chloe.adams@neu.edu.ph",
  },
  {
    uid: "emp-027",
    name: "Jack Murphy",
    role: "admin",
    email: "jack.murphy@neu.edu.ph",
  },
  {
    uid: "emp-028",
    name: "Isabella Flores",
    role: "cashier",
    email: "isabella.flores@neu.edu.ph",
  },
  {
    uid: "emp-029",
    name: "Matthew Rivera",
    role: "pending",
    email: "matthew.rivera@neu.edu.ph",
  },
  {
    uid: "emp-030",
    name: "Scarlett Parker",
    role: "superAdmin",
    email: "scarlett.parker@neu.edu.ph",
  },
];

const Employee = () => {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[] | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await apiFetch<Employee[]>("/admin/employees");
        setEmployees(data);
      } catch (error) {
        console.error("Failed to load employees", error);
        setEmployees(null);
      }
    };
    fetchEmployees();
  }, []);

  if (!session) {
    return (
      <div className="h-full flex justify-center items-center">
        <BounceLoader />
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <ScrollArea className="h-full p-4">
        {!employees && (
          <motion.div
            className="absolute inset-0 flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 70 }}
          >
            <BounceLoader />
          </motion.div>
        )}

        {employees && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {employeesList.map((emp, index) => (
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
        )}
      </ScrollArea>
    </div>
  );
};
export default Employee;
