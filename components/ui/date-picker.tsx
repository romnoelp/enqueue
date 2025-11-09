"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  id,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id={id}
          className={`justify-between font-normal ${className || ""}`}
        >
          {date ? date.toLocaleDateString() : placeholder}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <input
          type="date"
          value={formatDateForInput(date)}
          onChange={(e) => {
            const newDate = e.target.value
              ? new Date(e.target.value)
              : undefined;
            onDateChange(newDate);
            setOpen(false);
          }}
          className="border-input bg-background ring-offset-background w-full rounded-md border px-3 py-2 text-sm"
        />
      </PopoverContent>
    </Popover>
  );
}
