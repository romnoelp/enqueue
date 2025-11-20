"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Magnetic } from "@/components/motion-primitives/magnetic";
import { apiFetch } from "@/app/lib/backend/api";
import { toast } from "sonner";

type Props = {
  onCreated?: () => void;
};

const STATION_TYPES = [
  { value: "auditing", label: "Auditing" },
  { value: "clinic", label: "Clinic" },
  { value: "payment", label: "Payment" },
  { value: "registrar", label: "Registrar" },
] as const;

export default function AddStationDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [typeValue, setTypeValue] = useState("");
  const [activated, setActivated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setTypeValue("");
    setActivated(false);
  };

  const handleCreate = async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        type: typeValue,
        activated,
      };

      await apiFetch("/station/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast.success("Station created successfully");
      setOpen(false);
      resetForm();
      onCreated?.();
    } catch (err) {
      console.error("Failed to create station:", err);
      toast.error((err as Error).message || "Failed to create station");
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Station</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new station</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new station.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="stationName" className="font-semibold">
              Name
            </Label>
            <Input
              id="stationName"
              placeholder="Enter station name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="stationDescription" className="font-semibold">
              Description
            </Label>
            <Textarea
              id="stationDescription"
              placeholder="Describe this station (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isCreating}
              rows={3}
            />
          </div>

          {/* Type + Activated */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="stationType" className="font-semibold">
                Station Type
              </Label>
              <Select
                value={typeValue}
                onValueChange={setTypeValue}
                disabled={isCreating}
              >
                <SelectTrigger id="stationType" className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {STATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={activated}
                onCheckedChange={(checked) => setActivated(!!checked)}
                disabled={isCreating}
              />
              <span className="select-none font-medium">Activated</span>
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Magnetic>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !name.trim() || !typeValue}
            >
              {isCreating ? "Creating..." : "Create Station"}
            </Button>
          </Magnetic>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
