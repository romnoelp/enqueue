export interface QueueTokenPayload {
  id: string;
  type: TokenType;
  queueID?: string; // For queue-status tokens (e.g., "R001")
  stationID?: string; // For queue-status tokens
  email?: string; // For queue-status tokens
  access?: boolean; // For permission tokens
  [key: string]: unknown;
}

export type TokenType = "permission" | "queue-form" | "queue-status";

export type CustomerStatus = "pending" | "ongoing" | "complete" | "unsuccessful";

export interface Customer {
  email: string;
  customerStatus: CustomerStatus;
  purpose: string;
  queueID: number;
  stationID: string;
  timestamp: number;
}
