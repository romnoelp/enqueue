import Employee from "@/types/employee";
import { Shield, DollarSign, Info, Clock, Crown } from "lucide-react";

const roleIconMap = {
  admin: Shield,
  cashier: DollarSign,
  information: Info,
  pending: Clock,
  superAdmin: Crown,
};

const EmployeeCard = ({ name, role, email }: Employee) => {
  const Icon = roleIconMap[role] || Info; // fallback icon

  return (
    <div className="w-full max-w-sm p-4">
      <div className="scale-in group visible cursor-pointer">
        <div
          className={`
            relative transform overflow-hidden rounded-2xl p-6 shadow-md
            transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg
            bg-card text-card-foreground border border-border
          `}
        >
          {/* Accent bar on top */}
          <div className="absolute inset-x-0 top-0 h-1 bg-primary"></div>

          <div className="relative space-y-3">
            {/* Dynamic Icon */}
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>

            {/* Text Info */}
            <h3 className="font-sans text-lg font-semibold leading-tight">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground capitalize">{role}</p>

            {/* Divider */}
            <div className="h-px bg-border/50 my-2"></div>

            {/* Email */}
            <div className="flex items-center text-sm text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4 text-primary/70"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l9 6 9-6M3 8v8a2 2 0 002 2h14a2 2 0 002-2V8m-9 6L3 8"
                />
              </svg>
              {email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
