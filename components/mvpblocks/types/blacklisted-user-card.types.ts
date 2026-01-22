export type BlacklistedUserCardProps = {
  email: string;
  reason: string;
  blockedBy: string;
  onRemove?: () => void;
  removeLabel?: string;
};
