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
    name: "Alice Johnson",
    role: "Frontend Developer",
    email: "alice.johnson@example.com",
  },
  {
    uid: "emp-002",
    name: "Marcus Lee",
    role: "Backend Engineer",
    email: "marcus.lee@example.com",
  },
  {
    uid: "emp-003",
    name: "Sofia Rivera",
    role: "UI/UX Designer",
    email: "sofia.rivera@example.com",
  },
  {
    uid: "emp-004",
    name: "David Kim",
    role: "Project Manager",
    email: "david.kim@example.com",
  },
  {
    uid: "emp-005",
    name: "Nina Patel",
    role: "QA Engineer",
    email: "nina.patel@example.com",
  },
  {
    uid: "emp-006",
    name: "Ethan Wright",
    role: "DevOps Engineer",
    email: "ethan.wright@example.com",
  },
  {
    uid: "emp-007",
    name: "Clara Zhang",
    role: "Data Scientist",
    email: "clara.zhang@example.com",
  },
  {
    uid: "emp-008",
    name: "Lucas Martins",
    role: "Mobile Developer",
    email: "lucas.martins@example.com",
  },
  {
    uid: "emp-009",
    name: "Olivia Brown",
    role: "Product Designer",
    email: "olivia.brown@example.com",
  },
  {
    uid: "emp-010",
    name: "Henry Carter",
    role: "Full Stack Developer",
    email: "henry.carter@example.com",
  },
  {
    uid: "emp-011",
    name: "Amelia Evans",
    role: "Software Architect",
    email: "amelia.evans@example.com",
  },
  {
    uid: "emp-012",
    name: "Noah Anderson",
    role: "Cloud Engineer",
    email: "noah.anderson@example.com",
  },
  {
    uid: "emp-013",
    name: "Mia Torres",
    role: "Technical Writer",
    email: "mia.torres@example.com",
  },
  {
    uid: "emp-014",
    name: "Liam Robinson",
    role: "AI Engineer",
    email: "liam.robinson@example.com",
  },
  {
    uid: "emp-015",
    name: "Emma Wilson",
    role: "Scrum Master",
    email: "emma.wilson@example.com",
  },
  {
    uid: "emp-016",
    name: "James Hall",
    role: "Security Analyst",
    email: "james.hall@example.com",
  },
  {
    uid: "emp-017",
    name: "Ava Scott",
    role: "HR Manager",
    email: "ava.scott@example.com",
  },
  {
    uid: "emp-018",
    name: "Benjamin Lopez",
    role: "System Administrator",
    email: "benjamin.lopez@example.com",
  },
  {
    uid: "emp-019",
    name: "Ella Murphy",
    role: "Marketing Specialist",
    email: "ella.murphy@example.com",
  },
  {
    uid: "emp-020",
    name: "Daniel Hughes",
    role: "Customer Success Lead",
    email: "daniel.hughes@example.com",
  },
  {
    uid: "emp-021",
    name: "Harper Brooks",
    role: "Data Engineer",
    email: "harper.brooks@example.com",
  },
  {
    uid: "emp-022",
    name: "Isaac Turner",
    role: "ML Engineer",
    email: "isaac.turner@example.com",
  },
  {
    uid: "emp-023",
    name: "Zoe Clark",
    role: "Content Strategist",
    email: "zoe.clark@example.com",
  },
  {
    uid: "emp-024",
    name: "Evelyn Reed",
    role: "Operations Manager",
    email: "evelyn.reed@example.com",
  },
  {
    uid: "emp-025",
    name: "Mason Baker",
    role: "Support Engineer",
    email: "mason.baker@example.com",
  },
  {
    uid: "emp-026",
    name: "Chloe Adams",
    role: "Community Manager",
    email: "chloe.adams@example.com",
  },
  {
    uid: "emp-027",
    name: "Jack Murphy",
    role: "Game Developer",
    email: "jack.murphy@example.com",
  },
  {
    uid: "emp-028",
    name: "Isabella Flores",
    role: "Graphic Designer",
    email: "isabella.flores@example.com",
  },
  {
    uid: "emp-029",
    name: "Matthew Rivera",
    role: "SEO Specialist",
    email: "matthew.rivera@example.com",
  },
  {
    uid: "emp-030",
    name: "Scarlett Parker",
    role: "Business Analyst",
    email: "scarlett.parker@example.com",
  },
];

const Employee = () => {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await apiFetch<Employee>("/admin/employees");
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
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.15,
        delay: 0.1,
        type: "spring",
        stiffness: 70,
      }}
    >
      <ScrollArea className="h-full p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {employees ? (
            employeesList.map((emp) => (
              <EmployeeCard
                key={emp.uid}
                name={emp.name}
                email={emp.email}
                role={emp.role}
              />
            ))
          ) : (
            <div className="col-span-full flex justify-center">
              <BounceLoader />
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
};
export default Employee;
