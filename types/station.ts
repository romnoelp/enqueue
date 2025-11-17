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

export interface StationApiItem {
  id?: string | number;
  name?: string;
  description?: string;
  type?: CashierType | string;
  activated?: boolean;
}

export type StationInitialData = Partial<Station> | null;

// Represents the station object used in lists/pages (may include metadata)
export type StationListItem = Partial<Station> & {
  id?: string | number;
  role?: string;
  email?: string;
  name?: string;
};
