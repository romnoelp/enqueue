import { useState } from "react";

// Generic dialog state management with loading and error handling
export type DialogState<T = null> = {
  isOpen: boolean;
  data: T;
  isSaving: boolean;
  errorMessage: string | null;
};

export type DialogActions<T = null> = {
  open: (data: T) => void;
  close: () => void;
  setIsSaving: (saving: boolean) => void;
  setErrorMessage: (message: string | null) => void;
  resetError: () => void;
};

export type UseDialogReturn<T = null> = DialogState<T> & DialogActions<T>;

export function useDialog<T = null>(
  initialData: T = null as T
): UseDialogReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const open = (dialogData: T) => {
    setData(dialogData);
    setIsOpen(true);
    setIsSaving(false);
    setErrorMessage(null);
  };

  const close = () => {
    setIsOpen(false);
    setData(initialData);
    setIsSaving(false);
    setErrorMessage(null);
  };

  const resetError = () => setErrorMessage(null);

  return {
    isOpen,
    data,
    isSaving,
    errorMessage,
    open,
    close,
    setIsSaving,
    setErrorMessage,
    resetError,
  };
}
