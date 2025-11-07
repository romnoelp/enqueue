"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const EMAIL_DOMAIN = "@neu.edu.ph";

type AddBlacklistDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (email: string, reason: string) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
};

export default function AddBlacklistDialog({
  open,
  onClose,
  onConfirm,
  isSaving,
  errorMessage,
}: AddBlacklistDialogProps) {
  const [emailUsername, setEmailUsername] = useState("");
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setEmailUsername("");
    setReason("");
    onClose();
  };

  const handleConfirm = () => {
    const fullEmail = emailUsername + EMAIL_DOMAIN;
    onConfirm(fullEmail, reason);
  };

  const disabled = isSaving || !emailUsername.trim() || !reason.trim();

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? handleClose() : null)}>
      <DialogContent
        className="sm:max-w-md"
        from="bottom"
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          duration: 0.2,
        }}
      >
        <DialogHeader>
          <DialogTitle>Blacklist a user</DialogTitle>
          <DialogDescription>
            Enter the email username and reason for blacklisting this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Email</label>
            <div className="flex items-center gap-1">
              <Input
                type="text"
                placeholder="username"
                value={emailUsername}
                onChange={(e) => setEmailUsername(e.target.value)}
                disabled={isSaving}
                className="flex-1"
              />
              <Badge
                variant="secondary"
                className="shrink-0 px-3 py-1.5 text-sm"
              >
                {EMAIL_DOMAIN}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Full email: {emailUsername || "username"}
              {EMAIL_DOMAIN}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              placeholder="Enter the reason for blacklisting..."
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setReason(e.target.value)
              }
              disabled={isSaving}
              rows={4}
            />
          </div>

          {errorMessage ? (
            <p className="text-destructive text-sm">{errorMessage}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={disabled}
            aria-disabled={disabled}
            variant="destructive"
          >
            {isSaving ? "Blacklisting..." : "Blacklist User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
