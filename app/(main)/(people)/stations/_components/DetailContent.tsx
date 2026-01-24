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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlayfulTodolist,
  type PlayfulTodolistItem,
} from "@/components/animate-ui/components/community/playful-todolist";

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
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [availableCashiers, setAvailableCashiers] = useState<any[]>([]);
  const [loadingCashiers, setLoadingCashiers] = useState(false);
  const [checkedViewIds, setCheckedViewIds] = useState<Array<string | number>>(
    [],
  );

  const mockViewItems: PlayfulTodolistItem[] = useMemo(
    () => [
      {
        id: "u1",
        label: (
          <span>
            <span className="font-medium">Alice Doe</span>{" "}
            <span className="text-xs text-muted-foreground ml-2">
              alice@example.com
            </span>
          </span>
        ),
      },
      {
        id: "u2",
        label: (
          <span>
            <span className="font-medium">Bob Smith</span>{" "}
            <span className="text-xs text-muted-foreground ml-2">
              bob@example.com
            </span>
          </span>
        ),
      },
      {
        id: "u3",
        label: (
          <span>
            <span className="font-medium">Carol Nguyen</span>{" "}
            <span className="text-xs text-muted-foreground ml-2">
              carol@example.com
            </span>
          </span>
        ),
      },
      {
        id: "u4",
        label: (
          <span>
            <span className="font-medium">Daniel Park</span>{" "}
            <span className="text-xs text-muted-foreground ml-2">
              daniel@example.com
            </span>
          </span>
        ),
      },
      {
        id: "u5",
        label: (
          <span>
            <span className="font-medium">Eve Martinez</span>{" "}
            <span className="text-xs text-muted-foreground ml-2">
              eve@example.com
            </span>
          </span>
        ),
      },
      {
        id: "u6",
        label: (
          <span>
            <span className="font-medium">Frank Liu</span>{" "}
            <span className="text-xs text-muted-foreground ml-2">
              frank@example.com
            </span>
          </span>
        ),
      },
      {
        id: "u7",
        label: (
          <span>
            <span className="font-medium">Grace Hall</span>{" "}
            <span className="text-xs text-muted-foreground ml-2">
              grace@example.com
            </span>
          </span>
        ),
      },
      {
        id: "u8",
        label: (
          <span>
            <span className="font-medium">Henry Wright</span>{" "}
            <span className="text-xs text-muted-foreground ml-2">
              henry@example.com
            </span>
          </span>
        ),
      },
      {
        id: "u9",
        label: (
          <span>
            <span className="font-medium">Ivy Chen</span>{" "}
            <span className="text-xs text-muted-foreground ml-2">
              ivy@example.com
            </span>
          </span>
        ),
      },
      {
        id: "u10",
        label: (
          <span>
            <span className="font-medium">Jackie O'Neil</span>{" "}
            <span className="text-xs text-muted-foreground ml-2">
              jackie@example.com
            </span>
          </span>
        ),
      },
      {
        id: "u11",
        label: (
          <span>
            <span className="font-medium">Khalid Rahman</span>{" "}
            <span className="text-xs text-muted-foreground ml-2">
              khalid@example.com
            </span>
          </span>
        ),
      },
      {
        id: "u12",
        label: (
          <span>
            <span className="font-medium">Luna Park</span>{" "}
            <span className="text-xs text-muted-foreground ml-2">
              luna@example.com
            </span>
          </span>
        ),
      },
    ],
    [],
  );

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

  const handleViewCashiers = () => {
    setShowViewDialog(true);
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
          onViewCashiers={() => void handleViewCashiers()}
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

        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>View Cashiers</DialogTitle>
              <DialogDescription />
            </DialogHeader>

            <div className="flex items-center gap-2 mb-4">
              <Input placeholder="Search cashier..." className="flex-1" />
              <LiquidButton
                size="lg"
                variant="default"
                type="button"
                onClick={() => {
                  setCheckedViewIds([]);
                }}>
                Refresh
              </LiquidButton>
              <LiquidButton
                size="lg"
                variant="default"
                type="button"
                onClick={() => {
                  if (checkedViewIds.length === 0) {
                    toast.error("Select cashiers to unassign");
                    return;
                  }
                  toast.success(
                    `Unassigned ${checkedViewIds.length} cashier(s)`,
                  );
                  setCheckedViewIds([]);
                }}>
                Unassign cashiers
              </LiquidButton>
            </div>

            {mockViewItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No cashiers found.
              </div>
            ) : (
              <ScrollArea className="max-h-64">
                <PlayfulTodolist
                  items={mockViewItems}
                  onCheckedChange={(ids) => setCheckedViewIds(ids)}
                />
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};

export default DetailContent;
