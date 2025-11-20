"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Magnetic } from "@/components/motion-primitives/magnetic";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/app/lib/backend/api";
import { toast } from "sonner";

type Props = {
  onCreated?: () => void;
};

const AddStationDialog = ({ onCreated }: Props) => {
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
        name,
        description,
        type: typeValue,
        activated,
      };

      await apiFetch("/station/add", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Station created");
      setOpen(false);
      resetForm();
      if (onCreated) onCreated();
    } catch (err) {
      console.error("Create station failed", err);
      toast.error((err as Error).message || "Failed to create station");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>Add Station</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new station</DialogTitle>
          <DialogDescription>Input the necessary details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="stationName" className="font-semibold">
              Name
            </Label>
            <Input
              id="stationName"
              placeholder="Station Name"
              className="mt-1 mb-2 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="stationDescription" className="font-semibold">
              Description
            </Label>
            <Textarea
              id="stationDescription"
              placeholder="Station Description"
              className="mt-1 mb-2 w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-x-4">
            <div>
              <Label htmlFor="stationType" className="font-semibold">
                Station Type
              </Label>
              <Select value={typeValue} onValueChange={setTypeValue}>
                <SelectTrigger id="stationType" className="w-[180px] mt-1">
                  <SelectValue placeholder="Select station type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auditing">Auditing</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="registrar">Registrar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Label className="flex items-center gap-x-3">
              <Checkbox
                checked={activated}
                onCheckedChange={(v: boolean) => setActivated(Boolean(v))}
              />
              <span className="select-none">Activated</span>
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Magnetic>
            <Button disabled={isCreating} onClick={() => void handleCreate()}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </Magnetic>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStationDialog;
