"use client";

import React from "react";
import { StationMorphingDialogTest } from "@/app/(main)/(people)/stations/_components/StationMorphDialog";

const StationsGrid = ({ items }: { items: Array<Record<string, unknown>> }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((stationItem, index) => (
        <StationMorphingDialogTest
          key={(stationItem?.id as string) ?? `station-${index}`}
          station={stationItem as any}
        />
      ))}
    </div>
  );
};

export default StationsGrid;
