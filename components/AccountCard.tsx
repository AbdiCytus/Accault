"use client";

import {
  UserIcon,
  EnvelopeIcon,
  FolderIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

import { removeAccountFromGroup } from "@/actions/account";
import Image from "next/image";
import Link from "next/link";
import PasswordViewer from "./PasswordViewer";
import toast from "react-hot-toast";

type AccountProps = {
  id: string;
  platformName: string;
  username: string;
  categories: string[];
  email?: string;
  hasPassword?: boolean;
  icon?: string | null;
  groupName?: string | null;
  groupId?: string | null;
};

export default function AccountCard({
  id,
  platformName,
  username,
  categories,
  email,
  hasPassword = true,
  icon,
  groupName,
  groupId,
}: AccountProps) {
  const handleRemoveGroup = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const toastId = toast.loading("Mengeluarkan...");
    const result = await removeAccountFromGroup(id);

    if (result.success) toast.success(result.message, { id: toastId });
    else toast.error(result.message, { id: toastId });
  };
  return (
    // SELURUH KARTU ADALAH LINK KE DETAIL
    <Link
      href={`/dashboard/account/${id}`}
      className="block bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all relative group/card hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700">
      {/* Badge Kategori & Ikon (Bagian Atas Tetap Sama) */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="w-15 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
          {icon ? (
            <Image
              src={icon}
              alt={platformName}
              className="w-full h-full object-cover"
              width={100}
              height={100}
            />
          ) : (
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
              {platformName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat, index) => (
            <span
              key={index}
              className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Nama Platform */}
      <div className="flex justify-between">
        <h3
          className="font-bold text-lg text-gray-800 dark:text-white truncate mb-2" // Margin bottom dikurangi sedikit (mb-4 -> mb-2) agar pas dengan badge grup
          title={platformName}>
          {platformName}
        </h3>

        {groupName && (
          <div className="flex items-center gap-1 w-fit bg-yellow-50 dark:bg-yellow-900/20 px-2 rounded-md text-xs text-yellow-700 dark:text-yellow-500 font-medium border border-yellow-100 dark:border-yellow-800/30 mb-1 group/badge hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors">
            <FolderIcon className="w-3.5 h-3.5" />
            <span className="truncate max-w-30" title={groupName}>
              {groupName}
            </span>
          </div>
        )}
      </div>

      {/* Info User, Email & GROUP */}
      <div className="space-y-2 mb-4">
        {/* Username (Tetap) */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 truncate">
          <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">{username}</span>
        </div>

        {/* Email (Tetap) */}
        {email && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 truncate">
            <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        )}
      </div>

      {/* Area Password (Tetap) */}
      <div onClick={(e) => e.preventDefault()}>
        {hasPassword ? (
          <PasswordViewer accountId={id} />
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-center">
            <span className="text-xs text-gray-400 italic">
              {"This account doesn't have a password"}
            </span>
          </div>
        )}
      </div>

      {(groupId || groupName) && (
        <button
          onClick={handleRemoveGroup}
          className="w-full items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 py-1.5 rounded-md text-xs text-yellow-700 dark:text-yellow-500 font-medium border border-yellow-100 dark:border-yellow-800/30 mt-2 group/badge hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors flex justify-center">
          <ArrowUpTrayIcon className="w-3 h-3 mt-0.5" />
          Remove from group
        </button>
      )}
    </Link>
  );
}
