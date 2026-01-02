// components/profile/ClearHistoryButton.tsx
"use client";

import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { clearAllActivities } from "@/actions/profile";
import toast from "react-hot-toast";
import SelectConfirmationModal from "../modals/SelectConfirmationModal";

export default function ClearHistoryButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi yang dijalankan saat tombol "Yes, Delete" di modal ditekan
  async function handleConfirmClear() {
    setIsLoading(true);
    try {
      const res = await clearAllActivities();

      if (res.success) {
        toast.success(res.message);
        setIsOpen(false); // Tutup modal hanya jika sukses
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("System Error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Tombol Pemicu (Trigger Button) */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
        title="Clear All History">
        <TrashIcon className="w-5 h-5" />
      </button>

      {/* Modal Konfirmasi */}
      <SelectConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear Activity History?"
        message="Are you sure you want to permanently delete all activity logs? This action cannot be undone."
        confirmText="Yes, Delete All"
        cancelText="Cancel"
        isDanger={true}
        isLoading={isLoading}
      />
    </>
  );
}
