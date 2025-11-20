"use client";

import React from "react";
import { MorphingDialogTrigger } from "@/components/motion-primitives/morphing-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/animate-ui/components/radix/alert-dialog";
import DeleteConfirmButton from "./DeleteConfirmButton";

type Props = {
  onDialogOpenChange?: (open: boolean) => void;
  isDeleting: boolean;
  handleDelete: () => Promise<void>;
};

const FlipCardBack = ({
  onDialogOpenChange,
  isDeleting,
  handleDelete,
}: Props) => {
  return (
    <div className="absolute inset-0 h-full w-full transform-[rotateY(180deg)] backface-hidden">
      <div
        className={
          "rounded-2xl p-6 h-full flex flex-col items-center justify-center bg-card text-card-foreground border border-border shadow-md"
        }
      >
        <h3 className="text-lg font-semibold mb-1">Actions</h3>

        <div className="flex gap-x-4">
          <MorphingDialogTrigger>
            <Button asChild>
              <span>Manage</span>
            </Button>
          </MorphingDialogTrigger>

          <AlertDialog onOpenChange={onDialogOpenChange}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Station</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  This action cannot be undone
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this station?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                {isDeleting ? (
                  <DeleteConfirmButton
                    handleDelete={handleDelete}
                    isDeleting={isDeleting}
                  />
                ) : (
                  <DeleteConfirmButton
                    handleDelete={handleDelete}
                    isDeleting={isDeleting}
                  />
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default FlipCardBack;
