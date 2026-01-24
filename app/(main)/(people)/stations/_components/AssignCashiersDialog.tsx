"use client";

import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
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
  const [checkedById, setCheckedById] = useState<Record<string, boolean>>(
    () => ({}),
  );

  useEffect(() => {
    setCheckedById(
      Object.fromEntries(availableCashiers.map((c) => [String(c.uid), false])),
    );
  }, [availableCashiers]);
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
            <div className="space-y-2">
              {availableCashiers.map((cashier) => (
                <div
                  key={cashier.uid}
                  className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={!!checkedById[String(cashier.uid)]}
                      onCheckedChange={(val) =>
                        setCheckedById((s) => ({
                          ...s,
                          [String(cashier.uid)]: val === true,
                        }))
                      }
                      id={`assign-${cashier.uid}`}
                    />
                    <div>
                      <Label className="font-medium">
                        {cashier.name || cashier.email}
                      </Label>
                      <div className="text-xs text-muted-foreground">
                        {cashier.email}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignCashiersDialog;
