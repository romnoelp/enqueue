"use client";

import { useEffect, useState, useMemo } from "react";
import type { Station, StationListItem } from "@/types/station";
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
import { Switch } from "@/components/animate-ui/components/base/switch";
import { toast } from "sonner";
import { apiFetch } from "@/app/lib/backend/api";

interface DetailContentProps {
  initialData?: Partial<Station> | null;
  loading?: boolean;
  onSave?: (payload: Partial<Station> | null) => Promise<void>;
}

const DetailContent = ({
  initialData,
  loading = false,
  onSave,
}: DetailContentProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [typeValue, setTypeValue] = useState("");
  const [activated, setActivated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state whenever initialData changes (e.g. when selecting a new station)
  useEffect(() => {
    if (!initialData) {
      setName("");
      setDescription("");
      setTypeValue("");
      setActivated(false);
      return;
    }

    queueMicrotask(() => {
      setName(initialData.name ?? "");
      setDescription(initialData.description ?? "");
      setTypeValue(initialData.type ?? "");
      setActivated(initialData.activated ?? false);
    });
  }, [initialData]);

  // Determine if form has unsaved changes
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return (
      (initialData.name ?? "") !== name ||
      (initialData.description ?? "") !== description ||
      String(initialData.type ?? "") !== typeValue ||
      (initialData.activated ?? false) !== activated
    );
  }, [initialData, name, description, typeValue, activated]);

  const handleSave = async () => {
    if (isSaving || !isDirty) return;

    setIsSaving(true);
    const payload = {
      name,
      description,
      type: typeValue as Station["type"],
      activated,
    };

    try {
      if (onSave) {
        await onSave(payload);
        toast.success("Station updated successfully");
        return;
      }

      const stationID = (initialData as StationListItem)?.id;
      if (!stationID) {
        throw new Error(
          "Station ID is missing and no custom save handler provided."
        );
      }

      await apiFetch(
        `/station/update/${encodeURIComponent(String(stationID))}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      toast.success("Station updated successfully");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error((err as Error).message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
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

        {/* Station Type & Activated Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

          <div className="flex items-center">
            <Label className="flex items-center gap-x-3 cursor-pointer">
              <Switch checked={activated} onCheckedChange={setActivated} />
              <span className="text-sm font-medium">Activated</span>
            </Label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          {isDirty && !isSaving && (
            <FlipButton disabled={isSaving}>
              <FlipButtonFront size="lg" variant="outline">
                Hover to keep changes!
              </FlipButtonFront>
              <FlipButtonBack size="lg" onClick={() => void handleSave()}>
                Save Changes
              </FlipButtonBack>
            </FlipButton>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DetailContent;
