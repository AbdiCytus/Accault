// components/detail/GroupClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderOpenIcon,
  CursorArrowRaysIcon,
  XMarkIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  ArrowRightEndOnRectangleIcon, // <--- 1. Import Ikon Move
} from "@heroicons/react/24/outline";

import AccountCard from "../cards/AccountCard";
import toast from "react-hot-toast";

// Import Action
import {
  removeBulkAccountsFromGroup,
  deleteBulkAccounts,
  moveBulkAccountsToGroup, // <--- 2. Import Action Move
} from "@/actions/account";

import type { SavedAccount, AccountGroup } from "@/app/generated/prisma/client";
import SelectConfirmationModal from "../modals/SelectConfirmationModal";
import SelectGroupModal from "../dashboard/SelectGroupModal"; // <--- 3. Import Modal Select Group
import { GroupWithCount } from "@/types/dashboard";

// --- TYPES ---
type AccountWithRelations = SavedAccount & {
  emailIdentity: { email: string } | null;
  group: { name: string } | null;
};

type Props = {
  group: AccountGroup;
  accounts: AccountWithRelations[];
  allGroups: GroupWithCount[]; // <--- 4. Tambah Prop allGroups
};

// --- MAIN COMPONENT ---

export default function GroupClient({ group, accounts, allGroups }: Props) {
  const router = useRouter();

  // State Seleksi
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // State Modal Konfirmasi
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "eject">("eject");

  // State Modal Move (Baru)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- HANDLERS ---
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

  const handleEjectTrigger = () => {
    if (selectedIds.size === 0) return toast.error("Select atleast 1 item");
    setActionType("eject");
    setIsConfirmOpen(true);
  };

  const handleDeleteTrigger = () => {
    if (selectedIds.size === 0) return toast.error("Select atleast 1 item");
    setActionType("delete");
    setIsConfirmOpen(true);
  };

  // Handler Trigger Move (Baru)
  const handleMoveTrigger = () => {
    if (selectedIds.size === 0) return toast.error("Select atleast 1 item");
    setIsMoveModalOpen(true);
  };

  // Handler Eksekusi Move (Baru)
  const handleMoveAction = async (targetGroupId: string) => {
    setIsProcessing(true);
    const ids = Array.from(selectedIds);

    // Panggil Server Action
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
      toast.error(result?.message || "Failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER & TOOLBAR (Tetap dipertahankan sesuai permintaan layout) */}
      <div className="flex justify-between items-end gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">
              Account<span className="sm:hidden">s</span>
              <span className="hidden sm:inline"> List</span>
            </h1>
          </div>
        </div>

        {/* TOOLBAR ACTIONS */}
        <div className="flex items-center gap-2">
          {isSelectMode ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                onClick={handleMoveTrigger}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50 rounded-lg text-sm font-medium transition-colors"
                title="Move to another group">
                <ArrowRightEndOnRectangleIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Move</span>
              </button>

              <button
                onClick={handleEjectTrigger}
                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500 dark:hover:bg-yellow-800/50 rounded-lg text-sm font-medium transition-colors"
                title="Remove from this group">
                <ArrowUpTrayIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Eject</span>
              </button>

              <button
                onClick={handleDeleteTrigger}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500 dark:hover:bg-red-800/50 rounded-lg text-sm font-medium transition-colors"
                title="Delete Permanently">
                <TrashIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

              <button
                onClick={handleSelectAll}
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2">
                {selectedIds.size === accounts.length ? "Cancel" : "All"}
              </button>

              <button
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedIds(new Set());
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSelectMode(true)}
              className="ml-2 text-xs font-medium text-blue-gray hover:text-blue-800 dark:text-gray-300 dark:hover:text-blue-300 dark:hover:bg-blue-800/50 flex items-center gap-1 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
              <CursorArrowRaysIcon className="w-4 h-4" />
              Select
            </button>
          )}
        </div>
      </div>

      {/* GRID ACCOUNTS (Tetap) */}
      <div className="min-h-[50vh]">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
            <FolderOpenIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              This group is empty
            </p>
            <p className="text-sm text-gray-400">
              Drag accounts here from dashboard or create new ones
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
      </div>

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

      {/* --- RENDER MODAL MOVE BARU --- */}
      <SelectGroupModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        groups={allGroups} // Data dari props page
        onSelectGroup={handleMoveAction}
        isLoading={isProcessing}
      />
    </div>
  );
}
