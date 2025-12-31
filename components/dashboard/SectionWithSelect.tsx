// components/dashboard/SectionWithSelect.tsx
"use client";

import {
  ArchiveBoxArrowDownIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  XMarkIcon,
  CursorArrowRaysIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";

interface SectionWithSelectProps {
  // Data Dasar
  title: string;
  count: number;
  icon: React.ReactNode;

  // State Seleksi
  type: "accounts" | "groups";
  selectMode: "none" | "accounts" | "groups";
  selectedCount: number;

  // Capability Flags (Menentukan tombol apa yang muncul)
  canBulkEject?: boolean;
  canBulkMove?: boolean;

  // Handlers
  onSelectAll: () => void;
  onDelete: () => void;
  onEject?: () => void;
  onMove?: () => void;
  onCancel: () => void;
  onEnterSelect: () => void;

  // State Collapse
  isExpanded: boolean;
  onToggleExpand: () => void;
}

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
  // Cek apakah section ini sedang dalam mode seleksi
  const isThisMode = selectMode === type;
  // Cek apakah section LAIN sedang dalam mode seleksi (jika ya, sembunyikan tombol select di sini)
  const isOtherMode = selectMode !== "none" && selectMode !== type;

  return (
    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 transition-colors">
      {/* KIRI: Judul & Tombol Collapse */}
      <button
        onClick={onToggleExpand}
        className="flex items-center gap-2 group focus:outline-none">
        {/* Indikator Panah (Berputar saat collapse) */}
        <div
          className={`transition-transform duration-200 ${
            !isExpanded ? "-rotate-90" : ""
          }`}>
          <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>

        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {icon}
          {title}
        </h2>
      </button>

      {/* KANAN: Counter & Toolbar Aksi */}
      <div className="flex items-center gap-2">
        {/* Counter Badge */}
        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500 font-medium">
          {count}
        </span>

        {/* Toolbar hanya muncul jika tidak sedang memilih di section lain DAN section ini terbuka */}
        {!isOtherMode && isExpanded && (
          <>
            {isThisMode ? (
              /* MODE SELECT AKTIF: Tampilkan tombol aksi */
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300 ml-2">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 min-w-15 text-right hidden sm:inline">
                  {selectedCount} terpilih
                </span>

                {/* Tombol Select All */}
                <button
                  onClick={onSelectAll}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300 transition-colors">
                  Select All
                </button>

                {/* Tombol Move (Pindah Group) */}
                {canBulkMove && onMove && (
                  <button
                    onClick={onMove}
                    className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                    title="Masukkan ke Group">
                    <ArchiveBoxArrowDownIcon className="w-4 h-4" />
                  </button>
                )}

                {/* Tombol Eject (Keluarkan dari Group) */}
                {canBulkEject && onEject && (
                  <button
                    onClick={onEject}
                    className="text-xs px-2 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded transition-colors"
                    title="Keluarkan dari Group">
                    <ArrowUpTrayIcon className="w-4 h-4" />
                  </button>
                )}

                {/* Tombol Delete */}
                <button
                  onClick={onDelete}
                  disabled={selectedCount === 0}
                  className="text-xs px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded disabled:opacity-50 transition-colors"
                  title="Hapus Terpilih">
                  <TrashIcon className="w-4 h-4" />
                </button>

                {/* Tombol Cancel (X) */}
                <button
                  onClick={onCancel}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                  title="Keluar Mode Select">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              /* MODE BIASA: Tampilkan tombol trigger Select */
              <button
                onClick={onEnterSelect}
                className="ml-2 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                <CursorArrowRaysIcon className="w-3 h-3" />
                Select
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
