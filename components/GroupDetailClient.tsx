// components/GroupDetailClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderOpenIcon,
  HomeIcon,
  ChevronRightIcon,
  CursorArrowRaysIcon,
  XMarkIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { FolderOpenIcon as FolderOpenIconSolid } from "@heroicons/react/24/solid";

import AccountCard from "./AccountCard";
import DeleteGroupButton from "./DeleteGroupButton";
import ConfirmationModal from "./ConfirmationModal";
import HeaderActionMenu from "./HeaderActionMenu";
import ActionMenu from "./ActionMenu";
import toast from "react-hot-toast";

// Import Action yang BENAR
import {
  removeBulkAccountsFromGroup,
  deleteBulkAccounts,
} from "@/actions/account";
import { updateGroup } from "@/actions/group"; // Pastikan path ini benar

// Import Tipe Data yang BENAR (AccountGroup, bukan SavedGroup)
import type { SavedAccount, AccountGroup } from "@/app/generated/prisma/client";

// --- TYPES ---
type AccountWithRelations = SavedAccount & {
  emailIdentity: { email: string } | null;
  group: { name: string } | null;
};

type Props = {
  group: AccountGroup; // FIX: Gunakan AccountGroup
  accounts: AccountWithRelations[];
};

// --- HELPER COMPONENT: EDIT GROUP MODAL ---
function EditGroupModal({
  group,
  isIcon = false,
}: {
  group: AccountGroup;
  isIcon?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(group.name);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await updateGroup(group.id, name);
      if (result.success) {
        toast.success("Group updated!");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengupdate group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={
          isIcon
            ? "p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            : "flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        }
        title="Edit Group">
        <PencilSquareIcon className="w-5 h-5" />
        {!isIcon && <span>Edit</span>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <form
            onSubmit={handleUpdate}
            className="relative bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl shadow-2xl p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Edit Folder Group
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Group
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Masukkan nama group..."
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2">
                  {isLoading && (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  Simpan
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

// --- MAIN COMPONENT ---

export default function GroupDetailClient({ group, accounts }: Props) {
  const router = useRouter();

  // State Seleksi
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // State Modal Konfirmasi
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "eject">("eject");
  const [isProcessing, setIsProcessing] = useState(false);

  // --- LOGIC ---
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
    if (selectedIds.size === accounts.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(accounts.map((a) => a.id)));
  };

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
    if (actionType === "eject") result = await removeBulkAccountsFromGroup(ids);
    else result = await deleteBulkAccounts(ids);

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
      {/* 1. NAVIGASI */}
      <nav className="flex items-center flex-wrap gap-1.5 text-sm text-gray-500 mb-2">
        <Link
          href="/dashboard"
          className="hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-all flex items-center gap-1">
          <HomeIcon className="w-4 h-4" />{" "}
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <ChevronRightIcon className="w-3 h-3 text-gray-400 shrink-0" />
        <span className="px-2 py-1 text-gray-900 dark:text-gray-200 font-semibold truncate max-w-50 flex items-center gap-1">
          <FolderOpenIcon className="w-4 h-4 text-yellow-500" /> {group.name}
        </span>
      </nav>

      {/* 2. HEADER GROUP */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 relative transition-all">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 dark:bg-blue-900/20 z-0" style={{borderRadius: "0 18.5% 0 100%"}}></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-2xl flex items-center justify-center shrink-0">
              <FolderOpenIconSolid className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-all">
                {group.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Folder Group</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <ActionMenu>
              <EditGroupModal group={group} isIcon={true} />
              <DeleteGroupButton id={group.id} />
            </ActionMenu>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <HeaderActionMenu variant="group" scope="group" id={group.id} />
          </div>
        </div>
      </div>

      {/* 3. DAFTAR AKUN */}
      <div>
        {/* HEADER SECTION: Select Mode */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span>Daftar Akun</span>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              {accounts.length}
            </span>
          </h2>

          {accounts.length > 0 && (
            <div className="flex items-center gap-2 self-end sm:self-auto animate-in fade-in slide-in-from-right-2">
              {isSelectMode ? (
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
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
                    title="Keluarkan">
                    <ArrowUpTrayIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => triggerAction("delete")}
                    disabled={selectedIds.size === 0}
                    className="p-1.5 hover:bg-red-50 text-red-600 rounded disabled:opacity-50 transition-colors"
                    title="Hapus">
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsSelectMode(false)}
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

        {/* Content */}
        {accounts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <FolderOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Group ini masih kosong.</p>
            <p className="text-sm text-gray-400">
              Edit akun yang sudah ada dan pindahkan ke group ini.
            </p>
          </div>
        ) : (
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
                groupId={group.id}
                isSelectMode={isSelectMode}
                isSelected={selectedIds.has(acc.id)}
                onToggleSelect={toggleSelection}
              />
            ))}
          </div>
        )}
      </div>

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
            ? `Keluarkan ${selectedIds.size} akun dari group "${group.name}"?`
            : `Hapus permanen ${selectedIds.size} akun?`
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
