"use client";

import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ActionsProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  totalCount?: number;
}

const Actions = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  searchQuery = "",
  onSearchChange,
}: ActionsProps) => {
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (onSearchChange) onSearchChange(value);
  }, 300);
  const handleInputChange = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };
  const handleClearSearch = () => {
    setInputValue("");
    debouncedSearch.cancel();
    if (onSearchChange) onSearchChange("");
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-x-4 flex-1 flex-wrap items-end">
          <div className="flex flex-col gap-2">
            <Label htmlFor="search-logs" className="px-1">
              Search
            </Label>
            <div className="relative w-64">
              <Input
                id="search-logs"
                placeholder="Search for an activity log..."
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="pr-8"
              />
              {inputValue && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
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
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={startDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    onStartDateChange(date);
                    setOpenStart(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="end-date" className="px-1">
              End Date
            </Label>
            {startDate ? (
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
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={endDate}
                    fromDate={startDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      onEndDateChange(date);
                      setOpenEnd(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                variant="outline"
                id="end-date"
                className="w-48 justify-between font-normal"
                disabled
              >
                {endDate ? endDate.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Actions;
