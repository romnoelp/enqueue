export type PendingEmployeeCardProps = {
  name: string;
  email: string;
  role?: "pending" | "admin" | "cashier" | "information" | "superAdmin";
  createdAt?: number;
  onAccept?: () => void;
  acceptLabel?: string;
};
