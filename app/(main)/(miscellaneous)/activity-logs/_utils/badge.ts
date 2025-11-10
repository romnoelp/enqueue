export const getBadgeVariant = (
  action: string
): "default" | "secondary" | "destructive" => {
  if (
    ["BLOCK_EMAIL", "SKIP_CUSTOMER", "LOG_OUT"].includes(action) ||
    action.startsWith("DELETE")
  ) {
    return "destructive";
  }
  if (
    action.startsWith("EDIT") ||
    ["ASSIGN_ROLE", "UNBLOCK_EMAIL"].includes(action)
  ) {
    return "secondary";
  }
  return "default";
};
