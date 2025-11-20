"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";

interface DashboardCardProps {
  stat: {
    title: string;
    value: string;
    change: string;
    changeType: "positive" | "negative";
    icon: React.ElementType;
    color: string;
    bgColor: string;
  };
  index: number;
}

export const DashboardCard = memo(({ stat, index }: DashboardCardProps) => {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="group relative cursor-pointer"
    >
      <div className="border-border bg-card/40 rounded-xl border p-6 transition-all duration-300 hover:shadow-lg">
        <div className="to-primary/5 absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative">
          <div className="mb-4 flex items-center">
            <div className={`rounded-lg p-3 ${stat.bgColor}`}>
              <Icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>

          <div className="mb-3">
            <h3 className="text-foreground mb-1 text-3xl font-bold">
              {stat.value}
            </h3>
            <p className="text-muted-foreground text-sm font-medium">
              {stat.title}
            </p>
          </div>

          {/* progress bar removed per design request */}
        </div>
      </div>
    </motion.div>
  );
});

DashboardCard.displayName = "DashboardCard";
