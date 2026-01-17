// components/detail/GroupClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  FolderOpenIcon,
  CursorArrowRaysIcon,
  XMarkIcon,
  TrashIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

import AccountCard from "../cards/AccountCard";
import toast from "react-hot-toast";
import PaginationControl from "../dashboard/PaginationControl";

// [UPDATE] Import fungsi baru
import {
  removeBulkAccountsFromGroup,
  deleteBulkAccounts,
  moveBulkAccountsToGroup,
} from "@/actions/account";
import { getAllGroupAccountIds } from "@/actions/group"; // Import ini

import type { SavedAccount, AccountGroup } from "@/app/generated/prisma/client";
import SelectConfirmationModal from "../modals/SelectConfirmationModal";
import SelectGroupModal from "../dashboard/SelectGroupModal";
import { GroupWithCount } from "@/types/dashboard";

type AccountWithRelations = SavedAccount & {
  emailIdentity: { email: string } | null;
  group: { name: string } | null;
};

type Props = {
  group: AccountGroup;
  accounts: AccountWithRelations[];
  allGroups: GroupWithCount[];
  totalPages: number;
  currentPage: number;
  totalAccounts: number; // [BARU]
  query: string; // [BARU]
};

export default function GroupClient({
  group,
  accounts,
  allGroups,
  totalPages,
  currentPage,
  totalAccounts,
  query,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "eject">("eject");
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSelectingAll, setIsSelectingAll] = useState(false); // [BARU] Loading state untuk tombol All

  // Handler Page Change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Shortkey Navigasi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isConfirmOpen || isMoveModalOpen) return;
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key === "ArrowLeft" && currentPage > 1) {
        e.preventDefault();
        handlePageChange(currentPage - 1);
      } else if (e.key === "ArrowRight" && currentPage < totalPages) {
        e.preventDefault();
        handlePageChange(currentPage + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, isConfirmOpen, isMoveModalOpen, searchParams]);

  // [PENTING] HAPUS useEffect yang mereset selectedIds saat currentPage berubah
  // Agar seleksi tetap bertahan saat pindah halaman.

  // --- LOGIKA SELECT ALL GLOBAL ---
  const isAllSelectedGlobal =
    selectedIds.size === totalAccounts && totalAccounts > 0;

  const handleSelectAll = async () => {
    if (isAllSelectedGlobal) {
      // Jika sudah terpilih semua -> Deselect All
      setSelectedIds(new Set());
    } else {
      // Jika belum -> Ambil SEMUA ID dari server
      setIsSelectingAll(true);

      try {
        const allIds = await getAllGroupAccountIds(group.id, query);
        setSelectedIds(new Set(allIds));
      } catch (error) {
      } finally {
        setIsSelectingAll(false);
      }
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // ... (Handler Actions: Eject, Delete, Move TETAP SAMA) ...
  const handleEjectTrigger = () => {
    if (selectedIds.size === 0) return toast.error("Select items first");
    setActionType("eject");
    setIsConfirmOpen(true);
  };
  const handleDeleteTrigger = () => {
    if (selectedIds.size === 0) return toast.error("Select items first");
    setActionType("delete");
    setIsConfirmOpen(true);
  };
  const handleMoveTrigger = () => {
    if (selectedIds.size === 0) return toast.error("Select items first");
    setIsMoveModalOpen(true);
  };

  const handleMoveAction = async (targetGroupId: string) => {
    setIsProcessing(true);
    const ids = Array.from(selectedIds);
    const result = await moveBulkAccountsToGroup(ids, targetGroupId);
    setIsProcessing(false);
    setIsMoveModalOpen(false);
    if (result.success) {
      toast.success(result.message);
      setIsSelectMode(false);
      setSelectedIds(new Set());
      router.refresh();
    } else {
      toast.error(result.message);
    }
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
      toast.error(result?.message || "Failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header sama */}
      <div className="flex justify-between items-end gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">
            Account<span className="sm:hidden">s</span>
            <span className="hidden sm:inline"> List</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isSelectMode ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Tombol Action (Move, Eject, Delete) SAMA */}
              <button
                onClick={handleMoveTrigger}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50 rounded-lg text-sm font-medium transition-colors">
                <FolderOpenIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Move</span>
              </button>
              <button
                onClick={handleEjectTrigger}
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500 dark:hover:bg-yellow-800/50 rounded-lg text-sm font-medium transition-colors">
                <ArrowUpTrayIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Eject</span>
              </button>
              <button
                onClick={handleDeleteTrigger}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500 dark:hover:bg-red-800/50 rounded-lg text-sm font-medium transition-colors">
                <TrashIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

              {/* Tombol Select All Global */}
              <button
                onClick={handleSelectAll}
                disabled={isSelectingAll}
                className="text-xs sm:text-sm px-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium  disabled:opacity-50">
                {isSelectingAll
                  ? "..."
                  : isAllSelectedGlobal
                    ? `(${selectedIds.size}) Clear`
                    : `(${selectedIds.size}) All`}
              </button>

              <button
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedIds(new Set());
                }}
                className="rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSelectMode(true)}
              className="ml-2 text-xs font-medium text-blue-gray hover:text-blue-800 dark:text-gray-300 dark:hover:text-blue-300 dark:hover:bg-blue-800/50 flex items-center gap-1 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
              <CursorArrowRaysIcon className="w-4 h-4" /> Select
            </button>
          )}
        </div>
      </div>

      {/* Grid Accounts SAMA */}
      <div className="min-h-[50vh]">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
            <FolderOpenIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              This group is empty
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
                website={acc.website}
              />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Modals SAMA */}
      <SelectConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          actionType === "eject"
            ? `Eject ${selectedIds.size} Accounts?`
            : `Delete ${selectedIds.size} Accounts?`
        }
        message={
          actionType === "eject"
            ? `Eject ${selectedIds.size} accounts from "${group.name}"?`
            : `Delete permanently ${selectedIds.size} accounts?`
        }
        confirmText={actionType === "eject" ? "Eject" : "Delete"}
        isDanger={actionType === "delete"}
        isLoading={isProcessing}
      />
      <SelectGroupModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        groups={allGroups}
        onSelectGroup={handleMoveAction}
        isLoading={isProcessing}
      />
    </div>
  );
}
