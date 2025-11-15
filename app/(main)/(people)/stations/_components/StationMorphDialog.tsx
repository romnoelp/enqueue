"use client";

import React from "react";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogImage,
  MorphingDialogSubtitle,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
} from "@/components/motion-primitives/morphing-dialog";

type Station = {
  id?: string | number;
  name?: string;
  role?: string;
  email?: string;
  image?: string;
  description?: string;
  activated?: boolean;
  type?: string;
};

export function StationMorphingDialogTest({ station }: { station?: Station }) {
  const title = station?.name ?? "New Station";
  const subtitle = station?.type ?? station?.role ?? "station";
  const img = station?.image ?? "/eb-27-lamp-edouard-wilfrid-buquet.jpg";

  return (
    <MorphingDialog
      transition={{
        type: "spring",
        bounce: 0.05,
        duration: 0.25,
      }}
    >
      <MorphingDialogTrigger className="w-full">
        <div className="w-full max-w-sm h-[200px] p-2">
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
                    className="font-sans font-semibold leading-tight"
                    style={{ fontSize: "clamp(0.8rem, 2.5vw, 1.125rem)" }}
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
                  >
                    <path d="M4 4h16v16H4z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span
                    className="truncate"
                    style={{ fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)" }}
                  >
                    {station?.role }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{ borderRadius: "24px" }}
          className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900 sm:w-[500px]"
        >
          <MorphingDialogImage
            src={img}
            alt={title}
            className="h-full w-full"
          />
          <div className="p-6">
            <MorphingDialogTitle className="text-2xl text-zinc-950 dark:text-zinc-50">
              {title}
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="text-zinc-700 dark:text-zinc-400">
              {subtitle}
            </MorphingDialogSubtitle>
            <MorphingDialogDescription
              disableLayoutAnimation
              variants={{
                initial: { opacity: 0, scale: 0.8, y: 100 },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.8, y: 100 },
              }}
            >
              <p className="mt-2 text-zinc-500 dark:text-zinc-500">
                {station?.description ?? station?.email ?? "No additional info"}
              </p>
            </MorphingDialogDescription>
          </div>
          <MorphingDialogClose className="text-zinc-50" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
