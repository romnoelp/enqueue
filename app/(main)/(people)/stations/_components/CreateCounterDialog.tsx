"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  employees: Array<{ uid: string; name?: string; email?: string }>;
  selectedEmployee?: string | undefined;
  setSelectedEmployee: (v?: string) => void;
  onCreate: () => Promise<void> | void;
  isCreating?: boolean;
  creating?: boolean;
};

export default function CreateCounterDialog({
  open,
  setOpen,
  employees,
  selectedEmployee,
  setSelectedEmployee,
  onCreate,
  isCreating,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button asChild size={"lg"}>
          <span>Create</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Counter</DialogTitle>
          <DialogDescription>
            Select an available employee to assign to the new counter
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.length === 0 ? (
                <SelectItem value="no-available" disabled>
                  No employees available
                </SelectItem>
              ) : (
                employees.map((emp) => (
                  <SelectItem key={emp.uid} value={emp.uid}>
                    {emp.name ?? emp.email ?? emp.uid}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button disabled={isCreating} onClick={() => void onCreate()}>
            {isCreating ? (
              <>
                <Spinner className="mr-2" /> Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
