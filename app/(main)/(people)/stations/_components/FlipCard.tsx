"use client";

import { useState } from "react";
import type { Station as ImportedStation } from "@/types/station";
import { MorphingDialogTrigger } from "@/components/motion-primitives/morphing-dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/animate-ui/components/radix/alert-dialog";
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  useAlertDialog,
} from "@/components/animate-ui/components/radix/alert-dialog";
import { toast } from "sonner";
import { apiFetch } from "@/app/lib/backend/api";
import ButtonLoading from "@/components/ui/button-loading";

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
        `/station/delete/${encodeURIComponent(String(station.id))}`,
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

  const DeleteConfirmButton = () => {
    const { setIsOpen } = useAlertDialog();

    const onConfirm = async () => {
      await handleDelete();
      setIsOpen?.(false);
    };

    if (isDeleting) {
      return (
        <ButtonLoading disabled size="sm">
          Deleting...
        </ButtonLoading>
      );
    }

    return (
      <Button variant="destructive" onClick={() => void onConfirm()}>
        Yes, I&apos;m sure
      </Button>
    );
  };

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
        <div className="absolute inset-0 h-full w-full transform-[rotateY(0deg)] backface-hidden">
          <div className="scale-in group visible cursor-pointer h-full">
            <div
              className={`
                relative transform overflow-hidden rounded-2xl p-6 shadow-md
                transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg
                bg-card text-card-foreground border border-border h-full flex flex-col
              `}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-primary"></div>

              <div className="relative flex-1 flex flex-col justify-start">
                <div className="space-y-2 text-left">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>

                  <h3
                    className="font-sans font-semibold leading-tight truncate"
                    title={title}
                    style={{
                      fontSize: "clamp(0.8rem, 2.5vw, 1.125rem)",
                      maxWidth: "100%",
                    }}
                  >
                    {title}
                  </h3>

                  <div
                    className="flex items-center text-sm text-muted-foreground"
                    style={{ fontSize: "clamp(0.7rem, 2vw, 0.875rem)" }}
                  >
                    {station?.activated ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary/80"
                        aria-hidden
                      >
                        <circle cx="12" cy="12" r="8" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary/80"
                        aria-hidden
                      >
                        <circle cx="12" cy="12" r="8" strokeDasharray="2 2" />
                      </svg>
                    )}
                    <span className="ml-2 capitalize">
                      {station?.activated ? "active" : "inactive"}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border/50 my-2"></div>

                <div className="flex items-center text-muted-foreground overflow-hidden whitespace-nowrap">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-primary/70 shrink-0"
                    aria-hidden
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  <span
                    className="truncate capitalize"
                    style={{ fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)" }}
                  >
                    {station?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back face */}
        <div className="absolute inset-0 h-full w-full transform-[rotateY(180deg)] backface-hidden">
          <div
            className={
              "rounded-2xl p-6 h-full flex flex-col items-center justify-center bg-card text-card-foreground border border-border shadow-md"
            }
          >
            <h3 className="text-lg font-semibold mb-1">Actions</h3>

            <div className="flex gap-x-4">
              <MorphingDialogTrigger>
                <Button asChild>
                  <span>Manage</span>
                </Button>
              </MorphingDialogTrigger>

              <AlertDialog onOpenChange={(open) => { if (!open) setIsFlipped(false); }}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Station</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      This action cannot be undone
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this station?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {isDeleting ? (
                      <ButtonLoading disabled size="sm">
                        Deleting...
                      </ButtonLoading>
                    ) : (
                      <DeleteConfirmButton />
                    )}
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
