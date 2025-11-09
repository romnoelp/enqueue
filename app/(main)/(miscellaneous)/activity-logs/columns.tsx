"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ActivityLog } from "@/types";

// Action type colors for better visual distinction
const ACTION_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  LOG_IN: "default",
  LOG_OUT: "secondary",
  SERVE_CUSTOMER: "default",
  SKIP_CUSTOMER: "secondary",
  COMPLETE_TRANSACTION: "default",
  ASSIGN_ROLE: "default",
  ADD_STATION: "default",
  EDIT_STATION: "secondary",
  DELETE_STATION: "destructive",
  ADD_COUNTER: "default",
  EDIT_COUNTER: "secondary",
  DELETE_COUNTER: "destructive",
  JOIN_QUEUE: "default",
  LEAVE_QUEUE: "secondary",
  BLOCK_EMAIL: "destructive",
  UNBLOCK_EMAIL: "default",
};

// Format action type for display
const formatAction = (action: string) => {
  return action
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

// Format timestamp to readable date
const formatTimestamp = (timestamp: number) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
};

export type ActivityLogWithId = ActivityLog & { id: string };

export const columns: ColumnDef<ActivityLogWithId>[] = [
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => (
      <div className="font-medium">
        {formatTimestamp(row.getValue("timestamp"))}
      </div>
    ),
  },
  {
    accessorKey: "uid",
    header: "User ID",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("uid")}</div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      return (
        <Badge variant={ACTION_COLORS[action] || "default"}>
          {formatAction(action)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <div className="text-muted-foreground max-w-md truncate text-sm">
        {row.getValue("details") || "—"}
      </div>
    ),
  },
];
