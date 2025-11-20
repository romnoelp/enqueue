import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import CreateCounterDialog from "./CreateCounterDialog";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/animate-ui/components/radix/alert-dialog";
import CounterCard from "./CounterCard";
import type { Counter } from "@/types/station";
// API helpers are provided by ./counterActions
import {
  fetchAvailableEmployees,
  fetchAssignedUserLabels,
  fetchCountersApi,
  createCounterApi,
  updateCounterApi,
  deleteCounterApi,
} from "../_utils/counterActions";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  stationId?: string | number | null;
  onCreated?: () => void;
};

const CounterContent = ({ stationId, onCreated }: Props) => {
  const [open, setOpen] = useState(false);
  // selected employee will be used for assignment; we don't create counters server-side here
  const [employees, setEmployees] = useState<
    Array<{ uid: string; name?: string; email?: string }>
  >([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>(
    undefined
  );
  const [counters, setCounters] = useState<
    Array<{ id: string; counterNumber?: number; uid?: string | null }>
  >([]);
  const [activeDialogCounter, setActiveDialogCounter] = useState<string | null>(
    null
  );
  const [assignedEmails, setAssignedEmails] = useState<Record<string, string>>(
    {}
  );
  const [isCreating, setIsCreating] = useState(false);
  type LoadingAction =
    | { type: "create" }
    | { type: "assign"; id: string }
    | { type: "unassign"; id: string }
    | { type: "delete"; id: string }
    | { type: null };
  const [loadingAction, setLoadingAction] = useState<LoadingAction>({
    type: null,
  });
  const [actionMode, setActionMode] = useState<
    "idle" | "confirmUnassign" | "assigning"
  >("idle");
  const [alertOpen, setAlertOpen] = useState(false);
  const [assignConfirmCounter, setAssignConfirmCounter] = useState<
    string | null
  >(null);
  const [deleteConfirmCounter, setDeleteConfirmCounter] = useState<
    string | null
  >(null);

  useEffect(() => {
    let mounted = true;

    const fetchEmployees = async () => {
      try {
        const data = await fetchAvailableEmployees();
        if (!mounted) return;
        setEmployees(data?.availableCashiers ?? []);
      } catch (error) {
        console.error("Failed to fetch available employees", error);
        setEmployees([]);
      }
    };

    // Fetch when the create dialog or any counter dialog opens
    if (open || activeDialogCounter) void fetchEmployees();

    return () => {
      mounted = false;
    };
  }, [open, activeDialogCounter]);

  // Fetch counters for the station and their assigned employees
  const fetchCounters = useCallback(async () => {
    if (!stationId) {
      setCounters([]);
      return;
    }

    try {
      const data = await fetchCountersApi(stationId);
      const counterList = (data?.counterList ?? []) as Array<
        Counter & { id?: string }
      >;
      setCounters(
        counterList.map((counterFromApi) => ({
          id: String(counterFromApi.id ?? ""),
          counterNumber: counterFromApi.counterNumber,
          uid:
            (counterFromApi as unknown as { uid?: string | null }).uid ?? null,
        }))
      );

      // fetch assigned user labels for counters that have uid
      const uidList = (counterList as Counter[])
        .map((counterFromApi) => counterFromApi.uid)
        .filter(Boolean) as string[];

      const emails = await fetchAssignedUserLabels(uidList);
      setAssignedEmails(emails);
    } catch (err) {
      console.error("Failed to fetch counters", err);
      setCounters([]);
    }
  }, [stationId]);

  useEffect(() => {
    let mounted = true;
    if (mounted) void fetchCounters();
    return () => {
      mounted = false;
    };
  }, [fetchCounters, open]);

  const handleCreate = async () => {
    if (isCreating) return;
    if (!stationId) {
      toast.error("Station not selected");
      return;
    }
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }
    setIsCreating(true);
    try {
      setLoadingAction({ type: "create" });
      // Determine next counter number
      const countersResponse = await fetchCountersApi(stationId);
      const existingCounters = countersResponse?.counterList ?? [];
      const maxNumber = existingCounters.reduce(
        (max, counterItem) =>
          Math.max(max, Number(counterItem.counterNumber ?? 0)),
        0
      );
      const nextNumber = maxNumber + 1;

      // Create counter
      const createResponse = await createCounterApi(stationId, nextNumber);
      const counterId = createResponse?.counter?.id;
      if (!counterId) {
        throw new Error("Failed to create counter");
      }

      // Assign employee to counter via update route
      await updateCounterApi(stationId, counterId, {
        counterNumber: nextNumber,
        employeeUID: selectedEmployee,
      });

      toast.success("Counter created and employee assigned");
      setOpen(false);
      if (onCreated) await onCreated();
    } catch (err) {
      console.error("Create counter flow failed", err);
      toast.error((err as Error).message || "Failed to complete action");
    } finally {
      setIsCreating(false);
      setLoadingAction({ type: null });
    }
  };

  const handleAssign = async (counterId: string) => {
    if (!stationId) {
      toast.error("Station not selected");
      return;
    }
    if (!counterId) {
      toast.error("Counter missing");
      return;
    }

    try {
      setLoadingAction({ type: "assign", id: counterId });
      const foundCounter = counters.find(
        (counterItem) => counterItem.id === counterId
      );
      const counterNumber = Number(foundCounter?.counterNumber ?? 0);

      await updateCounterApi(stationId, counterId, {
        counterNumber,
        employeeUID: selectedEmployee,
      });

      toast.success("Counter updated");
      // refresh counters locally (don't call parent onCreated to avoid closing parent dialog)
      await fetchCounters();
      setLoadingAction({ type: null });
    } catch (err) {
      console.error("Failed to assign employee", err);
      toast.error((err as Error).message || "Failed to assign employee");
      setLoadingAction({ type: null });
    }
  };

  const handleUnassign = async (counterId: string) => {
    if (!stationId) {
      toast.error("Station not selected");
      return;
    }
    if (!counterId) {
      toast.error("Counter missing");
      return;
    }

    try {
      setLoadingAction({ type: "unassign", id: counterId });
      const foundCounter = counters.find(
        (counterItem) => counterItem.id === counterId
      );
      const counterNumber = Number(foundCounter?.counterNumber ?? 0);

      await updateCounterApi(stationId, counterId, {
        counterNumber,
        employeeUID: undefined,
      });

      toast.success("Employee unassigned");
      // refresh counters locally (don't call parent onCreated to avoid closing parent dialog)
      await fetchCounters();
      // close per-counter dialog
      setActiveDialogCounter(null);
      setLoadingAction({ type: null });
    } catch (err) {
      console.error("Failed to unassign", err);
      toast.error((err as Error).message || "Failed to unassign employee");
      setLoadingAction({ type: null });
    }
  };

  const handleDelete = async (counterId: string) => {
    if (!stationId) {
      toast.error("Station not selected");
      return;
    }
    if (!counterId) {
      toast.error("Counter missing");
      return;
    }

    try {
      setLoadingAction({ type: "delete", id: counterId });
      await deleteCounterApi(stationId, counterId);

      toast.success("Counter deleted");
      setDeleteConfirmCounter(null);
      // Close the per-counter management dialog and refresh
      setActiveDialogCounter(null);
      await fetchCounters();
      if (onCreated) await onCreated();
      setLoadingAction({ type: null });
    } catch (err) {
      console.error("Failed to delete counter", err);
      toast.error((err as Error).message || "Failed to delete counter");
      setLoadingAction({ type: null });
    }
  };

  return (
    <Card className="h-full w-full p-4">
      <div className="flex flex-col gap-y-4">
        {/* Header */}
        <div className="flex flex-col gap-y-1">
          <p className="font-bold text-lg">Counters</p>
          <p className="font-light text-sm text-muted-foreground">
            Manage each counter in the selected station
          </p>
        </div>

        <div className="flex w-full gap-x-2">
          <Input placeholder="Search for counter..." />

          <CreateCounterDialog
            open={open}
            setOpen={setOpen}
            employees={employees}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            onCreate={handleCreate}
            isCreating={isCreating || loadingAction.type === "create"}
          />
        </div>
        <div className="h-full w-full">
          <ScrollArea className="h-[420px] w-full border rounded-md">
            <div className="p-2">
              <div className="grid grid-cols-2 gap-3 min-h-[360px]">
                {counters.length === 0 ? (
                  <div className="col-span-2 flex items-center justify-center h-full text-sm text-muted-foreground">
                    <p className="font-semibold text-base text-muted-foreground">
                      No counters
                    </p>
                  </div>
                ) : (
                  counters.map((counter) => {
                    const assignedEmailLabel = counter?.uid
                      ? assignedEmails[counter.uid] ?? ""
                      : "";

                    return (
                      <Dialog
                        key={counter.id}
                        open={activeDialogCounter === counter.id}
                        onOpenChange={(v) => {
                          if (v) {
                            setActiveDialogCounter(counter.id);
                            setSelectedEmployee(counter.uid ?? undefined);
                            setActionMode("idle");
                          } else {
                            setActiveDialogCounter(null);
                            setSelectedEmployee(undefined);
                            setActionMode("idle");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <CounterCard
                            counterNumber={Number(counter.counterNumber ?? 0)}
                            employeeEmail={assignedEmailLabel || undefined}
                          />
                        </DialogTrigger>

                        <DialogContent className="w-[420px] sm:w-[480px]">
                          <DialogHeader>
                            <DialogTitle>
                              Manage Counter {counter.counterNumber}
                            </DialogTitle>
                            <DialogDescription>
                              Assign or unassign a cashier to this counter
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 mt-2">
                            <div className="text-sm">
                              <strong>Assigned:</strong>{" "}
                              {counter.uid
                                ? assignedEmailLabel || counter.uid
                                : "No employee assigned"}
                            </div>

                            {actionMode === "idle" && (
                              <div className="flex gap-5 justify-between">
                                <div className="flex gap-x-4">
                                  <Button
                                    variant="outline"
                                    disabled={!counter.uid}
                                    onClick={() => setAlertOpen(true)}
                                  >
                                    Unassign
                                  </Button>
                                  <Button
                                    onClick={() => setActionMode("assigning")}
                                  >
                                    Assign New
                                  </Button>
                                </div>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    setDeleteConfirmCounter(counter.id)
                                  }
                                >
                                  Delete Counter
                                </Button>
                              </div>
                            )}

                            <AlertDialog
                              open={alertOpen}
                              onOpenChange={setAlertOpen}
                            >
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Unassign employee
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    disabled={
                                      loadingAction.type === "unassign" &&
                                      loadingAction.id === counter.id
                                    }
                                    onClick={async () => {
                                      // perform unassign then close dialogs
                                      await handleUnassign(counter.id);
                                      setAlertOpen(false);
                                      // Close the per-counter management dialog as well
                                      setActiveDialogCounter(null);
                                    }}
                                  >
                                    {loadingAction.type === "unassign" &&
                                    loadingAction.id === counter.id ? (
                                      <>
                                        <Spinner className="mr-2" />{" "}
                                        Confirming...
                                      </>
                                    ) : (
                                      "Confirm"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            {actionMode === "assigning" && (
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.18 }}
                                className="space-y-3"
                              >
                                <Select
                                  value={selectedEmployee}
                                  onValueChange={setSelectedEmployee}
                                >
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
                                        <SelectItem
                                          key={emp.uid}
                                          value={emp.uid}
                                        >
                                          {emp.name ?? emp.email ?? emp.uid}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>

                                <div className="flex gap-2">
                                  <Button
                                    disabled={!selectedEmployee}
                                    onClick={() =>
                                      setAssignConfirmCounter(counter.id)
                                    }
                                  >
                                    Assign
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setActionMode("idle")}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                            {/* Assign confirmation alert dialog (per-counter) */}
                            <AlertDialog
                              open={assignConfirmCounter === counter.id}
                              onOpenChange={(v) => {
                                if (!v) setAssignConfirmCounter(null);
                              }}
                            >
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Assign employee
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Assign{" "}
                                    {selectedEmployee
                                      ? employees.find(
                                          (e) => e.uid === selectedEmployee
                                        )?.name ??
                                        employees.find(
                                          (e) => e.uid === selectedEmployee
                                        )?.email ??
                                        selectedEmployee
                                      : "this employee"}{" "}
                                    to Counter {counter.counterNumber}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    disabled={
                                      loadingAction.type === "assign" &&
                                      loadingAction.id === counter.id
                                    }
                                    onClick={async () => {
                                      if (!assignConfirmCounter) return;
                                      await handleAssign(assignConfirmCounter);
                                      setAssignConfirmCounter(null);
                                      setActiveDialogCounter(null);
                                    }}
                                  >
                                    {loadingAction.type === "assign" &&
                                    loadingAction.id === counter.id ? (
                                      <>
                                        <Spinner className="mr-2" />{" "}
                                        Confirming...
                                      </>
                                    ) : (
                                      "Confirm"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            {/* Delete confirmation alert dialog (per-counter) */}
                            <AlertDialog
                              open={deleteConfirmCounter === counter.id}
                              onOpenChange={(v) => {
                                if (!v) setDeleteConfirmCounter(null);
                              }}
                            >
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete counter
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    disabled={
                                      loadingAction.type === "delete" &&
                                      loadingAction.id === counter.id
                                    }
                                    onClick={async () => {
                                      if (!deleteConfirmCounter) return;
                                      await handleDelete(deleteConfirmCounter);
                                      setDeleteConfirmCounter(null);
                                    }}
                                  >
                                    {loadingAction.type === "delete" &&
                                    loadingAction.id === counter.id ? (
                                      <>
                                        <Spinner className="mr-2" /> Deleting...
                                      </>
                                    ) : (
                                      "Confirm"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </DialogContent>
                      </Dialog>
                    );
                  })
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
};

export default CounterContent;
