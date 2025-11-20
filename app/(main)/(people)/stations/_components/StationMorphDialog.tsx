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
import CounterContent from "./CounterContent";

export const StationMorphingDialogTest = ({
  station,
  onRefresh,
}: {
  station?: StationListItem;
  onRefresh?: () => void | Promise<void>;
}) => {
  const title = station?.name ?? "New Station";
  const [initialData, setInitialData] = useState<StationInitialData>(null);
  const [currentStation, setCurrentStation] = useState<
    StationListItem | undefined
  >(station);
  const [loadingInitialData, setLoadingInitialData] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("details");

  useEffect(() => {
    const abort = { aborted: false };
    setCurrentStation(station);

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
          // Update local station display with freshest data
          setCurrentStation(
            (prev) => ({ ...(prev ?? {}), ...found } as StationListItem)
          );
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
      <FlipCard
        station={currentStation}
        title={currentStation?.name ?? title}
        onDeleted={onRefresh}
      />

      <MorphingDialogContainer>
        <MorphingDialogContent
          className={`p-4 rounded-lg pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900 ${
            activeTab === "counters"
              ? "h-[680px] w-[700px] sm:h-[720px] sm:w-[760px]"
              : "sm:h-[530px] sm:w-[530px]"
          }`}
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v)}
            className="h-full flex flex-col items-center"
          >
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
                    if (!station?.id) throw new Error("Station ID is missing");

                    const body = { ...(payload ?? {}) };
                    await apiFetch(
                      `/station/update/${encodeURIComponent(
                        String(station.id)
                      )}`,
                      {
                        method: "PUT",
                        body: JSON.stringify(body),
                        headers: { "Content-Type": "application/json" },
                      }
                    );

                    // Update the dialog's initial data and the local station
                    setInitialData((prev) => ({ ...(prev ?? {}), ...payload }));
                    setCurrentStation(
                      (prev) =>
                        ({ ...(prev ?? {}), ...payload } as StationListItem)
                    );

                    try {
                      const closeBtn = document.querySelector(
                        'button[aria-label="Close dialog"]'
                      ) as HTMLButtonElement | null;
                      if (closeBtn) closeBtn.click();
                    } catch {}
                  } catch (err) {
                    console.error("Failed to save station", err);
                    throw err;
                  }
                }}
              />
            </TabsContent>
            <TabsContent value="counters" className="w-full">
              <CounterContent />
            </TabsContent>
          </Tabs>
          <MorphingDialogClose className="text-zinc-50" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
};
