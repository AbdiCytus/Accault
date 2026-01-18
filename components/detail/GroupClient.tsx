// components/detail/GroupClient.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  FolderOpenIcon,
  CursorArrowRaysIcon,
  XMarkIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  CheckBadgeIcon,
  ChevronLeftIcon,
  ListBulletIcon,
} from "@heroicons/react/24/solid"; // Gunakan Solid agar konsisten dengan Dashboard

import AccountCard from "../cards/AccountCard";
import toast from "react-hot-toast";
import PaginationControl from "../dashboard/PaginationControl";
import Link from "next/link";

import {
  removeBulkAccountsFromGroup,
  deleteBulkAccounts,
  moveBulkAccountsToGroup,
} from "@/actions/account";
import { getAllGroupAccountIds } from "@/actions/group";

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
  totalAccounts: number;
};

// --- KOMPONEN TOMBOL AKSI (Reused Pattern) ---
const ActionButtons = ({
  isMobile,
  selectedCount,
  onSelectAll,
  onMove,
  onEject,
  onDelete,
  onCancel,
}: {
  isMobile: boolean;
  selectedCount: number;
  onSelectAll: () => void;
  onMove: () => void;
  onEject: () => void;
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

    {/* 2. MOVE */}
    <button
      onClick={onMove}
      disabled={selectedCount === 0}
      className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      title="Move to another group">
      <FolderOpenIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Move</span>
    </button>

    {/* 3. EJECT */}
    <button
      onClick={onEject}
      disabled={selectedCount === 0}
      className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      title="Remove from this group">
      <ArrowUpTrayIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Eject</span>
    </button>

    {/* 4. DELETE */}
    <button
      onClick={onDelete}
      disabled={selectedCount === 0}
      className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      title="Delete Selected">
      <TrashIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Delete</span>
    </button>

    {/* 5. CANCEL (Desktop Only) */}
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

export default function GroupClient({
  group,
  accounts,
  allGroups,
  totalPages,
  currentPage,
  totalAccounts,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State UI
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // State Modals
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "eject">("delete");

  // Deteksi Mobile
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handler Selection
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = async () => {
    const isAllSelected =
      selectedIds.size === totalAccounts && totalAccounts > 0;

    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const toastId = toast.loading("Selecting all accounts in group...");
      try {
        const ids = await getAllGroupAccountIds(group.id);
        setSelectedIds(new Set(ids));
        toast.success(`Selected ${ids.length} accounts`, { id: toastId });
      } catch (error) {
        toast.error("Failed to select all", { id: toastId });
      }
    }
  };

  // Handler Actions
  const handleConfirmAction = async () => {
    setIsProcessing(true);
    const ids = Array.from(selectedIds);
    let result;

    if (actionType === "delete") {
      result = await deleteBulkAccounts(ids);
    } else {
      result = await removeBulkAccountsFromGroup(ids);
    }

    setIsProcessing(false);
    setIsConfirmOpen(false);

    if (result.success) {
      toast.success(result.message);
      setIsSelectMode(false);
      setSelectedIds(new Set());
    } else {
      toast.error(result.message);
    }
  };

  const handleMoveAccounts = async (targetGroupId: string) => {
    setIsProcessing(true);
    const ids = Array.from(selectedIds);
    const result = await moveBulkAccountsToGroup(ids, targetGroupId);

    setIsProcessing(false);
    setIsMoveModalOpen(false);

    if (result.success) {
      toast.success(result.message);
      setIsSelectMode(false);
      setSelectedIds(new Set());
    } else {
      toast.error(result.message);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* HEADER BAR (Desktop Only - Mobile pakai Floating) */}
      <div className="flex flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        {/* Title / Back Button */}
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <ListBulletIcon className="w-6 h-6 text-green-500" />
              <span>Account List</span>
            </h1>
          </div>
        </div>

        {/* Toolbar Kanan */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isSelectMode ? (
            !isMobile && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <ActionButtons
                  isMobile={false}
                  selectedCount={selectedIds.size}
                  onSelectAll={handleSelectAll}
                  onMove={() => setIsMoveModalOpen(true)}
                  onEject={() => {
                    setActionType("eject");
                    setIsConfirmOpen(true);
                  }}
                  onDelete={() => {
                    setActionType("delete");
                    setIsConfirmOpen(true);
                  }}
                  onCancel={() => {
                    setIsSelectMode(false);
                    setSelectedIds(new Set());
                  }}
                />
              </div>
            )
          ) : (
            <button
              onClick={() => setIsSelectMode(true)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-all">
              <CursorArrowRaysIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 dark:text-gray-500 dark:group-hover:text-blue-400" />
              Select Accounts
            </button>
          )}
        </div>
      </div>

      {/* GRID CONTENT */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
              groupId={group.id} // Inside group
              isSelectMode={isSelectMode}
              isSelected={selectedIds.has(acc.id)}
              onToggleSelect={toggleSelection}
              website={acc.website}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <FolderOpenIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>This group is empty</p>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* MODALS */}
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
            ? `Are you sure you want to remove ${selectedIds.size} accounts from "${group.name}"? They will be moved to 'Outside Group'.`
            : `WARNING: This will permanently delete ${selectedIds.size} accounts. This action cannot be undone.`
        }
        confirmText={actionType === "eject" ? "Yes, Eject" : "Yes, Delete"}
        isDanger={actionType === "delete"}
        isLoading={isProcessing}
      />

      <SelectGroupModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        groups={allGroups} // Pastikan tidak memindahkan ke grup yang sama (bisa difilter jika mau)
        onSelectGroup={handleMoveAccounts}
        isLoading={isProcessing}
      />

      {/* --- MOBILE FLOATING ACTION BAR --- */}
      {isSelectMode &&
        isMobile &&
        mounted &&
        createPortal(
          <div className="fixed bottom-4 left-4 right-4 z-[9999] animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-2xl p-3 flex items-center justify-between">
              {/* Counter Kiri */}
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md min-w-[24px] text-center">
                  {selectedIds.size}
                </span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Selected
                </span>
              </div>

              {/* Tombol Aksi Kanan (Ikon Saja) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMoveModalOpen(true)}
                  disabled={selectedIds.size === 0}
                  title="Move"
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-300 disabled:opacity-50">
                  <FolderOpenIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    setActionType("eject");
                    setIsConfirmOpen(true);
                  }}
                  disabled={selectedIds.size === 0}
                  title="Eject"
                  className="p-2 bg-yellow-50 text-yellow-600 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-300 disabled:opacity-50">
                  <ArrowUpTrayIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    setActionType("delete");
                    setIsConfirmOpen(true);
                  }}
                  disabled={selectedIds.size === 0}
                  title="Delete"
                  className="p-2 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/30 dark:text-red-300 disabled:opacity-50">
                  <TrashIcon className="w-5 h-5" />
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsSelectMode(false);
                    setSelectedIds(new Set());
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tombol Select All Tambahan di atas Floating Bar */}
            <div className="absolute -top-12 right-0">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-1 bg-white dark:bg-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 active:scale-95 transition-transform">
                <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                Select All
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
