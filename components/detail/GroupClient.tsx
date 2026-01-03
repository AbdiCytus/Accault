// components/GroupDetailClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderOpenIcon,
  CursorArrowRaysIcon,
  XMarkIcon,
  TrashIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

import AccountCard from "../cards/AccountCard";
import toast from "react-hot-toast";

// Import Action yang BENAR
import {
  removeBulkAccountsFromGroup,
  deleteBulkAccounts,
} from "@/actions/account";

// Import Tipe Data yang BENAR (AccountGroup, bukan SavedGroup)
import type { SavedAccount, AccountGroup } from "@/app/generated/prisma/client";
import SelectConfirmationModal from "../modals/SelectConfirmationModal";

// --- TYPES ---
type AccountWithRelations = SavedAccount & {
  emailIdentity: { email: string } | null;
  group: { name: string } | null;
};

type Props = {
  group: AccountGroup; // FIX: Gunakan AccountGroup
  accounts: AccountWithRelations[];
};

// --- MAIN COMPONENT ---

export default function GroupClient({ group, accounts }: Props) {
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
    if (selectedIds.size === 0) return toast.error("Select Account First");
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
      toast.error(result?.message || "Failed Process");
    }
  };

  return (
    <>
      {/* 3. ACCOUNT LIST */}
      <div>
        {/* SECTION */}
        <div className="flex flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span>Account List</span>
          </h2>

          {accounts.length > 0 && (
            <div className="flex items-center gap-2 self-end sm:self-auto animate-in fade-in slide-in-from-right-2">
              {isSelectMode ? (
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 px-2">
                    {selectedIds.size}
                  </span>

                  <button
                    onClick={() => triggerAction("eject")}
                    disabled={selectedIds.size === 0}
                    className="p-1.5 hover:bg-yellow-50 text-yellow-600 dark:text-yellow-500 dark:hover:text-yellow-400 dark:hover:bg-yellow-900/50 rounded disabled:opacity-50 transition-colors">
                    <ArrowUpTrayIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => triggerAction("delete")}
                    disabled={selectedIds.size === 0}
                    className="p-1.5 hover:bg-red-50 text-red-600 dark:text-red-500 dark:hover:text-red-400 dark:hover:bg-red-900/50 rounded disabled:opacity-50 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

                  <button
                    onClick={handleSelectAll}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                    {selectedIds.size === accounts.length
                      ? "Cancel"
                      : "All"}
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

        {/* CONTENTS */}
        {accounts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <FolderOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Empty Group</p>
            <p className="text-sm text-gray-400">
              Move some account from dashboard to this group
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
        isDanger={actionType === "eject" ? false : true}
        isLoading={isProcessing}
      />
    </>
  );
}
