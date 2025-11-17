"use client";

import { useEffect, useState } from "react";
import type {
  Station as ImportedStation,
  StationApiItem,
  StationInitialData,
  StationListItem,
} from "@/types/station";
import {
  MorphingDialog,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogContainer,
} from "@/components/motion-primitives/morphing-dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DetailContent from "./DetailContent";
import FlipCard from "./FlipCard";

export const StationMorphingDialogTest = ({ station }: { station?: StationListItem }) => {
  const title = station?.name ?? "New Station";
  const [initialData, setInitialData] = useState<StationInitialData>(null);

  useEffect(() => {
    const abort = { aborted: false };

    (async () => {
      try {
        const res = await fetch("/api/station/get");
        const data = await res.json();
        if (abort.aborted) return;

        const list = Array.isArray(data?.cashierLocationList)
          ? data.cashierLocationList
          : [];

        const found = (list as StationApiItem[]).find(
          (stationItem) => String(stationItem.id) === String(station?.id)
        );

        if (found) {
          setInitialData({
            name: found.name,
            description: found.description,
            type: found.type as unknown as ImportedStation["type"],
            activated: found.activated,
          });
        } else {
          setInitialData(null);
        }
      } catch (err) {
        console.error("Failed to fetch stations", err);
        setInitialData(null);
      }
    })();

    return () => {
      abort.aborted = true;
    };
  }, [station?.id]);

  return (
    <MorphingDialog
      transition={{
        type: "spring",
        bounce: 0.05,
        duration: 0.25,
      }}
    >
      <FlipCard station={station} title={title} />

      <MorphingDialogContainer>
        <MorphingDialogContent className="p-4 rounded-lg pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900 sm:h-[530px] sm:w-[530px]">
          <Tabs defaultValue="" className="h-full flex flex-col items-center">
            <TabsList className="details">
              <TabsTrigger className="w-xs" value="details">
                Details
              </TabsTrigger>
              <TabsTrigger value="counters">Counters</TabsTrigger>
            </TabsList>

            <TabsContent className="w-full" value="details">
              <DetailContent initialData={initialData} />
            </TabsContent>
            <TabsContent value="counters">counters</TabsContent>
          </Tabs>
          <MorphingDialogClose className="text-zinc-50" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
};
