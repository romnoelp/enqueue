"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ActionsProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  totalCount?: number;
}

const Actions = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  totalCount = 0,
}: ActionsProps) => {
  const [openStart, setOpenStart] = React.useState(false)
  const [openEnd, setOpenEnd] = React.useState(false)

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-x-4 flex-1 flex-wrap items-end">
          {/* Start Date Picker (Calendar22 style) */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="start-date" className="px-1">
              Start Date
            </Label>
            <Popover open={openStart} onOpenChange={setOpenStart}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="start-date"
                  className="w-48 justify-between font-normal"
                >
                  {startDate ? startDate.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    onStartDateChange(date)
                    setOpenStart(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date Picker (Calendar22 style) */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="end-date" className="px-1">
              End Date
            </Label>
            <Popover open={openEnd} onOpenChange={setOpenEnd}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="end-date"
                  className="w-48 justify-between font-normal"
                >
                  {endDate ? endDate.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    onEndDateChange(date)
                    setOpenEnd(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">{totalCount} results</div>
      </div>
    </div>
  )
}

export default Actions
