"use client";

import { useEffect, useState, useMemo } from "react";
import type { Station } from "@/types/station";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { api } from "@/app/lib/config/api";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import DetailHeader from "./DetailHeader";
import StationForm from "./StationForm";
import AssignCashiersDialog from "./AssignCashiersDialog";
import SaveControls from "./SaveControls";

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

  const handleOpenAssignDialog = async () => {
    setShowAssignDialog(true);
    setLoadingCashiers(true);
    try {
      const res = await api.get("/admin/available-cashiers");
      setAvailableCashiers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch available cashiers:", err);
      if (isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to load available cashiers");
      }
      setAvailableCashiers([]);
    } finally {
      setLoadingCashiers(false);
    }
  };

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
        <DetailHeader />

        <StationForm
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          typeValue={typeValue}
          setTypeValue={setTypeValue}
          onOpenAssignDialog={() => void handleOpenAssignDialog()}
        />

        <SaveControls
          isDirty={isDirty}
          isSaving={isSaving}
          isValid={isValid}
          onSave={() => void handleSave()}
        />

        <AssignCashiersDialog
          open={showAssignDialog}
          setOpen={setShowAssignDialog}
          availableCashiers={availableCashiers}
          loadingCashiers={loadingCashiers}
          onRefresh={() => void handleOpenAssignDialog()}
        />
      </div>
    </Card>
  );
};

export default DetailContent;
