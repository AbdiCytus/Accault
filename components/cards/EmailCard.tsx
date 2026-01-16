// components/EmailCard.tsx
"use client";

import {
  EnvelopeIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

type EmailProps = {
  id: string;
  email: string;
  name: string | null;
  isVerified: boolean;
  linkedCount: number;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
};

export default function EmailCard({
  id,
  email,
  name,
  isVerified,
  linkedCount,
  isSelectMode = false,
  isSelected = false,
  onToggleSelect,
}: EmailProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (isSelectMode && onToggleSelect) {
      e.preventDefault();
      onToggleSelect(id);
    }
  };

  const Content = (
    <div
      className={`relative bg-white dark:bg-gray-800 p-5 rounded-xl border shadow-sm transition-all flex items-center gap-4 
      ${
        isSelectMode
          ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 opacity-50"
          : "cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
      }
      ${
        isSelected
          ? "border-blue-500 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 opacity-100"
          : "border-gray-200 dark:border-gray-700"
      }
      `}>
      {/* Visual Indicator saat Selected */}
      {isSelectMode && (
        <div
          className={`absolute top-2 right-2 transition-opacity ${
            isSelected ? "opacity-100" : "opacity-0"
          }`}>
          <CheckCircleIcon className="w-6 h-6 text-blue-500 bg-white dark:bg-gray-800 rounded-full" />
        </div>
      )}

      <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-300 shrink-0">
        <EnvelopeIcon className="w-6 h-6" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 dark:text-white truncate">
            {email}
          </h3>
          {isVerified ? (
            <CheckBadgeIcon
              className="w-5 h-5 text-green-500"
              title="Terverifikasi"
            />
          ) : (
            <ExclamationCircleIcon
              className="w-5 h-5 text-red-500"
              title="Belum Verifikasi"
            />
          )}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {name || "No Username"}
        </p>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {linkedCount} Accounts {""}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Connected
          </span>
        </p>
      </div>
    </div>
  );

  if (isSelectMode) {
    return (
      <div onClick={handleClick} className="block group">
        {Content}
      </div>
    );
  }

  // Jika Normal mode, render sebagai Link
  return (
    <Link href={`/dashboard/email/${id}`} className="block group">
      {Content}
    </Link>
  );
}
