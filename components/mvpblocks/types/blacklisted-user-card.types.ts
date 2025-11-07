export type BlacklistedUserCardProps = {
  email: string;
  reason: string;
  onRemove?: () => void;
  removeLabel?: string;
};
