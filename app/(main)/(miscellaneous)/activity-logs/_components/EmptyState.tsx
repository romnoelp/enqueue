import { TableRow, TableCell } from "@/components/ui/table";

const EmptyState = () => (
  <TableRow>
    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
      No logs found for the selected date range
    </TableCell>
  </TableRow>
);

export default EmptyState;
