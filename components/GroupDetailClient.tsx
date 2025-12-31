// components/GroupDetailClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderOpenIcon,
  HomeIcon,
  ChevronRightIcon,
  CursorArrowRaysIcon, // Icon Select
  XMarkIcon,
  TrashIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline"; // Menggunakan outline agar sesuai style page.tsx asli (kecuali solid diminta khusus)

import AccountCard from "./AccountCard";
import DeleteGroupButton from "./DeleteGroupButton";
import ConfirmationModal from "./ConfirmationModal";
import toast from "react-hot-toast";

// Actions
import {
  removeBulkAccountsFromGroup,
  deleteBulkAccounts,
} from "@/actions/account";

// Types
import type { SavedAccount, AccountGroup } from "@/app/generated/prisma/client";

type AccountWithRelations = SavedAccount & {
  emailIdentity: { email: string } | null;
  group: { name: string } | null;
};

type Props = {
  group: AccountGroup;
  accounts: AccountWithRelations[];
};

export default function GroupDetailClient({ group, accounts }: Props) {
  const router = useRouter();

  // --- STATE ---
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "eject">("eject");
  const [isProcessing, setIsProcessing] = useState(false);

  // --- LOGIC SELEKSI ---
  const handleToggleSelectMode = () => {
    if (isSelectMode) {
      setIsSelectMode(false);
      setSelectedIds(new Set());
    } else {
      setIsSelectMode(true);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === accounts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(accounts.map((a) => a.id)));
    }
  };

  // --- LOGIC ACTION ---
  const triggerAction = (type: "delete" | "eject") => {
    if (selectedIds.size === 0)
      return toast.error("Pilih akun terlebih dahulu");
    setActionType(type);
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    const ids = Array.from(selectedIds);
    let result;

    if (actionType === "eject") {
      result = await removeBulkAccountsFromGroup(ids);
    } else {
      result = await deleteBulkAccounts(ids);
    }

    setIsProcessing(false);
    setIsConfirmOpen(false);

    if (result?.success) {
      toast.success(result.message);
      setIsSelectMode(false);
      setSelectedIds(new Set());
      router.refresh();
    } else {
      toast.error(result?.message || "Gagal memproses");
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. NAVIGASI KEMBALI (SAMA PERSIS) */}
      <nav className="flex items-center flex-wrap gap-1.5 text-sm text-gray-500 mb-2">
        <Link
          href="/dashboard"
          className="hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-all flex items-center gap-1"
          title="Ke Dashboard Utama">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        <ChevronRightIcon className="w-3 h-3 text-gray-400 shrink-0" />

        <span className="px-2 py-1 text-gray-900 dark:text-gray-200 font-semibold truncate max-w-50 flex items-center gap-1">
          <FolderOpenIcon className="w-4 h-4 text-yellow-500" />
          {group.name}
        </span>
      </nav>

      {/* 2. HEADER GROUP (SAMA PERSIS) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-4 -mt-4 z-0"></div>

        <div className="relative z-10 flex flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-2xl flex items-center justify-center shrink-0">
              <FolderOpenIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-all">
                {group.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Folder Group</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl border border-gray-100 dark:border-gray-600 shrink-0">
            <DeleteGroupButton id={group.id} />
          </div>
        </div>
      </div>

      {/* 3. DAFTAR AKUN DALAM GROUP */}
      <div>
        {/* MODIFIKASI HEADER SECTION: Flexbox untuk menampung tombol Select di kanan */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          {/* Judul Asli */}
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span>Daftar Akun</span>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              {accounts.length}
            </span>
          </h2>

          {/* Tombol Select / Bulk Actions (Hanya muncul jika ada akun) */}
          {accounts.length > 0 && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {isSelectMode ? (
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-right-2">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 px-2">
                    {selectedIds.size}
                  </span>

                  <button
                    onClick={handleSelectAll}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                    {selectedIds.size === accounts.length ? "Batal" : "Semua"}
                  </button>

                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                  <button
                    onClick={() => triggerAction("eject")}
                    disabled={selectedIds.size === 0}
                    className="p-1.5 hover:bg-yellow-50 text-yellow-600 rounded disabled:opacity-50 transition-colors"
                    title="Keluarkan dari Group">
                    <ArrowUpTrayIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => triggerAction("delete")}
                    disabled={selectedIds.size === 0}
                    className="p-1.5 hover:bg-red-50 text-red-600 rounded disabled:opacity-50 transition-colors"
                    title="Hapus Permanen">
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleToggleSelectMode}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleToggleSelectMode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                  <CursorArrowRaysIcon className="w-4 h-4" />
                  Select
                </button>
              )}
            </div>
          )}
        </div>

        {accounts.length === 0 ? (
          // Tampilan Jika Kosong (SAMA PERSIS)
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <FolderOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Group ini masih kosong.</p>
            <p className="text-sm text-gray-400">
              Edit akun yang sudah ada dan pindahkan ke group ini.
            </p>
          </div>
        ) : (
          // Tampilan Grid Akun (SAMA PERSIS + Props Seleksi)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <AccountCard
                key={acc.id}
                id={acc.id}
                platformName={acc.platformName}
                username={acc.username}
                categories={acc.categories}
                email={acc.emailIdentity?.email}
                hasPassword={!!acc.encryptedPassword}
                icon={acc.icon}
                groupId={group.id} // Supaya tombol "Keluarkan" individual muncul jika tidak mode select
                // Props Seleksi
                isSelectMode={isSelectMode}
                isSelected={selectedIds.has(acc.id)}
                onToggleSelect={toggleSelection}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Konfirmasi */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          actionType === "eject"
            ? `Keluarkan ${selectedIds.size} Akun?`
            : `Hapus ${selectedIds.size} Akun?`
        }
        message={
          actionType === "eject"
            ? `Apakah Anda yakin ingin mengeluarkan ${selectedIds.size} akun dari group "${group.name}"?`
            : `Apakah Anda yakin ingin menghapus permanen ${selectedIds.size} akun yang dipilih?`
        }
        confirmText={
          actionType === "eject" ? "Ya, Keluarkan" : "Ya, Hapus Permanen"
        }
        isDanger={true}
        isLoading={isProcessing}
      />
    </div>
  );
}
