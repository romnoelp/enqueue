"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
};

export function ButtonLoading({
  children = "Submit",
  onClick,
  disabled,
  size = "sm",
}: Props) {
  return (
    <Button size={size} variant="outline" disabled={disabled} onClick={onClick}>
      <Spinner className="mr-2" />
      {children}
    </Button>
  );
}

export default ButtonLoading;
