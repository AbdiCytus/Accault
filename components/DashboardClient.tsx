// components/DashboardClient.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserIcon,
  EnvelopeIcon,
  FolderIcon,
  ListBulletIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  CheckIcon,
  ChevronDownIcon,
  XMarkIcon,
  TrashIcon,
  CursorArrowRaysIcon,
  ArrowUpTrayIcon,
  ArchiveBoxArrowDownIcon, // Icon Baru
} from "@heroicons/react/24/solid";
import AccountCard from "./AccountCard";
import GroupCard from "./GroupCard";
import EmailCard from "./EmailCard";
import ConfirmationModal from "./ConfirmationModal";
import toast from "react-hot-toast";

import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";

import {
  moveAccountToGroup,
  moveBulkAccountsToGroup,
  deleteBulkAccounts,
  deleteBulkGroups,
  removeBulkAccountsFromGroup,
} from "@/actions/account";

import type {
  SavedAccount,
  AccountGroup,
  EmailIdentity,
} from "@/app/generated/prisma/client";
import Portal from "./Portal";

// --- 1. TYPE DEFINITIONS ---

type AccountWithRelations = SavedAccount & {
  emailIdentity: { email: string } | null;
  group: { name: string } | null;
};

type GroupWithCount = AccountGroup & {
  _count: { accounts: number };
};

type EmailWithRelations = EmailIdentity & {
  recoveryEmail?: { email: string } | null;
  _count: { linkedAccounts: number };
};

type DashboardProps = {
  accounts: AccountWithRelations[];
  groups: GroupWithCount[];
  emails: EmailWithRelations[];
  query: string;
};

type FilterType = "all" | "account" | "group";
type GroupStatusOption = "all" | "inside" | "outside";
type FilterOption = "all" | "yes" | "no";
type SortOption = "newest" | "oldest" | "az" | "za";

interface DndData {
  type: "account" | "group";
  accountId?: string;
  groupId?: string;
  platformName?: string;
  groupName?: string;
}

const CATEGORIES = ["Social", "Game", "Work", "Finance", "Other"];

// --- 2. HELPER COMPONENTS ---

// -- MODAL PILIH GROUP (BARU) --
interface SelectGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: GroupWithCount[];
  onSelectGroup: (groupId: string) => void;
  isLoading?: boolean;
}

