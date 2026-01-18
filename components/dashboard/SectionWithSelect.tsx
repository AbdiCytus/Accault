// components/dashboard/SectionWithSelect.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpTrayIcon,
  TrashIcon,
  XMarkIcon,
  CursorArrowRaysIcon,
  ChevronDownIcon,
  FolderOpenIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";

interface SectionWithSelectProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  type: "accounts" | "groups" | "emails";
  selectMode: "none" | "accounts" | "groups" | "emails";
  selectedCount: number;
  canBulkEject?: boolean;
  canBulkMove?: boolean;
  onSelectAll: () => void;
  onDelete: () => void;
  onEject?: () => void;
  onMove?: () => void;
  onCancel: () => void;
  onEnterSelect: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

// 1. KITA DEFINISIKAN KOMPONEN INI DI LUAR (Agar tidak re-create saat render)
const ActionButtons = ({
  isMobile,
  selectedCount,
  canBulkMove,
  canBulkEject,
  onSelectAll,
  onMove,
  onEject,
  onDelete,
  onCancel,
}: {
  isMobile: boolean;
  selectedCount: number;
  canBulkMove?: boolean;
  canBulkEject?: boolean;
  onSelectAll: () => void;
  onMove?: () => void;
  onEject?: () => void;
  onDelete: () => void;
  onCancel: () => void;
}) => (
  <div className="flex items-center gap-1 sm:gap-2">
    {/* 1. SELECT ALL */}
    <button
      onClick={onSelectAll}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all active:scale-95">
      <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
      <span className="text-gray-700 dark:text-gray-200">
        {selectedCount > 0 ? (isMobile ? "All" : "Select All") : "Select All"}
      </span>
    </button>

    {/* Divider Vertical */}
    <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>

    {/* 2. MOVE TO GROUP */}
    {canBulkMove && onMove && (
      <button
        onClick={onMove}
        className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2"
        title="Move to Group">
        <FolderOpenIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Move</span>
      </button>
    )}

    {/* 3. EJECT FROM GROUP */}
    {canBulkEject && onEject && (
      <button
        onClick={onEject}
        className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50 transition-colors flex items-center gap-2"
        title="Eject from Group">
        <ArrowUpTrayIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Eject</span>
      </button>
    )}

    {/* 4. DELETE */}
    <button
      onClick={onDelete}
      disabled={selectedCount === 0}
      className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      title="Delete Selected">
      <TrashIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Delete</span>
    </button>

    {/* 5. CANCEL (Desktop Only - Mobile pakai X terpisah) */}
    {!isMobile && (
      <button
        onClick={onCancel}
        className="ml-1 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
        title="Exit Selection Mode">
        <XMarkIcon className="w-5 h-5" />
      </button>
    )}
  </div>
);

export default function SectionWithSelect({
  title,
  count,
  icon,
  type,
  selectMode,
  selectedCount,
  canBulkEject = false,
  canBulkMove = false,
  onSelectAll,
  onDelete,
  onEject,
  onMove,
  onCancel,
  onEnterSelect,
  isExpanded,
  onToggleExpand,
}: SectionWithSelectProps) {
  const isThisMode = selectMode === type;
  const isOtherMode = selectMode !== "none" && selectMode !== type;

  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false); // State untuk memastikan client-side ready (Portal)

  // Deteksi Mobile & Mount
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // --- RENDER UTAMA ---
  return (
    <>
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 mt-2 transition-colors relative">
        {/* LEFT: TITLE */}
        <button
          onClick={onToggleExpand}
          className="flex items-center gap-2 group focus:outline-none">
          <div
            className={`transition-transform duration-200 ${
              !isExpanded ? "-rotate-90" : ""
            }`}>
            <ChevronDownIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            {icon}
            {title}
            <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">
              ({count})
            </span>
          </h2>
        </button>

        {/* RIGHT: DESKTOP TOOLBAR */}
        <div className="flex items-center gap-2">
          {!isOtherMode && isExpanded && (
            <>
              {isThisMode ? (
                // DESKTOP: Render tombol di sini jika BUKAN mobile
                !isMobile && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <ActionButtons
                      isMobile={false}
                      selectedCount={selectedCount}
                      canBulkMove={canBulkMove}
                      canBulkEject={canBulkEject}
                      onSelectAll={onSelectAll}
                      onMove={onMove}
                      onEject={onEject}
                      onDelete={onDelete}
                      onCancel={onCancel}
                    />
                  </div>
                )
              ) : (
                // MODE NORMAL: Tombol Trigger Select
                <button
                  onClick={onEnterSelect}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-all">
                  <CursorArrowRaysIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 dark:text-gray-500 dark:group-hover:text-blue-400" />
                  Select
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* MOBILE: FLOATING ACTION BAR (MENGGUNAKAN PORTAL) */}
      {/* Kita gunakan createPortal agar elemen ini dirender di document.body, menghindari masalah overflow/z-index */}
      {isThisMode &&
        isMobile &&
        mounted &&
        createPortal(
          <div className="fixed bottom-4 left-4 right-4 z-9999 animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-2xl p-3 flex items-center justify-between">
              {/* Counter Kiri */}
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md min-w-6 text-center">
                  {selectedCount}
                </span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Selected
                </span>
              </div>

              {/* Tombol Aksi Kanan (Ikon Saja) */}
              <div className="flex items-center gap-2">
                {canBulkMove && onMove && (
                  <button
                    onClick={onMove}
                    title="Move"
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-300">
                    <FolderOpenIcon className="w-5 h-5" />
                  </button>
                )}
                {canBulkEject && onEject && (
                  <button
                    onClick={onEject}
                    title="Eject"
                    className="p-2 bg-yellow-50 text-yellow-600 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-300">
                    <ArrowUpTrayIcon className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onDelete}
                  disabled={selectedCount === 0}
                  title="Delete"
                  className="p-2 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/30 dark:text-red-300 disabled:opacity-50">
                  <TrashIcon className="w-5 h-5" />
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>

                {/* Close Button */}
                <button
                  onClick={onCancel}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tombol Select All Tambahan di atas Floating Bar */}
            <div className="absolute -top-12 right-0">
              <button
                onClick={onSelectAll}
                className="flex items-center gap-1 bg-white dark:bg-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 active:scale-95 transition-transform">
                <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                Select All
              </button>
            </div>
          </div>,
          document.body, // Target Portal
        )}
    </>
  );
}
