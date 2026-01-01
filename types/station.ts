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

export type StationApiItem = Partial<Station> & {
  id?: string | number;
};

export type StationInitialData = Partial<Station> | null;

export type StationListItem = StationApiItem & {
  role?: string;
  email?: string;
};
