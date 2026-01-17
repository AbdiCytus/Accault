// components/DashboardClient.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FolderIcon,
  ListBulletIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import { deleteBulkEmails } from "@/actions/email";

// Sub-components
import AccountCard from "./cards/AccountCard";
import GroupCard from "./cards/GroupCard";
import EmailCard from "./cards/EmailCard";
import DashboardToolbar from "./dashboard/DashboardToolbar";
import PaginationControl from "./dashboard/PaginationControl";
import SectionWithSelect from "./dashboard/SectionWithSelect";
import SelectGroupModal from "./dashboard/SelectGroupModal";
import AddDataModal from "./modals/AddDataModal";

import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";

import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { ACCOUNT_CATEGORIES } from "@/lib/categories";

import {
  moveAccountToGroup,
  moveBulkAccountsToGroup,
  deleteBulkAccounts,
  deleteBulkGroups,
  removeBulkAccountsFromGroup,
} from "@/actions/account";

import { useLock } from "@/components/providers/LockProvider";

// Types
import {
  AccountWithRelations,
  GroupWithCount,
  EmailWithRelations,
  FilterType,
  GroupStatusOption,
  FilterOption,
  SortOption,
  DndData,
} from "@/types/dashboard";
import SelectConfirmationModal from "./modals/SelectConfirmationModal";
import AccountEmailSkeleton from "./dashboard/AccountEmailSkeleton";

type DashboardProps = {
  accounts: AccountWithRelations[];
  groups: GroupWithCount[];
  emails: EmailWithRelations[];
  query: string;
};

const ITEMS_PER_PAGE_ACCOUNTS = 12;
const ITEMS_PER_PAGE_GROUPS = 8;
const ITEMS_PER_PAGE_EMAILS = 10;

