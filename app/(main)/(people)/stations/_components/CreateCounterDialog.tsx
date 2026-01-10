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

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  onCreate: () => Promise<void> | void;
  isCreating?: boolean;
  creating?: boolean;
};

export default function CreateCounterDialog({
  open,
  setOpen,
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
            Create a new counter for this station.
          </DialogDescription>
        </DialogHeader>

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
