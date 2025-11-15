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

const Stations = () => {
  const [stations, setStations] = useState<Station[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchStations = async () => {
      try {
        const res = await apiFetch<unknown>("/station/get");
        let list: Station[] = [];

        if (Array.isArray(res)) {
          list = res as Station[];
        } else if (res && typeof res === "object") {
          const obj = res as Record<string, unknown>;
          if (Array.isArray(obj.data)) list = obj.data as Station[];
          else if (Array.isArray(obj.stations))
            list = obj.stations as Station[];
          else if (Array.isArray(obj.rows)) list = obj.rows as Station[];
          else if (Array.isArray(obj.cashierLocationList)) {
            // Some endpoints (e.g. cashier location list) return a wrapped object
            // { cashierLocationList: [ ...items ] } where each item has fields like
            // { id, activated, description, name, type }.
            // Map those into our local Station shape.
            const raw = obj.cashierLocationList as unknown as Array<
              Record<string, unknown>
            >;
            list = raw.map((it) => ({
              id: (it.id ?? it.uid ?? "") as string,
              name: (it.name ?? "") as string,
              role: (it.type ?? it.role ?? "") as string,
              email: (it.description ?? it.email ?? "") as string,
            }));
          } else list = [];
        }

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
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <BounceLoader />
          </div>
        ) : error ? (
          <div className="text-red-500">Error loading stations: {error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(stations || []).map((s, i) => (
              <StationMorphingDialogTest
                key={s?.id ?? `station-${i}`}
                station={s}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stations;
