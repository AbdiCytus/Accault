// components/profile/StatsProgress.tsx
"use client";

import { CheckBadgeIcon, LinkIcon } from "@heroicons/react/24/outline";

type Props = {
  stats: {
    accounts: number;
    connectedAccounts: number;
    emails: number;
    verifiedEmails: number;
  };
};

export default function StatsProgress({ stats }: Props) {
  // Hitung Persentase Akun Terkoneksi
  const accountPercentage =
    stats.accounts > 0
      ? Math.round((stats.connectedAccounts / stats.accounts) * 100)
      : 0;

  // Hitung Persentase Email Terverifikasi
  const emailPercentage =
    stats.emails > 0
      ? Math.round((stats.verifiedEmails / stats.emails) * 100)
      : 0;

  const items = [
    {
      label: "Connected Accounts",
      subLabel: "Accounts linked to an email identity",
      value: stats.connectedAccounts,
      total: stats.accounts,
      percent: accountPercentage,
      color: "bg-blue-500",
      track: "bg-blue-100 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      icon: <LinkIcon className="w-5 h-5" />,
    },
    {
      label: "Verified Emails",
      subLabel: "Emails verified via OTP/Link",
      value: stats.verifiedEmails,
      total: stats.emails,
      percent: emailPercentage,
      color: "bg-emerald-500", // Hijau menandakan keamanan/verifikasi
      track: "bg-emerald-100 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      icon: <CheckBadgeIcon className="w-5 h-5" />,
    },
  ];

  return (
    <div className="mt-5 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
        Security Stats
      </h3>

      {items.map((item, idx) => (
        <div key={idx} className="group">
          {/* Header Label */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex gap-2">
              <div className={`mt-0.5 ${item.text}`}>{item.icon}</div>
              <div>
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {item.label}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.subLabel}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${item.text}`}>
                {item.percent}%
              </span>
              <p className="text-xs text-gray-400 font-medium">
                {item.value} / {item.total}
              </p>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div
            className={`w-full h-2.5 rounded-full ${item.track} overflow-hidden mt-2`}>
            {/* Progress Bar Fill */}
            <div
              className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out relative`}
              style={{ width: `${item.percent}%` }}>
              {/* Efek Kilau */}
              <div className="absolute inset-0 bg-white/40 w-full h-full animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
