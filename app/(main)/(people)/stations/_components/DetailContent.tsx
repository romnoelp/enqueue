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
import { Switch } from "@/components/animate-ui/components/base/switch";

const DetailContent = ({
  initialData,
  loading,
  onSave,
}: {
  initialData?: Partial<Station> | null;
  loading?: boolean;
  onSave?: (payload: Partial<Station> | null) => Promise<void>;
}) => {
  // keep hooks unconditional; render loader inside the Card below when `loading` is true
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [typeValue, setTypeValue] = useState("");
  const [activated, setActivated] = useState<boolean>(false);

  useEffect(() => {
    if (!initialData) return;

    // Defer state updates to the microtask queue to avoid synchronous setState within the effect
    queueMicrotask(() => {
      setName((prev) => {
        const next = initialData.name ?? "";
        return prev === next ? prev : next;
      });
      setDescription((prev) => {
        const next = initialData.description ?? "";
        return prev === next ? prev : next;
      });
      setTypeValue((prev) => {
        const next = initialData.type ?? "";
        return prev === next ? prev : next;
      });
      setActivated((prev) => {
        const next = initialData.activated ?? false;
        return prev === next ? prev : next;
      });
    });
  }, [initialData]);

  const [isSaving, setIsSaving] = useState(false);

  const isDirty = useMemo(() => {
    const ini = initialData ?? {};
    const nameChanged = (ini.name ?? "") !== name;
    const descChanged = (ini.description ?? "") !== description;
    const typeChanged = String(ini.type ?? "") !== typeValue;
    const activatedChanged = (ini.activated ?? false) !== activated;
    return nameChanged || descChanged || typeChanged || activatedChanged;
  }, [initialData, name, description, typeValue, activated]);

  return (
    <Card className="h-full p-4">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <BounceLoader />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-y-2">
            <p className="font-bold">Update Station </p>
            <p className="font-light text-sm">
              Modify details for station name
            </p>
          </div>

          {/* Station Name */}
          <div className="flex flex-col gap-y-2">
            <Label className="font-semibold" htmlFor="stationName">
              Name
            </Label>
            <Input
              id="stationName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Some place elsewhere..."
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-y-2">
            <Label className="font-semibold" htmlFor="stationDesc">
              Description
            </Label>
            <Textarea
              id="stationDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A very beautiful place..."
            />
          </div>

          {/* Station Type */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-y-2 sm:w-[220px]">
              <Label className="font-semibold">Station Type</Label>
              <Select value={typeValue} onValueChange={(v) => setTypeValue(v)}>
                <SelectTrigger className="w-full">
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
              <Label className="flex items-center gap-x-3">
                <Switch checked={activated} onCheckedChange={setActivated} />
                <span>Activated</span>
              </Label>
            </div>
          </div>

          <div className="flex justify-end">
            {isDirty ? (
              <FlipButton disabled={isSaving}>
                <FlipButtonFront size={"lg"} variant={"outline"}>
                  {isSaving ? "Saving..." : "Hover to keep data!"}
                </FlipButtonFront>
                <FlipButtonBack
                  size={"lg"}
                  onClick={async () => {
                    if (!onSave) return;
                    setIsSaving(true);
                    try {
                      await onSave({
                        name,
                        description,
                        type: typeValue as Station["type"],
                        activated,
                      });
                    } catch (err) {
                      console.error("Save failed", err);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                >
                  Save Changes
                </FlipButtonBack>
              </FlipButton>
            ) : null}
          </div>
        </>
      )}
    </Card>
  );
};

export default DetailContent;
