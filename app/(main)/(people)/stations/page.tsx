"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Station tiles are rendered by `StationsGrid` component.
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { apiFetch } from "@/app/lib/backend/api";
import { parseStationsResponse } from "@/lib/backend/parse-stations";
import StationsGrid from "@/components/stations/StationsGrid";

type Station = {
  id?: string | number;
  name?: string;
  role?: string;
  email?: string;
  activated?: boolean;
};

// parseStationsResponse is moved to `lib/backend/parse-stations` and will
// return an array of raw station-like objects; we map them below into the
// local `Station` shape where necessary.

const LoadingState = () => (
  <div className="h-full flex items-center justify-center">
    <BounceLoader />
  </div>
);

const ErrorState = ({ message }: { message: string | null }) => (
  <div className="text-red-500">Error loading stations: {message}</div>
);

// `StationsGrid` extracted to `components/stations/StationsGrid`.

const Stations = () => {
  const [stations, setStations] = useState<Station[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchStations = async () => {
      try {
        const res = await apiFetch<unknown>("/station/get");
        const raw = parseStationsResponse(res);
        const list = raw.map((rawItem) => ({
          id: (rawItem.id ?? rawItem.uid ?? "") as string,
          name: (rawItem.name ?? "") as string,
          role: (rawItem.type ?? rawItem.role ?? "") as string,
          email: (rawItem.description ?? rawItem.email ?? "") as string,
          activated: Boolean(rawItem.activated ?? rawItem.active ?? false),
        }));
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
