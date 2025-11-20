import React from "react";
import { Card } from "@/components/ui/card";
import { Mail, Info } from "lucide-react";

type Props = {
  counterNumber: number;
  employeeEmail?: string | null;
  onClick?: () => void;
};

const CounterCard = ({ counterNumber, employeeEmail, onClick }: Props) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <Card
      className="p-3 h-28 cursor-pointer"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      <div className="relative h-full flex flex-col justify-between">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Info className="h-4 w-4" />
            </div>
            <div className="text-xs font-semibold mt-1">
              Counter {counterNumber}
            </div>
          </div>
          <div className="flex-1 min-w-0" />
        </div>

        <div className="flex items-center text-muted-foreground text-xs">
          <Mail className="mr-2 h-3 w-3 text-primary/70 shrink-0" />
          <span className="truncate">
            {employeeEmail ?? "No employee assigned"}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CounterCard;
