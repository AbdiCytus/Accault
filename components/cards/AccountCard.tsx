"use client";

import {
  UserIcon,
  EnvelopeIcon,
  FolderIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheckIcon } from "@heroicons/react/24/solid";

import { removeAccountFromGroup } from "@/actions/account";
import Image from "next/image";
import Link from "next/link";
import PasswordViewer from "../PasswordViewer";
import toast from "react-hot-toast";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface AccountProps {
  id: string;
  platformName: string;
  username: string;
  categories: string[];
  email?: string;
  hasPassword?: boolean;
  icon?: string | null;
  groupName?: string | null;
  groupId?: string | null;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

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
  isSelectMode = false,
  isSelected = false,
  onToggleSelect,
}: AccountProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `account-${id}`, // ID Unik untuk Drag
      data: {
        type: "account",
        accountId: id,
        platformName: platformName, // Untuk keperluan visual/logika
      },
    });

  // Style saat didrag (Transformasi posisi)
  const style: React.CSSProperties = {
    transform: transform
      ? `${CSS.Translate.toString(transform)} scale(0.5)`
      : undefined,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : "auto",
    boxShadow: isDragging
      ? "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
      : undefined,
    transition: isDragging
      ? "none"
      : "transform 200ms ease-in-out, opacity 200ms ease-in-out, box-shadow 200ms ease-in-out",
    cursor: isDragging ? "grabbing" : undefined,
  };

  const handleRemoveGroup = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const toastId = toast.loading("Removing...");
    const result = await removeAccountFromGroup(id);

    if (result.success) toast.success(result.message, { id: toastId });
    else toast.error(result.message, { id: toastId });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectMode && onToggleSelect) {
      e.preventDefault();
      onToggleSelect(id);
    }
  };

  const showGroupAction = (groupName || groupId) && !isSelectMode;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {isSelectMode && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(id);
          }}
          className="absolute -top-2 -right-2 z-20 cursor-pointer bg-white dark:bg-gray-800 rounded-full shadow-md">
          {isSelected ? (
            <SolidCheckIcon className="w-8 h-8 text-blue-600" />
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-400 transition-colors" />
          )}
        </div>
      )}
      <Link
        href={isSelectMode ? "#" : `/dashboard/account/${id}`}
        onClick={handleCardClick}
        className={`bg-white group dark:bg-gray-800 p-4 rounded-xl border shadow-sm transition-all h-full flex flex-col justify-between
            ${
              isSelectMode
                ? isSelected
                  ? "border-blue-500 ring-2 ring-blue-500/20"
                  : "border-gray-200 dark:border-gray-700 opacity-50 hover:opacity-100"
                : "border-gray-200 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer"
            }  ${
          isDragging ? "pointer-events-none cursor-grabbing" : "cursor-pointer"
        }
        `}>
        {/* Badge Kategori & Ikon */}
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
              <span className="text-lg flex items-center justify-center font-bold text-gray-500 h-14 object-cover dark:text-gray-400">
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

          {/* Email */}
          {email && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 truncate">
              <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          )}
        </div>

        {/* Area Password */}
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

        {showGroupAction && (
          <button
            onClick={handleRemoveGroup}
            className="flex w-full items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 py-1.5 rounded-md text-xs text-yellow-700 dark:text-yellow-500 font-medium border border-yellow-100 dark:border-yellow-800/30 mt-2 group/badge hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors justify-center">
            <ArrowUpTrayIcon className="w-3 h-3 mt-0.5" />
            Remove from group
          </button>
        )}
      </Link>
    </div>
  );
}
