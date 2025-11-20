"use client";

import React from "react";
import type { Station as ImportedStation } from "@/types/station";

type Station = Partial<ImportedStation> & {
  id?: string | number;
  role?: string;
  email?: string;
  name?: string;
  activated?: boolean;
};

const FlipCardFront = ({
  title,
  station,
}: {
  title: string;
  station?: Station;
}) => {
  return (
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
  );
};

export default FlipCardFront;