export default function DashboardClient({
  accounts,
  groups,
  emails,
  query,
}: DashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const { isRefetching } = useLock();

  useEffect(() => setMounted(true), []);
  const tabParam = searchParams.get("tab");

  // --- STATE ---
  const [activeTab, setActiveTab] = useState(
    tabParam === "emails" || tabParam === "accounts" ? tabParam : "accounts"
  );
  const [isTabLoading, setIsTabLoading] = useState(false);

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Selection
  const [selectMode, setSelectMode] = useState<
    "none" | "accounts" | "groups" | "emails"
  >("none");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Collapse State
  const [isGroupsExpanded, setIsGroupsExpanded] = useState(true);
  const [isAccountsExpanded, setIsAccountsExpanded] = useState(true);
  const [isEmailsExpanded, setIsEmailsExpanded] = useState(true);

  // Modals & Actions
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"delete" | "eject">(
    "delete"
  );
  const [isGroupSelectModalOpen, setIsGroupSelectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // State untuk Add Data Modal (NEW)
  const [isAddDataOpen, setIsAddDataOpen] = useState(false);

  // --- LOGIC UTAMA ---
  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });

    setIsTabLoading(true);
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectMode("none");
    setSelectedIds(new Set());

    setTimeout(() => {
      setIsTabLoading(false);
    }, 500);
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

  const handleResetFilter = () => {
    setFilterType("all");
    setFilterGroupStatus("all");
    setFilterCategories([]);
    setFilterHasEmail("all");
    setFilterHasPassword("all");
    setOpenMenu(null);
  };

  // --- MEMOIZED FILTERING & PAGINATION ---
  const {
    paginatedAccounts,
    paginatedGroups,
    paginatedEmails,
    totalPages,
    rawFilteredAccounts,
    rawFilteredGroups,
  } = useMemo(() => {
    let resAccounts = [...accounts];
    let resGroups = [...groups];

    // Filter Logic
    if (filterType === "group") resAccounts = [];
    else if (filterType === "account") resGroups = [];
    else if (!query) resAccounts = resAccounts.filter((acc) => !acc.groupId);

    if (filterType !== "group") {
      if (filterType === "account") {
        if (filterGroupStatus === "inside")
          resAccounts = resAccounts.filter((acc) => acc.groupId !== null);
        else if (filterGroupStatus === "outside")
          resAccounts = resAccounts.filter((acc) => acc.groupId === null);
      }
      if (filterCategories.length > 0)
        resAccounts = resAccounts.filter((acc) =>
          acc.categories.some((cat) => filterCategories.includes(cat))
        );
      if (filterHasEmail !== "all")
        resAccounts = resAccounts.filter((acc) =>
          filterHasEmail === "yes" ? !!acc.emailIdentity : !acc.emailIdentity
        );
      if (filterHasPassword !== "all")
        resAccounts = resAccounts.filter((acc) =>
          filterHasPassword === "yes"
            ? !!acc.encryptedPassword
            : !acc.encryptedPassword
        );
    }

    // Sort Logic
    if (resAccounts.length > 0) {
      if (sortBy === "oldest") {
        resAccounts.reverse();
      } else if (sortBy !== "newest") {
        resAccounts.sort((a, b) => {
          if (sortBy === "az")
            return a.platformName.localeCompare(b.platformName);
          if (sortBy === "za")
            return b.platformName.localeCompare(a.platformName);
          return 0;
        });
      }
    }

    if (resGroups.length > 0) {
      resGroups.sort((a, b) => {
        // Sort by Date (Newest/Oldest)
        if (sortBy === "newest") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        if (sortBy === "oldest") {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }

        // Sort by Name (A-Z / Z-A)
        if (sortBy === "az") return a.name.localeCompare(b.name);
        if (sortBy === "za") return b.name.localeCompare(a.name);

        return 0;
      });
    }

    // Pagination Logic
    let computedTotalPages = 1;
    let slicedAccounts: AccountWithRelations[] = [];
    let slicedGroups: GroupWithCount[] = [];
    let slicedEmails: EmailWithRelations[] = [];

    if (activeTab === "accounts") {
      const totalAccountPages = Math.ceil(
        resAccounts.length / ITEMS_PER_PAGE_ACCOUNTS
      );
      const totalGroupPages = Math.ceil(
        resGroups.length / ITEMS_PER_PAGE_GROUPS
      );
      computedTotalPages = Math.max(totalAccountPages, totalGroupPages, 1);

      const accStart = (currentPage - 1) * ITEMS_PER_PAGE_ACCOUNTS;
      slicedAccounts = resAccounts.slice(
        accStart,
        accStart + ITEMS_PER_PAGE_ACCOUNTS
      );

      const grpStart = (currentPage - 1) * ITEMS_PER_PAGE_GROUPS;
      slicedGroups = resGroups.slice(
        grpStart,
        grpStart + ITEMS_PER_PAGE_GROUPS
      );
    } else {
      computedTotalPages =
        Math.ceil(emails.length / ITEMS_PER_PAGE_EMAILS) || 1;
      const emailStart = (currentPage - 1) * ITEMS_PER_PAGE_EMAILS;
      slicedEmails = emails.slice(
        emailStart,
        emailStart + ITEMS_PER_PAGE_EMAILS
      );
    }

    return {
      paginatedAccounts: slicedAccounts,
      paginatedGroups: slicedGroups,
      paginatedEmails: slicedEmails,
      totalPages: computedTotalPages,
      rawFilteredAccounts: resAccounts,
      rawFilteredGroups: resGroups,
    };
  }, [
    accounts,
    groups,
    emails,
    activeTab,
    currentPage,
    filterType,
    filterGroupStatus,
    filterCategories,
    filterHasEmail,
    filterHasPassword,
    sortBy,
    query,
  ]);

  // --- RESET PAGINATION ---
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterType,
    filterGroupStatus,
    filterCategories, // Array dependency aman karena update via state setter
    filterHasEmail,
    filterHasPassword,
    sortBy,
    query, // Prop query dari search bar
  ]);

  useEffect(() => {
    const isCurrentPageEmpty =
      activeTab === "accounts"
        ? paginatedAccounts.length === 0 && paginatedGroups.length === 0
        : paginatedEmails.length === 0;

    if (currentPage > 1 && isCurrentPageEmpty) {
      setCurrentPage(1);
      // Opsional: Toast notifikasi jika perlu, tapi biasanya auto-redirect cukup
    }
  }, [
    currentPage,
    activeTab,
    paginatedAccounts.length,
    paginatedGroups.length,
    paginatedEmails.length,
  ]);

  const isDataEmpty =
    (activeTab === "accounts" &&
      paginatedAccounts.length === 0 &&
      paginatedGroups.length === 0) ||
    (activeTab === "emails" && paginatedEmails.length === 0);

  // --- SELECTION LOGIC ---
  const canBulkEject = useMemo(() => {
    if (selectMode !== "accounts" || selectedIds.size === 0) return false;
    const selectedAccounts = accounts.filter((acc) => selectedIds.has(acc.id));
    return (
      selectedAccounts.length > 0 &&
      selectedAccounts.every((acc) => acc.groupId !== null)
    );
  }, [selectMode, selectedIds, accounts]);

  const canBulkMove = useMemo(() => {
    if (selectMode !== "accounts" || selectedIds.size === 0) return false;
    const selectedAccounts = accounts.filter((acc) => selectedIds.has(acc.id));
    return (
      selectedAccounts.length > 0 &&
      selectedAccounts.every((acc) => acc.groupId === null)
    );
  }, [selectMode, selectedIds, accounts]);

  const enterSelectMode = (type: "accounts" | "groups" | "emails") => {
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

  const handleSelectAllAction = (type: "accounts" | "groups" | "emails") => {
    let targetArray: any[] = [];
    if (type === "accounts") targetArray = rawFilteredAccounts;
    else if (type === "groups") targetArray = rawFilteredGroups;
    else if (type === "emails") targetArray = paginatedEmails;

    const targetIds = targetArray.map((item) => item.id);
    const allSelected =
      targetIds.length > 0 && targetIds.every((id) => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(targetIds));
  };

  // --- ACTIONS HANDLERS ---
  const handleDeleteTrigger = () => {
    if (selectedIds.size === 0)
      return toast.error("Please select atleast 1 item");
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
      if (selectMode === "emails") result = await deleteBulkEmails(ids);
      else if (selectMode === "accounts")
        result = await deleteBulkAccounts(ids);
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
      toast.error(result?.message || "Action Process Failed");
    }
  };

  const handleBulkMoveToGroup = async (targetGroupId: string) => {
    setIsProcessing(true);
    const ids = Array.from(selectedIds);
    const result = await moveBulkAccountsToGroup(ids, targetGroupId);
    setIsProcessing(false);
    setIsGroupSelectModalOpen(false);
    if (result.success) {
      toast.success(result.message);
      exitSelectMode();
    } else {
      toast.error(result.message);
    }
  };

  // --- DND LOGIC ---
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5, // Toleransi gerakan jari sedikit saat menahan
      },
    })
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
        `Moving ${count > 1 ? `${count} accounts` : activeData.platformName}...`
      );

      let result;
      if (count > 1)
        result = await moveBulkAccountsToGroup(idsToMove, overData.groupId);
      else result = await moveAccountToGroup(activeId, overData.groupId);

      if (result.success) {
        toast.success(result.message, { id: toastId });
        if (isMultiDrag) exitSelectMode();
      } else {
        toast.error(result.message, { id: toastId });
      }
    }
  }

  // --- SHORTCUT KEYBOARD ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. CTRL + K (Focus Search)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("dashboard-search-input");
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      // Cek apakah user sedang mengetik (Input/Textarea)
      // PENTING: Agar tombol panah tidak ganti halaman saat user sedang menggeser kursor teks
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping) return;

      // 2. Navigasi Cepat (Arrow Left & Right) - UPDATED
      if (e.key === "ArrowLeft" && currentPage > 1)
        setCurrentPage((prev) => Math.max(1, prev - 1));

      if (e.key === "ArrowRight") {
        if (currentPage < totalPages)
          setCurrentPage((prev) => Math.min(totalPages, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages]);

  if (!mounted) return null;

  // 1. Jika sedang Refetching (Transisi Unlock), Tampilkan Skeleton
  if (isRefetching) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Render 3-4 skeleton bars untuk simulasi loading */}
        <AccountEmailSkeleton activeTab={activeTab} />
      </div>
    );
  }

  const hasData = accounts.length > 0 || groups.length > 0 || emails.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full">
          <ArchiveBoxIcon className="w-10 h-10 text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No Data Found
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mt-1">
            {query
              ? `No results for "${query}". Try another keyword.`
              : "You haven't added any accounts, emails, or groups yet."}
          </p>
        </div>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}>
      <div className="space-y-6">
        <DashboardToolbar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          filterType={filterType}
          onFilterTypeChange={handleTypeChange}
          filterGroupStatus={filterGroupStatus}
          onFilterGroupStatusChange={setFilterGroupStatus}
          filterCategories={filterCategories}
          onToggleCategory={toggleCategory}
          filterHasEmail={filterHasEmail}
          onFilterHasEmailChange={setFilterHasEmail}
          filterHasPassword={filterHasPassword}
          onFilterHasPasswordChange={setFilterHasPassword}
          sortBy={sortBy}
          onSortChange={setSortBy}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          categoriesList={ACCOUNT_CATEGORIES}
          onResetFilter={handleResetFilter}
        />

        <div className="min-h-[50vh]">
          {isTabLoading ? (
            // --- SKELETON UI ---
            <AccountEmailSkeleton activeTab={activeTab} />
          ) : (
            <>
              {activeTab === "accounts" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* SECTION GROUP */}
                  {paginatedGroups.length > 0 && (
                    <section className="space-y-3">
                      <SectionWithSelect
                        title="Groups"
                        count={rawFilteredGroups.length}
                        icon={<FolderIcon className="w-5 h-5 text-blue-500" />}
                        type="groups"
                        selectMode={selectMode}
                        selectedCount={selectedIds.size}
                        onSelectAll={() => handleSelectAllAction("groups")}
                        onDelete={handleDeleteTrigger}
                        onCancel={exitSelectMode}
                        onEnterSelect={() => enterSelectMode("groups")}
                        isExpanded={isGroupsExpanded}
                        onToggleExpand={() =>
                          setIsGroupsExpanded(!isGroupsExpanded)
                        }
                      />

                      {isGroupsExpanded && (
                        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
                          {paginatedGroups.map((group) => (
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
                      )}
                    </section>
                  )}

                  {/* SECTION AKUN */}
                  {paginatedAccounts.length > 0 && (
                    <section className="space-y-3">
                      <SectionWithSelect
                        title="Accounts"
                        count={rawFilteredAccounts.length}
                        icon={
                          <ListBulletIcon className="w-5 h-5 text-green-500" />
                        }
                        type="accounts"
                        selectMode={selectMode}
                        selectedCount={selectedIds.size}
                        canBulkEject={canBulkEject}
                        canBulkMove={canBulkMove}
                        onSelectAll={() => handleSelectAllAction("accounts")}
                        onDelete={handleDeleteTrigger}
                        onEject={handleEjectTrigger}
                        onMove={handleMoveTrigger}
                        onCancel={exitSelectMode}
                        onEnterSelect={() => enterSelectMode("accounts")}
                        isExpanded={isAccountsExpanded}
                        onToggleExpand={() =>
                          setIsAccountsExpanded(!isAccountsExpanded)
                        }
                      />

                      {isAccountsExpanded && (
                        <div className="grid grid-cols-2 lg:grid-cols-3 row-span-30 gap-4">
                          {paginatedAccounts.map((acc) => (
                            <AccountCard
                              key={acc.id}
                              id={acc.id}
                              platformName={acc.platformName}
                              username={acc.username}
                              categories={acc.categories}
                              email={acc.emailIdentity?.email}
                              website={acc.website}
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
                      )}
                    </section>
                  )}

                  {/* EMPTY STATE LOGIC UPDATE */}
                  {isDataEmpty && (
                    <div className="col-span-full animate-in fade-in zoom-in-95">
                      {(() => {
                        const isSearch = query.length > 0;
                        const isRawEmpty =
                          accounts.length === 0 && groups.length === 0;

                        // KONDISI 1: PENCARIAN (Search tapi kosong)
                        if (isSearch) {
                          return (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                              <div className="flex flex-col items-center gap-3">
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-400">
                                  <MagnifyingGlassIcon className="w-8 h-8" />
                                </div>
                                <div>
                                  <p className="text-gray-900 dark:text-white font-semibold">
                                    No items found with key &quot;{query}&quot;
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Try another word or check spell
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // KONDISI 2: DATA KOSONG (Belum ada data sama sekali)
                        if (isRawEmpty) {
                          return (
                            <div
                              onClick={() => setIsAddDataOpen(true)}
                              className="group cursor-pointer text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-all duration-300">
                              <div className="flex flex-col items-center gap-3 transition-transform duration-300">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                  <FolderIcon className="w-8 h-8" />
                                </div>
                                <div>
                                  <p className="text-gray-900 dark:text-white font-semibold">
                                    Empty Data
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Click here to add your first account
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // KONDISI 3: TERSEMBUNYI FILTER
                        return (
                          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                            <div className="flex flex-col items-center gap-3">
                              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-400">
                                <FunnelIcon className="w-8 h-8" />
                              </div>
                              <div>
                                <p className="text-gray-900 dark:text-white font-semibold">
                                  No Data Match
                                </p>
                                <button
                                  onClick={handleResetFilter}
                                  className="text-sm text-blue-600 hover:underline mt-1">
                                  Reset Filter
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "emails" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {paginatedEmails.length > 0 && (
                    <section className="space-y-3">
                      <SectionWithSelect
                        title="Emails"
                        count={emails.length}
                        icon={
                          <EnvelopeIcon className="w-5 h-5 text-purple-500" />
                        }
                        type="emails"
                        selectMode={selectMode}
                        selectedCount={selectedIds.size}
                        onSelectAll={() => handleSelectAllAction("emails")}
                        onDelete={handleDeleteTrigger}
                        onCancel={exitSelectMode}
                        onEnterSelect={() => enterSelectMode("emails")}
                        isExpanded={isEmailsExpanded}
                        onToggleExpand={() =>
                          setIsEmailsExpanded(!isEmailsExpanded)
                        }
                        // Email tidak butuh tombol Move/Eject grup
                        canBulkMove={false}
                        canBulkEject={false}
                      />

                      {/* EMAIL CONTENTS */}
                      {isEmailsExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {paginatedEmails.map((email) => (
                            <EmailCard
                              key={email.id}
                              id={email.id}
                              email={email.email}
                              name={email.name}
                              isVerified={email.isVerified}
                              linkedCount={email._count.linkedAccounts}
                              isSelectMode={selectMode === "emails"}
                              isSelected={selectedIds.has(email.id)}
                              onToggleSelect={toggleSelection}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {/* EMPTY STATE KHUSUS EMAIL */}
                  {paginatedEmails.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                      <p className="text-gray-500">No emails found.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <SelectConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          bulkActionType === "delete"
            ? `Delete ${selectedIds.size} Items?`
            : `Eject ${selectedIds.size} Accounts?`
        }
        message={
          bulkActionType === "delete"
            ? `Are you sure to delete ${selectedIds.size} selected ${
                selectMode === "accounts"
                  ? "accounts"
                  : selectMode === "groups"
                    ? "groups?"
                    : "emails?"
              }`
            : `Are you sure to eject ${selectedIds.size} accounts from their group?`
        }
        confirmText={bulkActionType === "delete" ? "Delete Permanent" : "Eject"}
        isDanger={bulkActionType === "delete"}
        isLoading={isProcessing}
      />

      <SelectGroupModal
        isOpen={isGroupSelectModalOpen}
        onClose={() => setIsGroupSelectModalOpen(false)}
        groups={groups}
        onSelectGroup={handleBulkMoveToGroup}
        isLoading={isProcessing}
      />

      {/* RENDER ADD DATA MODAL (Controlled State) */}
      <AddDataModal
        existingEmails={emails}
        existingGroups={groups}
        isOpen={isAddDataOpen}
        onClose={() => setIsAddDataOpen(false)}
      />
    </DndContext>
  );
}
