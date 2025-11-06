"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Funnel, Search, X } from "lucide-react";
import { UserRole } from "@/types/auth";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface ActionsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: UserRole | "all";
  onRoleFilterChange: (role: UserRole | "all") => void;
  totalCount: number;
  filteredCount: number;
}

const Actions = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  totalCount,
  filteredCount,
}: ActionsProps) => {
  const { theme, resolvedTheme } = useTheme();
  const current = theme === "system" ? resolvedTheme : theme;
  const [inputValue, setInputValue] = useState(searchQuery);
  
  // Debounced search callback - waits 300ms after user stops typing
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearchChange(value);
  }, 300);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleSearch = () => {
    // Immediately trigger search (bypass debounce)
    debouncedSearch.cancel(); // Cancel any pending debounced calls
    onSearchChange(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setInputValue("");
    debouncedSearch.cancel(); // Cancel pending debounce
    onSearchChange("");
  };

  const getRoleLabel = (role: UserRole | "all"): string => {
    const labels: Record<UserRole | "all", string> = {
      all: "All Roles",
      superAdmin: "Super Admin",
      admin: "Admin",
      cashier: "Cashier",
      information: "Information",
      pending: "Pending",
    };
    return labels[role];
  };

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Input
              className="pr-8"
              placeholder="Search for an employee..."
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {inputValue && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button variant="outline" onClick={handleSearch}>
            <Search />
            <span className={current === "dark" ? "text-white" : "text-black"}>
              Search
            </span>
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"}>
              <Funnel />
              {getRoleLabel(roleFilter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Employee role selection</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onRoleFilterChange("all")}>
              <span className={roleFilter === "all" ? "font-bold" : ""}>
                All Roles
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleFilterChange("superAdmin")}>
              <span className={roleFilter === "superAdmin" ? "font-bold" : ""}>
                Super Admin
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleFilterChange("admin")}>
              <span className={roleFilter === "admin" ? "font-bold" : ""}>
                Admin
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleFilterChange("cashier")}>
              <span className={roleFilter === "cashier" ? "font-bold" : ""}>
                Cashier
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onRoleFilterChange("information")}
            >
              <span className={roleFilter === "information" ? "font-bold" : ""}>
                Information
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleFilterChange("pending")}>
              <span className={roleFilter === "pending" ? "font-bold" : ""}>
                Pending
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {(searchQuery || roleFilter !== "all") && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredCount} of {totalCount} employees
          {searchQuery && (
            <span className="ml-1">
              matching &quot;{searchQuery}&quot;
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Actions;