const SelectGroupModal = ({
  isOpen,
  onClose,
  groups,
  onSelectGroup,
  isLoading,
}: SelectGroupModalProps) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in"
          onClick={onClose}></div>
        <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-white">
              Pilih Group Tujuan
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            {groups.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Belum ada grup tersedia.
              </div>
            ) : (
              <div className="space-y-1">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    disabled={isLoading}
                    onClick={() => onSelectGroup(group.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg group transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-lg">
                        <FolderIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                          {group.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {group._count.accounts} Akun
                        </p>
                      </div>
                    </div>
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

interface DropdownItemProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

const DropdownItem = ({ label, active, onClick, icon }: DropdownItemProps) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center transition-colors ${
      active
        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
    }`}>
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
    {active && <CheckIcon className="w-4 h-4" />}
  </button>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="px-4 py-1.5 mt-2 mb-1 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
    {title}
  </div>
);

interface SectionWithSelectProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  type: "accounts" | "groups";
  selectMode: "none" | "accounts" | "groups";
  selectedCount: number;
  canBulkEject?: boolean;
  canBulkMove?: boolean; // Prop baru
  onSelectAll: () => void;
  onDelete: () => void;
  onEject?: () => void;
  onMove?: () => void; // Prop baru
  onCancel: () => void;
  onEnterSelect: () => void;
}

const SectionWithSelect = ({
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
}: SectionWithSelectProps) => {
  const isThisMode = selectMode === type;
  const isOtherMode = selectMode !== "none" && selectMode !== type;

  return (
    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
      <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
        {icon}
        {title}
      </h2>

      <div className="flex items-center gap-2">
        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500">
          {count}
        </span>

        {!isOtherMode && (
          <>
            {isThisMode ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300 ml-2">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 min-w-[60px] text-right">
                  {selectedCount} terpilih
                </span>

                <button
                  onClick={onSelectAll}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300 transition-colors">
                  Select All
                </button>

                {/* TOMBOL MOVE TO GROUP (Hanya muncul jika semua akun belum punya grup) */}
                {canBulkMove && onMove && (
                  <button
                    onClick={onMove}
                    className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                    title="Masukkan ke Group">
                    <ArchiveBoxArrowDownIcon className="w-4 h-4" />
                  </button>
                )}

                {/* TOMBOL EJECT GROUP (Hanya muncul jika semua akun dalam grup) */}
                {canBulkEject && onEject && (
                  <button
                    onClick={onEject}
                    className="text-xs px-2 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded transition-colors"
                    title="Keluarkan dari Group">
                    <ArrowUpTrayIcon className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onDelete}
                  disabled={selectedCount === 0}
                  className="text-xs px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded disabled:opacity-50 transition-colors"
                  title="Hapus Terpilih">
                  <TrashIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={onCancel}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                  title="Keluar Mode Select">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
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
};

// --- 3. MAIN COMPONENT ---

export default function DashboardClient({
  accounts,
  groups,
  emails,
  query,
}: DashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- STATE ---
  const activeTab =
    searchParams.get("tab") === "emails" ? "emails" : "accounts";

  // Filter & Sort
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterGroupStatus, setFilterGroupStatus] =
    useState<GroupStatusOption>("all");
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterHasEmail, setFilterHasEmail] = useState<FilterOption>("all");
  const [filterHasPassword, setFilterHasPassword] =
    useState<FilterOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [openMenu, setOpenMenu] = useState<"filter" | "sort" | null>(null);

  // Selection
  const [selectMode, setSelectMode] = useState<"none" | "accounts" | "groups">(
    "none"
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal Actions
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"delete" | "eject">(
    "delete"
  );

  // State untuk Modal Pilih Group (Move)
  const [isGroupSelectModalOpen, setIsGroupSelectModalOpen] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  // Reset selection on tab change
  useEffect(() => {
    setSelectMode("none");
    setSelectedIds(new Set());
  }, [activeTab]);

  // --- HANDLERS: FILTER & TAB ---

  const handleTabChange = (tab: "accounts" | "emails") => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleTypeChange = (type: FilterType) => {
    setFilterType(type);
    if (type !== "account") setFilterGroupStatus("all");
    if (type === "group") {
      setFilterCategories([]);
      setFilterHasEmail("all");
      setFilterHasPassword("all");
    }
  };

  const toggleCategory = (category: string) => {
    setFilterCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // --- MEMOIZED FILTERING ---

  const { filteredAccounts, filteredGroups } = useMemo(() => {
    let resAccounts = [...accounts];
    let resGroups = [...groups];

    if (filterType === "group") {
      resAccounts = [];
    } else if (filterType === "account") {
      resGroups = [];
    } else {
      resAccounts = resAccounts.filter((acc) => !acc.groupId);
    }

    if (filterType !== "group") {
      if (filterType === "account") {
        if (filterGroupStatus === "inside") {
          resAccounts = resAccounts.filter((acc) => acc.groupId !== null);
        } else if (filterGroupStatus === "outside") {
          resAccounts = resAccounts.filter((acc) => acc.groupId === null);
        }
      }
      if (filterCategories.length > 0) {
        resAccounts = resAccounts.filter((acc) =>
          acc.categories.some((cat) => filterCategories.includes(cat))
        );
      }
      if (filterHasEmail !== "all") {
        resAccounts = resAccounts.filter((acc) =>
          filterHasEmail === "yes" ? !!acc.emailIdentity : !acc.emailIdentity
        );
      }
      if (filterHasPassword !== "all") {
        resAccounts = resAccounts.filter((acc) =>
          filterHasPassword === "yes"
            ? !!acc.encryptedPassword
            : !acc.encryptedPassword
        );
      }
    }

    const sortFn = (a: any, b: any, key: string) => {
      if (sortBy === "az") return a[key].localeCompare(b[key]);
      if (sortBy === "za") return b[key].localeCompare(a[key]);
      return 0;
    };

    if (resAccounts.length > 0) {
      if (sortBy === "oldest") resAccounts.reverse();
      else if (sortBy !== "newest")
        resAccounts.sort((a, b) => sortFn(a, b, "platformName"));
    }
    if (resGroups.length > 0) {
      if (sortBy === "oldest") resGroups.reverse();
      else if (sortBy !== "newest")
        resGroups.sort((a, b) => sortFn(a, b, "name"));
    }

    return { filteredAccounts: resAccounts, filteredGroups: resGroups };
  }, [
    accounts,
    groups,
    filterType,
    filterGroupStatus,
    filterCategories,
    filterHasEmail,
    filterHasPassword,
    sortBy,
  ]);

  const isDataEmpty =
    filteredAccounts.length === 0 && filteredGroups.length === 0;

  // --- SELECTION LOGIC ---

  // VALIDASI EJECT (Semua harus di dalam grup)
  const canBulkEject = useMemo(() => {
    if (selectMode !== "accounts" || selectedIds.size === 0) return false;
    const selectedAccounts = filteredAccounts.filter((acc) =>
      selectedIds.has(acc.id)
    );
    return (
      selectedAccounts.length > 0 &&
      selectedAccounts.every((acc) => acc.groupId !== null)
    );
  }, [selectMode, selectedIds, filteredAccounts]);

  // VALIDASI MOVE (Semua harus di luar grup / Orphan)
  const canBulkMove = useMemo(() => {
    if (selectMode !== "accounts" || selectedIds.size === 0) return false;
    const selectedAccounts = filteredAccounts.filter((acc) =>
      selectedIds.has(acc.id)
    );
    // Tombol hanya muncul jika selected > 0 DAN semua selected item TIDAK punya groupId (null)
    return (
      selectedAccounts.length > 0 &&
      selectedAccounts.every((acc) => acc.groupId === null)
    );
  }, [selectMode, selectedIds, filteredAccounts]);

  const enterSelectMode = (type: "accounts" | "groups") => {
    setSelectMode(type);
    setSelectedIds(new Set());
  };

  const exitSelectMode = () => {
    setSelectMode("none");
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = (type: "accounts" | "groups") => {
    const targetIds =
      type === "accounts"
        ? filteredAccounts.map((a) => a.id)
        : filteredGroups.map((g) => g.id);
    const allSelected =
      targetIds.length > 0 && targetIds.every((id) => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(targetIds));
  };

  // --- ACTIONS HANDLERS ---

  const handleDeleteTrigger = () => {
    if (selectedIds.size === 0)
      return toast.error("Pilih item terlebih dahulu");
    setBulkActionType("delete");
    setIsConfirmModalOpen(true);
  };

  const handleEjectTrigger = () => {
    if (!canBulkEject) return;
    setBulkActionType("eject");
    setIsConfirmModalOpen(true);
  };

  const handleMoveTrigger = () => {
    if (!canBulkMove) return;
    setIsGroupSelectModalOpen(true);
  };

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    let result;
    const ids = Array.from(selectedIds);

    if (bulkActionType === "delete") {
      if (selectMode === "accounts") result = await deleteBulkAccounts(ids);
      else if (selectMode === "groups") result = await deleteBulkGroups(ids);
    } else if (bulkActionType === "eject") {
      result = await removeBulkAccountsFromGroup(ids);
    }

    setIsProcessing(false);
    setIsConfirmModalOpen(false);

    if (result?.success) {
      toast.success(result.message);
      exitSelectMode();
    } else {
      toast.error(result?.message || "Gagal memproses aksi");
    }
  };

  // Handler untuk Memindahkan Akun ke Grup (via Modal)
  const handleBulkMoveToGroup = async (targetGroupId: string) => {
    setIsProcessing(true);
    const ids = Array.from(selectedIds);

    // Kita gunakan action yang sudah ada
    const result = await moveBulkAccountsToGroup(ids, targetGroupId);

    setIsProcessing(false);
    setIsGroupSelectModalOpen(false); // Tutup modal group

    if (result.success) {
      toast.success(result.message);
      exitSelectMode();
    } else {
      toast.error(result.message);
    }
  };

  // --- DND LOGIC ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor)
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeData = active.data.current as DndData | undefined;
    const overData = over.data.current as DndData | undefined;

    if (
      activeData?.type === "account" &&
      overData?.type === "group" &&
      overData.groupId
    ) {
      const activeId = activeData.accountId!;
      const isMultiDrag =
        selectMode === "accounts" && selectedIds.has(activeId);
      const idsToMove = isMultiDrag ? Array.from(selectedIds) : [activeId];
      const count = idsToMove.length;
      const toastId = toast.loading(
        `Memindahkan ${
          count > 1 ? `${count} akun` : activeData.platformName
        }...`
      );

      let result;
      if (count > 1) {
        result = await moveBulkAccountsToGroup(idsToMove, overData.groupId);
      } else {
        result = await moveAccountToGroup(activeId, overData.groupId);
      }

      if (result.success) {
        toast.success(result.message, { id: toastId });
        if (isMultiDrag) exitSelectMode();
      } else {
        toast.error(result.message, { id: toastId });
      }
    }
  }

  // --- RENDER ---
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* TOOLBAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm sticky top-4 z-30 transition-colors">
          <div className="flex gap-2 w-full sm:w-auto relative">
            {activeTab === "accounts" ? (
              <>
                {/* FILTER DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === "filter" ? null : "filter")
                    }
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      filterType !== "all" ||
                      filterCategories.length > 0 ||
                      filterHasEmail !== "all" ||
                      filterHasPassword !== "all" ||
                      filterGroupStatus !== "all"
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    }`}>
                    <FunnelIcon className="w-4 h-4" />
                    <span>Filter</span>
                    {filterCategories.length > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full">
                        {filterCategories.length}
                      </span>
                    )}
                    <ChevronDownIcon
                      className={`w-3 h-3 transition-transform ${
                        openMenu === "filter" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openMenu === "filter" && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenu(null)}></div>
                      <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden py-2 max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-150">
                        <SectionHeader title="Tampilkan" />
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 mx-4 rounded-lg mb-2">
                          <button
                            onClick={() => handleTypeChange("all")}
                            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                              filterType === "all"
                                ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                                : "text-gray-500"
                            }`}>
                            Semua
                          </button>
                          <button
                            onClick={() => handleTypeChange("account")}
                            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                              filterType === "account"
                                ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                                : "text-gray-500"
                            }`}>
                            Akun
                          </button>
                          <button
                            onClick={() => handleTypeChange("group")}
                            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                              filterType === "group"
                                ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                                : "text-gray-500"
                            }`}>
                            Group
                          </button>
                        </div>

                        {filterType === "account" && (
                          <>
                            <SectionHeader title="Lokasi Akun" />
                            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 mx-4 rounded-lg mb-2">
                              <button
                                onClick={() => setFilterGroupStatus("all")}
                                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                                  filterGroupStatus === "all"
                                    ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                                    : "text-gray-500"
                                }`}>
                                Semua
                              </button>
                              <button
                                onClick={() => setFilterGroupStatus("outside")}
                                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                                  filterGroupStatus === "outside"
                                    ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                                    : "text-gray-500"
                                }`}>
                                Luar
                              </button>
                              <button
                                onClick={() => setFilterGroupStatus("inside")}
                                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                                  filterGroupStatus === "inside"
                                    ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                                    : "text-gray-500"
                                }`}>
                                Grup
                              </button>
                            </div>
                          </>
                        )}

                        {filterType !== "group" && (
                          <>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                            <SectionHeader title="Kategori" />
                            <div className="px-4 flex flex-wrap gap-2 mb-2">
                              {CATEGORIES.map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => toggleCategory(cat)}
                                  className={`px-3 py-1 rounded-full text-xs border transition-all select-none ${
                                    filterCategories.includes(cat)
                                      ? "bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300 font-medium"
                                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                                  }`}>
                                  {cat}
                                </button>
                              ))}
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                            <SectionHeader title="Kelengkapan" />
                            <div className="px-4 py-2 space-y-3">
                              <div>
                                <p className="text-xs text-gray-500 mb-1.5">
                                  Email Terhubung
                                </p>
                                <div className="flex gap-2">
                                  {(
                                    [
                                      ["all", "Semua"],
                                      ["yes", "Ada"],
                                      ["no", "Tidak"],
                                    ] as const
                                  ).map(([val, label]) => (
                                    <button
                                      key={val}
                                      onClick={() =>
                                        setFilterHasEmail(val as FilterOption)
                                      }
                                      className={`px-3 py-1 rounded text-xs border ${
                                        filterHasEmail === val
                                          ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800"
                                          : "border-gray-200 dark:border-gray-600"
                                      }`}>
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1.5">
                                  Password Tersimpan
                                </p>
                                <div className="flex gap-2">
                                  {(
                                    [
                                      ["all", "Semua"],
                                      ["yes", "Ada"],
                                      ["no", "Tidak"],
                                    ] as const
                                  ).map(([val, label]) => (
                                    <button
                                      key={val}
                                      onClick={() =>
                                        setFilterHasPassword(
                                          val as FilterOption
                                        )
                                      }
                                      className={`px-3 py-1 rounded text-xs border ${
                                        filterHasPassword === val
                                          ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800"
                                          : "border-gray-200 dark:border-gray-600"
                                      }`}>
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2 px-4 pb-2">
                          <button
                            onClick={() => {
                              handleTypeChange("all");
                              setFilterGroupStatus("all");
                              setFilterCategories([]);
                              setFilterHasEmail("all");
                              setFilterHasPassword("all");
                              setOpenMenu(null);
                            }}
                            className="w-full py-2 text-xs text-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            Reset Filter
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* SORT DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === "sort" ? null : "sort")
                    }
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      sortBy !== "newest"
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    }`}>
                    <ArrowsUpDownIcon className="w-4 h-4" />
                    <span>Urutkan</span>
                  </button>

                  {openMenu === "sort" && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenu(null)}></div>
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden py-1 animate-in zoom-in-95 duration-150">
                        <SectionHeader title="Waktu Ditambahkan" />
                        <DropdownItem
                          label="Paling Baru"
                          active={sortBy === "newest"}
                          onClick={() => setSortBy("newest")}
                        />
                        <DropdownItem
                          label="Paling Lama"
                          active={sortBy === "oldest"}
                          onClick={() => setSortBy("oldest")}
                        />
                        <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                        <SectionHeader
                          title={
                            filterType === "group"
                              ? "Nama Group"
                              : "Nama Platform"
                          }
                        />
                        <DropdownItem
                          label="Abjad (A-Z)"
                          active={sortBy === "az"}
                          onClick={() => setSortBy("az")}
                        />
                        <DropdownItem
                          label="Abjad (Z-A)"
                          active={sortBy === "za"}
                          onClick={() => setSortBy("za")}
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400 italic py-2">
                Filter tidak tersedia di tab Email
              </div>
            )}
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => handleTabChange("accounts")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeTab === "accounts"
                  ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Akun</span>
            </button>
            <button
              onClick={() => handleTabChange("emails")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeTab === "emails"
                  ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
              <EnvelopeIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </button>
          </div>
        </div>

        {activeTab === "accounts" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* SECTION GROUP */}
            {filteredGroups.length > 0 && (
              <section className="space-y-3">
                <SectionWithSelect
                  title="Folder Group"
                  count={filteredGroups.length}
                  icon={<FolderIcon className="w-5 h-5 text-blue-500" />}
                  type="groups"
                  selectMode={selectMode}
                  selectedCount={selectedIds.size}
                  onSelectAll={() => handleSelectAll("groups")}
                  onDelete={handleDeleteTrigger}
                  onCancel={exitSelectMode}
                  onEnterSelect={() => enterSelectMode("groups")}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      id={group.id}
                      name={group.name}
                      count={group._count.accounts}
                      isSelectMode={selectMode === "groups"}
                      isSelected={selectedIds.has(group.id)}
                      onToggleSelect={toggleSelection}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* SECTION AKUN */}
            {filteredAccounts.length > 0 && (
              <section className="space-y-3">
                <SectionWithSelect
                  title="Daftar Akun"
                  count={filteredAccounts.length}
                  icon={<ListBulletIcon className="w-5 h-5 text-green-500" />}
                  type="accounts"
                  selectMode={selectMode}
                  selectedCount={selectedIds.size}
                  canBulkEject={canBulkEject}
                  canBulkMove={canBulkMove} // Pass validasi Move
                  onSelectAll={() => handleSelectAll("accounts")}
                  onDelete={handleDeleteTrigger}
                  onEject={handleEjectTrigger}
                  onMove={handleMoveTrigger} // Handler Move
                  onCancel={exitSelectMode}
                  onEnterSelect={() => enterSelectMode("accounts")}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAccounts.map((acc) => (
                    <AccountCard
                      key={acc.id}
                      id={acc.id}
                      platformName={acc.platformName}
                      username={acc.username}
                      categories={acc.categories}
                      email={acc.emailIdentity?.email}
                      hasPassword={!!acc.encryptedPassword}
                      icon={acc.icon}
                      groupName={acc.group?.name}
                      groupId={acc.groupId}
                      isSelectMode={selectMode === "accounts"}
                      isSelected={selectedIds.has(acc.id)}
                      onToggleSelect={toggleSelection}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* EMPTY STATE */}
            {isDataEmpty && (
              <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <div className="flex flex-col items-center gap-2">
                  <FunnelIcon className="w-12 h-12 text-gray-300" />
                  <p className="text-gray-500 font-medium">
                    Tidak ada data yang sesuai filter.
                  </p>
                  <button
                    onClick={() => {
                      handleTypeChange("all");
                      setFilterGroupStatus("all");
                      setFilterCategories([]);
                      setFilterHasEmail("all");
                      setFilterHasPassword("all");
                    }}
                    className="text-sm text-blue-600 hover:underline">
                    Reset Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {emails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emails.map((e) => (
                  <EmailCard
                    key={e.id}
                    id={e.id}
                    email={e.email}
                    name={e.name}
                    isVerified={e.isVerified}
                    linkedCount={e._count.linkedAccounts}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500">
                  {query ? "Tidak ditemukan" : "Belum ada email"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          bulkActionType === "delete"
            ? `Hapus ${selectedIds.size} Item?`
            : `Keluarkan ${selectedIds.size} Akun?`
        }
        message={
          bulkActionType === "delete"
            ? `Apakah Anda yakin ingin menghapus ${selectedIds.size} ${
                selectMode === "accounts" ? "akun" : "group"
              } yang dipilih? Data yang dihapus tidak dapat dikembalikan.`
            : `Apakah Anda yakin ingin mengeluarkan ${selectedIds.size} akun dari grup masing-masing? Akun tidak akan dihapus, hanya dikeluarkan.`
        }
        confirmText={
          bulkActionType === "delete" ? "Ya, Hapus Permanen" : "Ya, Keluarkan"
        }
        isDanger={bulkActionType === "delete"}
        isLoading={isProcessing}
      />

      {/* MODAL PILIH GROUP */}
      <SelectGroupModal
        isOpen={isGroupSelectModalOpen}
        onClose={() => setIsGroupSelectModalOpen(false)}
        groups={groups}
        onSelectGroup={handleBulkMoveToGroup}
        isLoading={isProcessing}
      />
    </DndContext>
  );
}
