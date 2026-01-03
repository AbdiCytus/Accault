"use client";

import { useState } from "react";
import {
  CheckBadgeIcon,
  ExclamationCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";
import { sendVerificationEmail } from "@/actions/verify";
import toast from "react-hot-toast";

type Props = {
  emailId: string;
  isVerified: boolean;
};

export default function EmailVerificationButton({
  emailId,
  isVerified,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  if (isVerified) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800 cursor-default">
        <CheckBadgeIcon className="w-5 h-5" />
        <span className="hidden sm:block">Verified</span>
      </div>
    );
  }

  // Handler Kirim Email
  async function handleSendVerification() {
    setIsLoading(true);
    const result = await sendVerificationEmail(emailId);

    if (result.success) {
      toast.success(result.message, { duration: 5000 });
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  }

  // Jika belum verified, tampilkan Tombol Aktif
  return (
    <button
      onClick={handleSendVerification}
      disabled={isLoading}
      className="group flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all border border-yellow-200 dark:border-yellow-800 disabled:opacity-70 disabled:cursor-not-allowed">
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5"
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
      ) : (
        <ExclamationCircleIcon className="w-5 h-5 group-hover:hidden" />
      )}

      {/* Ikon Pesawat muncul saat hover (efek visual) */}
      <PaperAirplaneIcon className="w-4 h-4 hidden group-hover:block animate-pulse" />

      <span>{isLoading ? "Sending..." : "Verify"}</span>
    </button>
  );
}
