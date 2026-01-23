"use client";

import { useEffect, useState, useMemo } from "react";
import type { Station } from "@/types/station";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  FlipButton,
  FlipButtonFront,
  FlipButtonBack,
} from "@/components/animate-ui/components/buttons/flip";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { api } from "@/app/lib/config/api";
import { PlayfulTodolist, type PlayfulTodolistItem } from "@/components/animate-ui/components/community/playful-todolist";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DetailContentProps {
  initialData?: Partial<Station> | null;
  loading?: boolean;
  onSave?: (payload: Partial<Station>) => Promise<void>;
}

const DetailContent = ({
  initialData,
  loading = false,
  onSave,
}: DetailContentProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [typeValue, setTypeValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [availableCashiers, setAvailableCashiers] = useState<any[]>([]);
  const [loadingCashiers, setLoadingCashiers] = useState(false);

  const isValid =
    Boolean(name.trim()) && Boolean(description.trim()) && Boolean(typeValue);

  // Sync local state whenever initialData changes (e.g. when selecting a new station)
  useEffect(() => {
    if (!initialData) {
      setName("");
      setDescription("");
      setTypeValue("");
      return;
    }

    queueMicrotask(() => {
      setName(initialData.name ?? "");
      setDescription(initialData.description ?? "");
      setTypeValue(initialData.type ?? "");
    });
  }, [initialData]);

  // Determine if form has unsaved changes
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return (
      (initialData.name ?? "") !== name ||
      (initialData.description ?? "") !== description ||
      String(initialData.type ?? "") !== typeValue
    );
  }, [initialData, name, description, typeValue]);

  const handleSave = async () => {
    if (isSaving || !isDirty) return;
    if (!isValid) {
      toast.error("Name, description, and station type are required");
      return;
    }

    setIsSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      type: typeValue as Station["type"],
    };

    try {
      if (onSave) {
        await onSave(payload);
        toast.success("Station updated successfully");
      } else {
        toast.error("No save handler provided");
      }
    } catch (err) {
      console.error("Save failed:", err);
      if (isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to save changes");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // MOCK DATA for available cashiers (extended)
  const MOCK_CASHIERS = [
    { uid: "cashier1", name: "Jane Doe", email: "jane.doe@email.com" },
    { uid: "cashier2", name: "John Smith", email: "john.smith@email.com" },
    { uid: "cashier3", name: "Alice Brown", email: "alice.brown@email.com" },
    { uid: "cashier4", name: "Bob Lee", email: "bob.lee@email.com" },
    { uid: "cashier5", name: "Maria Garcia", email: "maria.garcia@email.com" },
    { uid: "cashier6", name: "Liam Wong", email: "liam.wong@email.com" },
    { uid: "cashier7", name: "Sophia Kim", email: "sophia.kim@email.com" },
    { uid: "cashier8", name: "Noah Patel", email: "noah.patel@email.com" },
    { uid: "cashier9", name: "Emma Rossi", email: "emma.rossi@email.com" },
    { uid: "cashier10", name: "Lucas Müller", email: "lucas.muller@email.com" },
  ];

  const handleOpenAssignDialog = async () => {
    setShowAssignDialog(true);
    setLoadingCashiers(true);
    // Simulate API delay
    setTimeout(() => {
      setAvailableCashiers(MOCK_CASHIERS);
      setLoadingCashiers(false);
    }, 700);
  };

  // Do not hide the whole component when saving; the button will be hidden instead.

  // Show loader when explicitly loading or no data yet
  if (loading || (!initialData && loading !== false)) {
    return (
      <Card className="h-full p-4">
        <div className="h-full flex items-center justify-center">
          <BounceLoader />
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-y-1">
          <p className="font-bold text-lg">Update Station</p>
          <p className="font-light text-sm text-muted-foreground">
            Modify details for this station
          </p>
        </div>

        {/* Station Name */}
        <div className="space-y-2">
          <Label htmlFor="stationName" className="font-semibold">
            Name
          </Label>
          <Input
            id="stationName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter station name..."
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="stationDesc" className="font-semibold">
            Description
          </Label>
          <Textarea
            id="stationDesc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this station..."
            rows={3}
          />
        </div>

        {/* Station Type and Assign Cashiers Button */}
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2 sm:w-64">
            <Label className="font-semibold">Station Type</Label>
            <Select value={typeValue} onValueChange={setTypeValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select a station type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="auditing">Auditing</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="registrar">Registrar</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <LiquidButton
            size="lg"
            variant="default"
            type="button"
            onClick={handleOpenAssignDialog}
          >
            Assign cashiers
          </LiquidButton>
        </div>

        <div className="flex justify-end pt-4">
          {isDirty && !isSaving && (
            <FlipButton disabled={isSaving || !isValid}>
              <FlipButtonFront size="lg" variant="outline">
                Hover to keep changes!
              </FlipButtonFront>
              <FlipButtonBack size="lg" onClick={() => void handleSave()}>
                Save Changes
              </FlipButtonBack>
            </FlipButton>
          )}
        </div>

        {/* Assign Cashiers Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Cashiers</DialogTitle>
              <DialogDescription>
                Select a cashier to assign to this station.
              </DialogDescription>
            </DialogHeader>

            {/* Controls Row */}
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Search cashier..."
                className="flex-1"
                // Add value/onChange for search if needed
              />
              <LiquidButton
                size="lg"
                variant="default"
                type="button"
                onClick={() => handleOpenAssignDialog()}
                disabled={loadingCashiers}
              >
                Refresh
              </LiquidButton>
              <LiquidButton
                size="lg"
                variant="default"
                type="button"
                // Add onClick for save action
              >
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
                  items={availableCashiers.map((cashier) => ({
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
                  }))}
                />
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
        {/* End Assign Cashiers Dialog */}
      </div>
    </Card>
  );
};

export default DetailContent;
