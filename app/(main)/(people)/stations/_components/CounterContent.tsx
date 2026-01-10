import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import CreateCounterDialog from "./CreateCounterDialog";
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
// API helpers are provided by ./counterActions
import {
  fetchAssignedUserLabels,
  fetchCountersApi,
  createCounterApi,
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
  const [counters, setCounters] = useState<
    Array<{ id: string; number?: number; cashierUid?: string | null }>
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
    | { type: "delete"; id: string }
    | { type: null };
  const [loadingAction, setLoadingAction] = useState<LoadingAction>({
    type: null,
  });
  const [deleteConfirmCounter, setDeleteConfirmCounter] = useState<
    string | null
  >(null);

  // Fetch counters for the station and their assigned employees
  const fetchCounters = useCallback(async () => {
    if (!stationId) {
      setCounters([]);
      return;
    }

    try {
      const data = await fetchCountersApi(stationId);
      const counterList = (data?.counterList ?? []) as Array<{
        id?: string | number;
        number?: number;
        cashierUid?: string | null;
      }>;
      setCounters(
        counterList.map((counterFromApi) => ({
          id: String(counterFromApi.id ?? ""),
          number: counterFromApi.number,
          cashierUid: counterFromApi.cashierUid ?? null,
        }))
      );

      // fetch assigned user labels for counters that have cashierUid
      const uidList = counterList
        .map((counterFromApi) => counterFromApi.cashierUid)
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
    setIsCreating(true);
    try {
      setLoadingAction({ type: "create" });
      // Determine next counter number
      const countersResponse = await fetchCountersApi(stationId);
      const existingCounters = countersResponse?.counterList ?? [];
      const maxNumber = existingCounters.reduce(
        (max, counterItem) =>
          Math.max(
            max,
            Number((counterItem as { number?: number }).number ?? 0)
          ),
        0
      );
      const nextNumber = maxNumber + 1;

      // Create counter
      await createCounterApi(stationId, nextNumber);

      toast.success("Counter created");
      setOpen(false);
      if (onCreated) await onCreated();
      await fetchCounters();
    } catch (err) {
      console.error("Create counter flow failed", err);
      toast.error((err as Error).message || "Failed to complete action");
    } finally {
      setIsCreating(false);
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
      const foundCounter = counters.find(
        (counterItem) => counterItem.id === counterId
      );
      const number = Number(foundCounter?.number ?? 0);
      const cashierUid = foundCounter?.cashierUid ?? null;
      if (!number) {
        throw new Error("Counter number is missing");
      }

      await deleteCounterApi(counterId, {
        stationId: String(stationId),
        number,
        cashierUid: cashierUid || undefined,
      });

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
            onCreate={handleCreate}
            isCreating={isCreating || loadingAction.type === "create"}
          />
        </div>
        <div className="h-full w-full">
          <ScrollArea className="h-105 w-full border rounded-md">
            <div className="p-2">
              <div className="grid grid-cols-2 gap-3 min-h-90">
                {counters.length === 0 ? (
                  <div className="col-span-2 flex items-center justify-center h-full text-sm text-muted-foreground">
                    <p className="font-semibold text-base text-muted-foreground">
                      No counters
                    </p>
                  </div>
                ) : (
                  counters.map((counter) => {
                    const assignedEmailLabel = counter?.cashierUid
                      ? assignedEmails[counter.cashierUid] ?? ""
                      : "";

                    return (
                      <Dialog
                        key={counter.id}
                        open={activeDialogCounter === counter.id}
                        onOpenChange={(v) => {
                          if (v) {
                            setActiveDialogCounter(counter.id);
                          } else {
                            setActiveDialogCounter(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <CounterCard
                            counterNumber={Number(counter.number ?? 0)}
                            employeeEmail={assignedEmailLabel || undefined}
                          />
                        </DialogTrigger>

                        <DialogContent className="w-105 sm:w-120">
                          <DialogHeader>
                            <DialogTitle>
                              Manage Counter {counter.number}
                            </DialogTitle>
                            <DialogDescription>
                              View counter status and delete this counter
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 mt-2">
                            <div className="text-sm">
                              <strong>Assigned:</strong>{" "}
                              {counter.cashierUid
                                ? assignedEmailLabel || counter.cashierUid
                                : "No employee assigned"}
                            </div>

                            <div className="flex justify-end">
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  setDeleteConfirmCounter(counter.id)
                                }
                              >
                                Delete Counter
                              </Button>
                            </div>
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
