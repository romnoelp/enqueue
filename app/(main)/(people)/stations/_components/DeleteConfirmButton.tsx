"use client";

import { Button } from "@/components/ui/button";
import ButtonLoading from "@/components/ui/button-loading";
import { useAlertDialog } from "@/components/animate-ui/components/radix/alert-dialog";

type Props = {
  handleDelete: () => Promise<void>;
  isDeleting: boolean;
};

const DeleteConfirmButton = ({ handleDelete, isDeleting }: Props) => {
  const { setIsOpen } = useAlertDialog();

  const onConfirm = async () => {
    await handleDelete();
    setIsOpen?.(false);
  };

  if (isDeleting) {
    return (
      <ButtonLoading disabled size="sm">
        Deleting...
      </ButtonLoading>
    );
  }

  return (
    <Button variant="destructive" onClick={() => void onConfirm()}>
      Yes, I&apos;m sure
    </Button>
  );
};

export default DeleteConfirmButton;
