// components/EmailCard.tsx
"use client";

import {
  EnvelopeIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

type EmailProps = {
  id: string;
  email: string;
  name: string | null;
  isVerified: boolean;
  linkedCount: number;
};

export default function EmailCard({
  id,
  email,
  name,
  isVerified,
  linkedCount,
}: EmailProps) {
  return (
    <Link href={`/dashboard/email/${id}`} className="block group">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex items-center gap-4 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700">
        <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-300 shrink-0 group-hover:scale-110 transition-transform">
          <EnvelopeIcon className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
            {name || "Mo Username"}
          </p>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {linkedCount} Accounts {""}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Connected
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
