"use client";
import React from "react";
import {
  Tabs,
  TabsPanel,
  TabsPanels,
  TabsList,
  TabsTab,
} from "@/components/animate-ui/components/base/tabs";
import { Card, CardContent } from "@/components/ui/card";
import StationCard from "./_components/station-card";
import { Input } from "@/components/ui/input";

const Stations = () => {
  return (
    <div className="p-6 h-full flex flex-col">
      <Tabs className="h-full flex flex-col" defaultValue="account">
        <TabsList className="w-full shrink-0">
          <TabsTab value="stations">Stations</TabsTab>
          <TabsTab value="password">Counters</TabsTab>
        </TabsList>
        <Card className="h-full flex border border-black">
          <TabsPanels className="flex flex-1 border-2 border-red-600">
            <TabsPanel
              className="h-full flex-1 min-w-0 border border-green-700"
              value={"stations"}
            >
              <StationCard />
            </TabsPanel>
          </TabsPanels>
        </Card>
      </Tabs>
    </div>
  );
};

export default Stations;
