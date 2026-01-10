"use client";

import { useState } from "react";
import type { Station as ImportedStation } from "@/types/station";
import FlipCardFront from "./FlipCardFront";
import FlipCardBack from "./FlipCardBack";
import { toast } from "sonner";
import { apiFetch } from "@/app/lib/backend/api";

type Station = Partial<ImportedStation> & {
  id?: string | number;
  role?: string;
  email?: string;
  name?: string;
};

type Props = {
  station?: Station;
  title: string;
  onDeleted?: () => void | Promise<void>;
};
const FlipCard = ({ station, title, onDeleted }: Props) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const CARD_HEIGHT = 200;
  const FLIP_DURATION = 300;

  const handleDelete = async () => {
    if (!station?.id) {
      toast.error("Station ID is missing");
      return;
    }

    setIsDeleting(true);
    try {
      await apiFetch(
        `/stations/delete/${encodeURIComponent(String(station.id))}`,
        { method: "DELETE" }
      );
      toast.success(`${station?.name ?? "Station"} deleted`);
      if (onDeleted) await onDeleted();
    } catch (err) {
      console.error("Failed to delete station", err);
      toast.error((err as Error).message || "Failed to delete station");
    } finally {
      setIsDeleting(false);
    }
  };

  // delete handler and isDeleting are passed down to the back-face component

  return (
    <div
      className="group relative w-full max-w-sm perspective-[2000px]"
      style={{ height: CARD_HEIGHT }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className="relative h-full w-full transform-3d transition-all"
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transitionDuration: `${FLIP_DURATION}ms`,
        }}
      >
        {/* Front face */}
        <FlipCardFront title={title} station={station} />

        {/* Back face */}
        <FlipCardBack
          onDialogOpenChange={(open) => {
            if (!open) setIsFlipped(false);
          }}
          isDeleting={isDeleting}
          handleDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default FlipCard;
