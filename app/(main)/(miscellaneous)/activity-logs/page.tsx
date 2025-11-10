"use client";

import { useState, useEffect, useCallback } from "react";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { fetchLogs } from "./_utils/data";
import LogsTable from "./_components/LogsTable";
import LogRow from "./_components/LogRow";
import EmptyState from "./_components/EmptyState";
import ErrorState from "./_components/ErrorState";
import Actions from "./_components/Actions";
import type { ActivityLog } from "@/types/activity";

const ActivityLogs = () => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [startDate, setStartDate] = useState<Date | undefined>(sevenDaysAgo);
  const [endDate, setEndDate] = useState<Date | undefined>(today);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchLogs(startDate, endDate);
      setLogs(data);
    } catch {
      setError("Failed to load activity logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (loading) {
    return (
      <div className="h-full flex flex-col gap-y-4 p-4">
        <Actions
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <div className="flex-1 flex items-center justify-center">
          <BounceLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col gap-y-4 p-4">
        <Actions
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <div className="flex-1">
          <ErrorState message={error} onRetry={loadLogs} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-y-4 p-4">
      <Actions
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <div className="flex-1 overflow-hidden">
        {logs.length === 0 ? (
          <LogsTable>
            <EmptyState />
          </LogsTable>
        ) : (
          <LogsTable>
            {logs.map((log) => (
              <LogRow
                key={`${log.timestamp}-${log.uid}-${log.action}`}
                log={log}
              />
            ))}
          </LogsTable>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
