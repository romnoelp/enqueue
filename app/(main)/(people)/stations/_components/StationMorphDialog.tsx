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
import { apiFetch } from "@/app/lib/backend/api";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DetailContent from "./DetailContent";
import FlipCard from "./FlipCard";

export const StationMorphingDialogTest = ({
  station,
}: {
  station?: StationListItem;
}) => {
  const title = station?.name ?? "New Station";
  const [initialData, setInitialData] = useState<StationInitialData>(null);
  const [loadingInitialData, setLoadingInitialData] = useState<boolean>(true);

  useEffect(() => {
    const abort = { aborted: false };
    if (station) {
      setInitialData({
        name: station.name ?? "",
        description: station.description ?? "",
        type: station.type as unknown as ImportedStation["type"],
        activated: Boolean(station.activated),
      });
    } else {
      setInitialData(null);
    }

    (async () => {
      if (!abort.aborted) setLoadingInitialData(true);
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
          if (!station) setInitialData(null);
        }
      } catch (err) {
        console.error("Failed to fetch stations", err);
        if (!station) setInitialData(null);
      } finally {
        if (!abort.aborted) setLoadingInitialData(false);
      }
    })();

    return () => {
      abort.aborted = true;
    };
  }, [station]);

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
              <DetailContent
                initialData={initialData}
                loading={loadingInitialData}
                onSave={async (payload: StationInitialData) => {
                  try {

                    const body = { id: station?.id, ...(payload ?? {}) };
                    await apiFetch("/station/update", {
                      method: "POST",
                      body: JSON.stringify(body),
                      headers: { "Content-Type": "application/json" },
                    });

                    setInitialData((prev) => ({ ...(prev ?? {}), ...payload }));
                  } catch (err) {
                    console.error("Failed to save station", err);
                    throw err;
                  }
                }}
              />
            </TabsContent>
            <TabsContent value="counters">counters</TabsContent>
          </Tabs>
          <MorphingDialogClose className="text-zinc-50" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
};
