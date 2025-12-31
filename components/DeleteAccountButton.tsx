"use client";

import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import DeleteAccountModal from "./DeleteAccountModal";

interface DeleteProps {
  id: string;
  accountName: string;
  redirectTo?: string;
}

export default function DeleteAccountButton({
  id,
  accountName,
  redirectTo,
}: DeleteProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
        title="Hapus Akun">
        <TrashIcon className="w-5" />
      </button>

      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        account={{ id: id, platformName: accountName }}
        redirectTo={redirectTo}
      />
    </>
  );
}
