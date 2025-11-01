export type CashierType = "payment" | "clinic" | "auditing" | "registrar";

export interface Station {
  name: string;
  description: string;
  type: CashierType;
  activated: boolean;
}

export interface Counter {
  counterNumber: number;
  stationID: string;
  uid: string;
  serving: string | null;
}
