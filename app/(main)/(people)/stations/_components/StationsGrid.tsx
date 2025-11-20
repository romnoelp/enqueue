"use client";

import { StationMorphingDialogTest } from "@/app/(main)/(people)/stations/_components/StationMorphDialog";
import type { StationListItem } from "@/types/station";

const StationsGrid = ({
  items,
  onRefresh,
}: {
  items: StationListItem[];
  onRefresh?: () => void | Promise<void>;
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((stationItem, index) => (
        <StationMorphingDialogTest
          key={String(stationItem?.id ?? `station-${index}`)}
          station={stationItem}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};

export default StationsGrid;
