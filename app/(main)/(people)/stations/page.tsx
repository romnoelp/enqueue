"use client";
import {
  Tabs,
  TabsPanel,
  TabsPanels,
  TabsList,
  TabsTab,
} from "@/components/animate-ui/components/base/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Actions from "./_components/Actions";

const Stations = () => {
  return (
    <div className="p-6 h-full">
      <Tabs className="h-full" defaultValue="account">
        <TabsList className="w-full">
          <TabsTab value="account">Stations</TabsTab>
          <TabsTab value="password">Counters</TabsTab>
        </TabsList>
        <Card className="h-full shadow-none py-0">
          <TabsPanels className="py-6">
            <TabsPanel value="account" className="flex flex-col gap-6">
              <CardHeader></CardHeader>
              <CardContent className="grid gap-6">
                <Actions
                  searchQuery={""}
                  onSearchChange={() => {}}
                  totalCount={0}
                  filteredCount={0}
                  onAddStation={() => {}}
                />
                {/* ...other content... */}
              </CardContent>
            </TabsPanel>
            <TabsPanel value="password" className="flex flex-col gap-6">
              <CardHeader></CardHeader>
              <CardContent className="grid gap-6"></CardContent>
            </TabsPanel>
          </TabsPanels>
        </Card>
      </Tabs>
    </div>
  );
};

export default Stations;
