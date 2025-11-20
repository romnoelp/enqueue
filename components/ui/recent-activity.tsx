"use client";

import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Activity, User, Download, Settings, Users } from "lucide-react";

type ActivityItem = {
  id?: string;
  uid?: string;
  action?: string;
  details?: Record<string, unknown>;
  timestamp?: number;
  displayName?: string;
  email?: string;
};

const timeAgo = (ts?: number) => {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const RecentActivity = memo(() => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchActivities = async () => {
      try {
        // default to last 7 days
        const end = new Date().toISOString();
        const start = new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString();

        const res = await fetch(
          `/api/admin/get-activity?startDate=${start}&endDate=${end}`
        );
        const json = await res.json();
        const items: ActivityItem[] = Array.isArray(json.activities)
          ? json.activities.map((a: any) => ({
              id: a.id,
              uid: a.uid ?? a.actorUID ?? a.actor ?? undefined,
              action: a.action ?? String(a.type ?? "action"),
              details: a.details ?? a.data ?? undefined,
              timestamp:
                typeof a.timestamp === "number"
                  ? a.timestamp
                  : Number(a.timestamp) ?? undefined,
            }))
          : [];

        // Resolve user display names for any unique UIDs returned
        const uniqueUids = Array.from(
          new Set(items.map((it) => it.uid).filter(Boolean))
        );
        const userMap: Record<
          string,
          { displayName?: string; email?: string }
        > = {};

        if (uniqueUids.length > 0) {
          const userFetches = uniqueUids.map((u) =>
            fetch(`/api/admin/user-data/${encodeURIComponent(u as string)}`)
              .then((r) => r.json())
              .then((j) => ({ uid: u, data: j.userData }))
              .catch(() => ({ uid: u, data: null }))
          );

          const resolved = await Promise.all(userFetches);
          for (const r of resolved) {
            if (r && r.uid && r.data) {
              userMap[r.uid as string] = {
                displayName:
                  (r.data as any).displayName ?? (r.data as any).name,
                email: (r.data as any).email,
              };
            }
          }
        }

        // Attach resolved display info to items for rendering
        const itemsWithUser = items.map((it) => {
          const meta = it.uid ? userMap[it.uid as string] : undefined;
          return {
            ...it,
            displayName: meta?.displayName,
            email: meta?.email,
          } as ActivityItem;
        });

        if (mounted) {
          // limit to 4 items as requested
          setActivities(itemsWithUser.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch recent activities", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchActivities();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="border-border bg-card/40 rounded-xl border p-6 h-full flex flex-col">
      <h3 className="mb-4 text-xl font-semibold">Recent Activity</h3>
      <div className="space-y-3 flex-1 overflow-auto">
        {loading ? (
          <div className="text-muted-foreground text-sm">Loading…</div>
        ) : activities.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No recent activity
          </div>
        ) : (
          activities.map((activity, index) => {
            // pick icon and color based on action keywords
            const actionLower = (activity.action || "").toLowerCase();
            const getMeta = () => {
              if (actionLower.includes("login"))
                return {
                  Icon: User,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                };
              if (actionLower.includes("export"))
                return {
                  Icon: Download,
                  color: "text-green-500",
                  bg: "bg-green-500/10",
                };
              if (
                actionLower.includes("setting") ||
                actionLower.includes("update")
              )
                return {
                  Icon: Settings,
                  color: "text-orange-500",
                  bg: "bg-orange-500/10",
                };
              if (
                actionLower.includes("register") ||
                actionLower.includes("user")
              )
                return {
                  Icon: Users,
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                };
              return {
                Icon: Activity,
                color: "text-slate-600",
                bg: "bg-slate-600/10",
              };
            };

            const { Icon, color, bg } = getMeta();

            const userLabel = (() => {
              const v =
                activity.displayName ??
                activity.email ??
                activity.uid ??
                activity.details?.user;
              if (v === undefined || v === null) return "system";
              if (typeof v === "string") return v;
              try {
                return String(v);
              } catch {
                return "system";
              }
            })();

            return (
              <motion.div
                key={activity.id ?? index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="hover:bg-accent/50 flex items-center gap-3 rounded-lg p-2 transition-colors"
              >
                <div className={`${bg} rounded-lg p-2`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{activity.action}</div>
                  <div className="text-muted-foreground truncate text-xs">
                    {userLabel}
                  </div>
                </div>
                <div className="text-muted-foreground text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(activity.timestamp)}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
});

RecentActivity.displayName = "RecentActivity";
