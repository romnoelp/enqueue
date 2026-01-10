import { NextRequest, NextResponse } from "next/server";

// Activation/deactivation has been removed from the frontend.
// Keep this helper for compatibility, but do not block any operations.
export const checkStationActivation = async (
  request: NextRequest,
  stationID: string
): Promise<NextResponse | null> => {
  void request;
  void stationID;
  return null;
};
