"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEmail } from "@/actions/email";
import {
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Portal from "@/components/Portal";

type DeleteEmailProps = { id: string };

export default function DeleteEmailButton({ id }: DeleteEmailProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // UX delay

    const result = await deleteEmail(id);

    if (result.success) {
      toast.success(result.message);
      router.push("/dashboard?tab=emails"); // Redirect ke tab email
      router.refresh();
    } else {
      toast.error(result.message);
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20  transition-colors rounded-lg"
        title="Hapus Email">
        <TrashIcon className="w-5 h-5" />
      </button>

      {/* Modal Konfirmasi */}
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
                Delete Email?
              </h3>
              <p className="text-center bg-red-100 dark:bg-red-600/50 rounded-lg p-5 text-red-600 dark:text-red-200 text-sm mb-6">
                {
                  "This action will delete all email information include verified status, all accounts that connected with this email will be removed"
                }
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg dark:hover:bg-gray-600 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-600/50 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-700 transition-colors disabled:opacity-50">
                  {isLoading ? "Process..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
