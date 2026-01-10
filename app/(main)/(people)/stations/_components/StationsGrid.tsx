"use client";

import { StationMorphingDialogTest } from "@/app/(main)/(people)/stations/_components/StationMorphDialog";
import type { StationListItem } from "@/types/station";
import * as motion from "motion/react-client";

const StationsGrid = ({
  items,
  onRefresh,
}: {
  items: StationListItem[];
  onRefresh?: () => void | Promise<void>;
}) => {
  if (items.length === 0) {
    return (
      <motion.div
        className="flex justify-center items-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-gray-500 dark:text-gray-400">
          There is currently no active station.
        </p>
      </motion.div>
    );
  }

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
