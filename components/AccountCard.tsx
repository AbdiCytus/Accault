"use client";

import { UserIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

import Image from "next/image";
import Link from "next/link";
import PasswordViewer from "./PasswordViewer";

type AccountProps = {
  id: string;
  platformName: string;
  username: string;
  categories: string[];
  email?: string;
  hasPassword?: boolean;
  icon?: string | null;
};

export default function AccountCard({
  id,
  platformName,
  username,
  categories,
  email,
  hasPassword = true,
  icon,
}: AccountProps) {
  return (
    // SELURUH KARTU ADALAH LINK KE DETAIL
    <Link
      href={`/dashboard/account/${id}`}
      className="block bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all relative group/card hover:border-blue-300 dark:hover:border-blue-700">
      {/* Badge Kategori */}
      <div className="flex items-start justify-between mb-3 gap-2">
        {/* Render Semua Kategori */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat, index) => (
            <span
              key={index}
              className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
              {cat}
            </span>
          ))}
        </div>

        {/* Placeholder Ikon (Nanti diganti Gambar Upload) */}
        <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-gray-600">
          {icon ? (
            <Image
              src={icon}
              alt={platformName}
              className="w-full h-full object-cover"
              width={200}
              height={200}
            />
          ) : (
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
              {platformName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Nama Platform */}
      <h3
        className="font-bold text-lg text-gray-800 dark:text-white truncate mb-4"
        title={platformName}>
        {platformName}
      </h3>

      {/* Info User & Email */}
      <div className="space-y-2 mb-4">
        {/* Username */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 truncate">
          <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">{username}</span>
        </div>

        {/* Email (Hanya tampil jika ada) */}
        {email && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 truncate">
            <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        )}
      </div>

      {/* Area Password */}
      <div onClick={(e) => e.preventDefault()}>
        {" "}
        {/* Mencegah Link Parent Klik */}
        {hasPassword ? (
          <PasswordViewer accountId={id} />
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-center">
            <span className="text-xs text-gray-400 italic">
              This Account not Have a Password
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
