export interface QueueTokenPayload {
  id?: string | Record<string, unknown>;
  token?: string;
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
