"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Mail, Clock, Shield, DollarSign, Info, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PendingEmployeeCardProps = {
  name: string;
  email: string;
  role?: "pending" | "admin" | "cashier" | "information" | "superAdmin";
  createdAt?: number;
  onAccept?: () => void;
  onReject?: () => void;
  acceptLabel?: string;
  rejectLabel?: string;
};

const roleIconMap = {
  admin: Shield,
  cashier: DollarSign,
  information: Info,
  pending: Clock,
  superAdmin: Crown,
} as const;

export default function PendingEmployeeCard({
  name,
  email,
  role = "pending",
  createdAt,
  onAccept,
  onReject,
  acceptLabel = "Accept",
  rejectLabel = "Reject",
}: PendingEmployeeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const Icon = roleIconMap[role] || Info;

  return (
    <div
      className="group relative w-full max-w-sm h-[200px] p-2 perspective-[2000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={cn(
          "relative h-full w-full",
          "transform-3d",
          "transition-all duration-700"
        )}
        style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "transform-[rotateY(0deg)] backface-hidden"
          )}
        >
          <div className="scale-in visible cursor-pointer h-full">
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl p-6 shadow-md",
                "transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg",
                "bg-card text-card-foreground border border-border h-full flex flex-col"
              )}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

              <div className="relative flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3
                    className="font-sans font-semibold leading-tight truncate"
                    style={{ fontSize: "clamp(0.8rem, 2.5vw, 1.125rem)" }}
                  >
                    {name}
                  </h3>

                  <p
                    className="text-sm text-muted-foreground capitalize truncate"
                    style={{ fontSize: "clamp(0.7rem, 2vw, 0.875rem)" }}
                  >
                    {role}
                  </p>
                </div>

                <div className="h-px bg-border/50 my-2" />

                <div className="flex items-center text-muted-foreground overflow-hidden whitespace-nowrap">
                  <Mail className="mr-2 h-4 w-4 text-primary/70 shrink-0" />
                  <span
                    className="truncate"
                    style={{ fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)" }}
                  >
                    {email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "transform-[rotateY(180deg)] backface-hidden"
          )}
        >
          <div
            className={cn(
              "rounded-2xl p-4 h-full",
              "bg-linear-to-br from-white via-slate-50 to-slate-100",
              "dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800",
              "border border-slate-200 dark:border-zinc-800",
              "shadow-lg dark:shadow-xl flex flex-col items-center justify-center gap-4"
            )}
          >
            <div className="from-primary/5 dark:from-primary/10 absolute inset-0 rounded-2xl bg-linear-to-br via-transparent to-blue-500/5 dark:to-blue-500/10" />

            <div className="relative z-10 flex flex-col items-center gap-3">
              <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
                Accept new user?
              </h3>
              {createdAt ? (
                <span className="text-[11px] text-muted-foreground">
                  Requested {new Date(createdAt).toLocaleDateString()}
                </span>
              ) : null}
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" variant="destructive" onClick={onReject}>
                  {rejectLabel}
                </Button>
                <Button size="sm" onClick={onAccept}>
                  {acceptLabel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          0% {
            transform: translateX(-100px);
            opacity: 0;
          }
          50% {
            transform: translateX(0);
            opacity: 0.8;
          }
          100% {
            transform: translateX(100px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
