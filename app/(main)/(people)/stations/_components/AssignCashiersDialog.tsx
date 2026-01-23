"use client";

import { Input } from "@/components/ui/input";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import {
  PlayfulTodolist,
  type PlayfulTodolistItem,
} from "@/components/animate-ui/components/community/playful-todolist";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Dispatch, SetStateAction } from "react";

interface AssignCashiersDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  availableCashiers: any[];
  loadingCashiers: boolean;
  onRefresh: () => void;
  onSave?: () => void;
}

const AssignCashiersDialog = ({
  open,
  setOpen,
  availableCashiers,
  loadingCashiers,
  onRefresh,
  onSave,
}: AssignCashiersDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Cashiers</DialogTitle>
          <DialogDescription>
            Select a cashier to assign to this station.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <Input placeholder="Search cashier..." className="flex-1" />
          <LiquidButton
            size="lg"
            variant="default"
            type="button"
            onClick={onRefresh}
            disabled={loadingCashiers}>
            Refresh
          </LiquidButton>
          <LiquidButton
            size="lg"
            variant="default"
            type="button"
            onClick={onSave}>
            Save
          </LiquidButton>
        </div>

        {loadingCashiers ? (
          <div className="flex justify-center items-center py-8">
            <BounceLoader />
          </div>
        ) : availableCashiers.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No available cashiers found.
          </div>
        ) : (
          <ScrollArea className="max-h-64">
            <PlayfulTodolist
              items={availableCashiers.map(
                (cashier) =>
                  ({
                    id: cashier.uid,
                    label: (
                      <span>
                        <span className="font-medium">
                          {cashier.name || cashier.email}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {cashier.email}
                        </span>
                      </span>
                    ),
                  }) as PlayfulTodolistItem,
              )}
            />
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignCashiersDialog;
