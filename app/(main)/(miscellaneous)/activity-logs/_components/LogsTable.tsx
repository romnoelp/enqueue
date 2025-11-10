import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import React from "react";

const LogsTable = ({ children }: { children: React.ReactNode }) => (
  <ScrollArea className="h-full">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>User ID</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  </ScrollArea>
);

export default LogsTable;
