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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/animate-ui/components/radix/alert-dialog";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  onAssign: () => Promise<void> | void;
  onUnassign: () => Promise<void> | void;
  onDelete: () => Promise<void> | void;
  loadingAction?: string | null;
};

export default function CounterManagementDialog({
  open,
  setOpen,
  onAssign,
  onUnassign,
  onDelete,
  loadingAction,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">Manage</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Counter</DialogTitle>
          <DialogDescription>
            Manage assignment and deletion of this counter
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex gap-2">
            <Button disabled={!!loadingAction} onClick={() => void onAssign()}>
              {loadingAction === "assign" ? (
                <>
                  <Spinner className="mr-2" /> Assigning
                </>
              ) : (
                "Assign"
              )}
            </Button>

            <Button
              disabled={!!loadingAction}
              onClick={() => void onUnassign()}
            >
              {loadingAction === "unassign" ? (
                <>
                  <Spinner className="mr-2" /> Unassigning
                </>
              ) : (
                "Unassign"
              )}
            </Button>
          </div>

          <div className="pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!!loadingAction}>
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Delete counter?</h3>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <AlertDialogCancel asChild>
                    <Button variant="outline">Cancel</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onClick={() => void onDelete()}
                    >
                      {loadingAction === "delete" ? (
                        <>
                          <Spinner className="mr-2" /> Deleting
                        </>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
