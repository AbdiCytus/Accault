"use client";

import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import DeleteAccountModal from "./DeleteAccountModal";

interface DeleteProps {
  id: string;
  accountName: string;
  redirectTo?: string;
  isIcon: boolean;
}

export default function DeleteAccountButton({
  id,
  accountName,
  redirectTo,
  isIcon = false,
}: DeleteProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={
          isIcon
            ? "p-2 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
            : "flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        }
        title="Hapus Akun">
        {isIcon ? (
          <TrashIcon className="w-5 h-5" />
        ) : (
          <>
            <TrashIcon className="w-4 h-4" />
            <span>Hapus</span>
          </>
        )}
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
