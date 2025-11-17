"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StationMorphingDialogTest } from "./_components/StationMorphDialog";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { apiFetch } from "@/app/lib/backend/api";

type Station = {
  id?: string | number;
  name?: string;
  role?: string;
  email?: string;
};

const parseStationsResponse = (res: unknown): Station[] => {
  if (Array.isArray(res)) return res as Station[];

  if (!res || typeof res !== "object") return [];

  const obj = res as Record<string, unknown>;

  const candidates = ["data", "stations", "rows"];
  for (const key of candidates) {
    if (Array.isArray(obj[key])) return obj[key] as Station[];
  }

  if (Array.isArray(obj.cashierLocationList)) {
    const raw = obj.cashierLocationList as unknown as Array<
      Record<string, unknown>
    >;
    return raw.map((rawItem) => ({
      id: (rawItem.id ?? rawItem.uid ?? "") as string,
      name: (rawItem.name ?? "") as string,
      role: (rawItem.type ?? rawItem.role ?? "") as string,
      email: (rawItem.description ?? rawItem.email ?? "") as string,
    }));
  }

  return [];
};

const LoadingState = () => (
  <div className="h-full flex items-center justify-center">
    <BounceLoader />
  </div>
);

const ErrorState = ({ message }: { message: string | null }) => (
  <div className="text-red-500">Error loading stations: {message}</div>
);

const StationsGrid = ({ items }: { items: Station[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {items.map((stationItem, index) => (
      <StationMorphingDialogTest
        key={stationItem?.id ?? `station-${index}`}
        station={stationItem}
      />
    ))}
  </div>
);

const Stations = () => {
  const [stations, setStations] = useState<Station[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchStations = async () => {
      try {
        const res = await apiFetch<unknown>("/station/get");
        const list = parseStationsResponse(res);
        if (mounted) setStations(list);
      } catch (err: unknown) {
        if (mounted)
          setError((err as { message?: string })?.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStations();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-4 h-full flex flex-col gap-y-4">
      <div className="flex gap-x-4">
        <Input className="w-64" />
        <Button>Add Station</Button>
      </div>
      <div className="h-full">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && <StationsGrid items={stations ?? []} />}
      </div>
    </div>
  );
};

export default Stations;
