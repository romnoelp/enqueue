"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, UserX } from "lucide-react";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface ActionsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  filteredCount: number;
  onAddBlacklist?: () => void;
}

const Actions = ({
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount,
  onAddBlacklist,
}: ActionsProps) => {
  const [inputValue, setInputValue] = useState(searchQuery);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearchChange(value);
  }, 300);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleSearch = () => {
    debouncedSearch.cancel();
    onSearchChange(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setInputValue("");
    debouncedSearch.cancel();
    onSearchChange("");
  };

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Input
              className="pr-8"
              placeholder="Search blacklisted users..."
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {inputValue && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button variant="outline" onClick={handleSearch}>
            <Search />
            <span>Search</span>
          </Button>
        </div>
        <Button variant="destructive" onClick={onAddBlacklist}>
          <UserX />
          <span>Blacklist User</span>
        </Button>
      </div>
      {Boolean(searchQuery) && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredCount} of {totalCount} blacklisted users
          {searchQuery && (
            <span className="ml-1">matching &quot;{searchQuery}&quot;</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Actions;
