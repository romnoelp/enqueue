"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { apiFetch } from "@/app/lib/backend/api";
import { parseStationsResponse } from "@/lib/backend/parse-stations";
import StationsGrid from "@/app/(main)/(people)/stations/_components/StationsGrid";
import AddStationDialog from "./_components/AddStationDialog";

type Station = {
  id?: string | number;
  name?: string;
  role?: string;
  email?: string;
};

const LoadingState = () => (
  <div className="h-full flex items-center justify-center">
    <BounceLoader />
  </div>
);

const ErrorState = ({ message }: { message: string | null }) => (
  <div className="text-red-500">Error loading stations: {message}</div>
);

const Stations = () => {
  const [stations, setStations] = useState<Station[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await apiFetch<unknown>("/stations/stations");
      const raw = parseStationsResponse(res);
      const list = raw.map((rawItem) => ({
        id: (rawItem.id ?? rawItem.uid ?? "") as string,
        name: (rawItem.name ?? "") as string,
        role: (rawItem.type ?? rawItem.role ?? "") as string,
        email: (rawItem.description ?? rawItem.email ?? "") as string,
      }));
      setStations(list);
      setError(null);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? String(err));
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) void fetchStations();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-4 h-full flex flex-col gap-y-4">
      <div className="flex gap-x-4">
        <Input
          placeholder="Main Building..."
          className="text-muted-foreground w-92"
        />
        <AddStationDialog onCreated={() => void fetchStations()} />
      </div>
      <div className="h-full">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && (
          <StationsGrid
            items={stations ?? []}
            onRefresh={() => void fetchStations(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Stations;
