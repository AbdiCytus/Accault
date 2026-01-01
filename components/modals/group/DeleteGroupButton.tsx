// components/DeleteGroupButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteGroup } from "@/actions/group";
import {
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Portal from "@/components/Portal";

export default function DeleteGroupButton({ id }: { id: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    setIsLoading(true);
    // UX Delay agar user merasakan prosesnya
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = await deleteGroup(id);

    if (result.success) {
      toast.success(result.message);
      // Redirect ke dashboard karena halaman group ini sudah tidak ada
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error(result.message);
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* 1. TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        title="Hapus Group">
        <TrashIcon className="w-5 h-5" />
      </button>

      {/* 2. MODAL KONFIRMASI */}
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Ikon Peringatan */}
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
               Delete This Group?
              </h3>

              <div className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6 space-y-2">
                <p>This group will delete permanently</p>
                <p className="w-max bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 p-2 rounded-lg text-xs font-medium border border-blue-100 dark:border-blue-800">
                  Deleting a group from inside will eject all accounts within it
                </p>
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Process...</span>
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
