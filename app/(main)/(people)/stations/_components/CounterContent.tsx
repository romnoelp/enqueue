import {
  FlipButton,
  FlipButtonFront,
  FlipButtonBack,
} from "@/components/animate-ui/primitives/buttons/flip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React from "react";

const CounterContent = () => {
  return (
    <Card className="h-full w-full p-4">
      <div className="flex flex-col gap-y-4">
        {/* Header */}
        <div className="flex flex-col gap-y-1">
          <p className="font-bold text-lg">Counters</p>
          <p className="font-light text-sm text-muted-foreground">
            Manage each counter in the selected station
          </p>
        </div>

        <div className="flex w-full gap-x-4">
          <Input placeholder="Search for counter..." />
          <FlipButton>
            <FlipButtonFront>
              <Button size={"lg"}>Add New Counter</Button>
            </FlipButtonFront>
            <FlipButtonBack>
              <Button size={"lg"}>Create</Button>
            </FlipButtonBack>
          </FlipButton>
        </div>
      </div>
    </Card>
  );
};

export default CounterContent;
