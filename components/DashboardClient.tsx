// components/DashboardClient.tsx
"use client";

import {
  useState,
  useMemo,
  useEffect,
  useTransition,
  useCallback,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  FolderIcon,
  ListBulletIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
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
import SelectConfirmationModal from "./modals/SelectConfirmationModal";
import AccountEmailSkeleton from "./dashboard/AccountEmailSkeleton";

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
  getAllAccountIds,
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

type DashboardProps = {
  accounts: AccountWithRelations[];
  groups: GroupWithCount[];
  emails: EmailWithRelations[];
  query: string;
  serverTotalPages: number;
  serverCurrentPage: number;
  serverTotalCount?: number;
};

// --- KOMPONEN EMPTY STATE BARU ---
interface EmptyStateProps {
  type: "no-data" | "search" | "filter";
  message: string;
  subMessage: string;
  onAction: () => void;
  actionLabel?: string;
}

const EmptyState = ({
  type,
  message,
  subMessage,
  onAction,
  actionLabel,
}: EmptyStateProps) => {
  if (type === "no-data") {
    return (
      <div
        onClick={onAction}
        className="mt-8 cursor-pointer group border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/40 transition-all">
          <PlusIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {message}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
          {subMessage}
        </p>
      </div>
    );
  }

  // Layout untuk Search / Filter Empty
  return (
    <div className="py-20 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
        {type === "search" ? (
          <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
        ) : (
          <FunnelIcon className="w-8 h-8 text-gray-400" />
        )}
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
        {message}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto text-sm">
        {subMessage}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default function DashboardClient({
  accounts,
  groups,
  emails,
  query,
  serverTotalPages,
  serverCurrentPage,
  serverTotalCount = 0,
}: DashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isRefetching } = useLock();

  // State
  const [itemsPerPageGroups, setItemsPerPageGroups] = useState(8);
  const ITEMS_PER_PAGE_EMAILS = 10;

  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [openMenu, setOpenMenu] = useState<"filter" | "sort" | null>(null);
  const [selectMode, setSelectMode] = useState<
    "none" | "accounts" | "groups" | "emails"
  >("none");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isGroupsExpanded, setIsGroupsExpanded] = useState(true);
  const [isAccountsExpanded, setIsAccountsExpanded] = useState(true);
  const [isEmailsExpanded, setIsEmailsExpanded] = useState(true);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"delete" | "eject">(
    "delete",
  );
  const [isGroupSelectModalOpen, setIsGroupSelectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddDataOpen, setIsAddDataOpen] = useState(false);

  // URL Params
  const activeTab = searchParams.get("tab") || "accounts";
  const filterType = (searchParams.get("filterType") as FilterType) || "all";
  const filterGroupStatus =
    (searchParams.get("groupStatus") as GroupStatusOption) || "all";
  const filterHasEmail =
    (searchParams.get("hasEmail") as FilterOption) || "all";
  const filterHasPassword =
    (searchParams.get("hasPassword") as FilterOption) || "all";
  const sortBy = (searchParams.get("sort") as SortOption) || "newest";
  const filterCategories = searchParams.getAll("category");

  // Logic Deteksi Kondisi Filter/Search
  const isSearching = query.trim().length > 0;
  const isFiltering =
    filterType !== "all" ||
    filterGroupStatus !== "all" ||
    filterHasEmail !== "all" ||
    filterHasPassword !== "all" ||
    filterCategories.length > 0;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPageGroups(6);
      else setItemsPerPageGroups(8);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset Seleksi saat Search/Filter berubah
  useEffect(() => {
    if (query && selectMode !== "none") {
      setSelectMode("none");
      setSelectedIds(new Set());
    }
  }, [query, selectMode]);

  const handleUpdateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const isFilterUpdate = Object.keys(updates).some(
        (key) => key !== "page" && key !== "tab",
      );

      if (isFilterUpdate) {
        setSelectMode("none");
        setSelectedIds(new Set());
      }

      // searchParams diambil langsung dari closure terupdate karena ada di dependency array
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === "all" ||
          value === ""
        ) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.delete(key);
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      });

      if (!updates.page && !updates.tab) params.set("page", "1");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router],
  );

  const handleClearSearch = () => {
    handleUpdateParams({ q: null }); // Asumsi SearchInput membaca URL param 'q' atau kita push null
    // Karena SearchInput biasanya uncontrolled atau controlled via URL,
    // cara paling aman adalah replace URL tanpa query 'q'.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleResetFilter = () => {
    handleUpdateParams({
      filterType: "all",
      groupStatus: "all",
      category: [],
      hasEmail: "all",
      hasPassword: "all",
    });
    setOpenMenu(null);
  };

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    setSelectMode("none");
    setSelectedIds(new Set());
    handleUpdateParams({ tab, page: "1" });
  };

  const {
    paginatedGroups,
    paginatedEmails,
    totalPagesCombined,
    filteredGroups,
    filteredEmails,
  } = useMemo(() => {
    let resGroups = [...groups];
    if (resGroups.length > 0) {
      resGroups.sort((a, b) => {
        if (sortBy === "newest")
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        if (sortBy === "oldest")
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        if (sortBy === "az") return a.name.localeCompare(b.name);
        if (sortBy === "za") return b.name.localeCompare(a.name);
        return 0;
      });
    }
    if (filterType === "account") resGroups = [];

    const resEmails = [...emails];

    const currentPage = serverCurrentPage;
    let computedTotalPages = 1;
    let slicedGroups: GroupWithCount[] = [];
    let slicedEmails: EmailWithRelations[] = [];

    if (activeTab === "accounts") {
      const totalGroupPages = Math.ceil(resGroups.length / itemsPerPageGroups);
      computedTotalPages = Math.max(serverTotalPages, totalGroupPages, 1);
      const grpStart = (currentPage - 1) * itemsPerPageGroups;
      slicedGroups = resGroups.slice(grpStart, grpStart + itemsPerPageGroups);
    } else {
      computedTotalPages =
        Math.ceil(resEmails.length / ITEMS_PER_PAGE_EMAILS) || 1;
      const emailStart = (currentPage - 1) * ITEMS_PER_PAGE_EMAILS;
      slicedEmails = resEmails.slice(
        emailStart,
        emailStart + ITEMS_PER_PAGE_EMAILS,
      );
    }

    return {
      paginatedGroups: slicedGroups,
      paginatedEmails: slicedEmails,
      totalPagesCombined: computedTotalPages,
      filteredGroups: resGroups,
      filteredEmails: resEmails,
    };
  }, [
    groups,
    emails,
    activeTab,
    serverCurrentPage,
    serverTotalPages,
    filterType,
    sortBy,
    itemsPerPageGroups,
  ]);

  // Shortcut & Navigasi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("dashboard-search-input")?.focus();
        return;
      }

      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      // Logic navigasi
      if (e.key === "ArrowLeft" && serverCurrentPage > 1) {
        handleUpdateParams({ page: String(serverCurrentPage - 1) });
      }
      if (e.key === "ArrowRight" && serverCurrentPage < totalPagesCombined) {
        handleUpdateParams({ page: String(serverCurrentPage + 1) });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [serverCurrentPage, totalPagesCombined, handleUpdateParams]);

  const handleSelectAllAction = async (
    type: "accounts" | "groups" | "emails",
  ) => {
    let targetIds: string[] = [];
    if (type === "accounts") {
      const isAllSelected =
        selectedIds.size === serverTotalCount && serverTotalCount > 0;
      if (isAllSelected) {
        setSelectedIds(new Set());
        return;
      } else {
        const toastId = toast.loading("Selecting all accounts...");
        try {
          const ids = await getAllAccountIds({
            query,
            filterType,
            groupStatus: filterGroupStatus,
            categories: filterCategories,
            hasEmail: filterHasEmail,
            hasPassword: filterHasPassword,
          });
          setSelectedIds(new Set(ids));
          toast.success(`Selected ${ids.length} accounts`, { id: toastId });
        } catch (e) {
          toast.error("Failed to select all", { id: toastId });
        }
        return;
      }
    } else if (type === "groups") targetIds = filteredGroups.map((g) => g.id);
    else if (type === "emails") targetIds = filteredEmails.map((e) => e.id);

    if (targetIds.length === 0) return;
    const allSelected = targetIds.every((id) => selectedIds.has(id));

    if (allSelected) {
      const newSet = new Set(selectedIds);
      targetIds.forEach((id) => newSet.delete(id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      targetIds.forEach((id) => newSet.add(id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const enterSelectMode = (type: "accounts" | "groups" | "emails") => {
    setSelectMode(type);
    setSelectedIds(new Set());
  };

  const exitSelectMode = () => {
    setSelectMode("none");
    setSelectedIds(new Set());
  };

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

  const handleDeleteTrigger = () => {
    if (selectedIds.size === 0)
      return toast.error("Please select at least 1 item");
    setBulkActionType("delete");
    setIsConfirmModalOpen(true);
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

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
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

      const toastId = toast.loading(`Moving...`);
      let result;
      if (idsToMove.length > 1)
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

  const modalConfig = useMemo(() => {
    const count = selectedIds.size;
    const suffix = count > 1 ? "s" : "";
    if (bulkActionType === "eject") {
      return {
        title: `Eject ${count} Account${suffix}?`,
        message: `Are you sure you want to remove ${count} account${suffix} from their current group? They will be moved to 'Outside Group'.`,
        confirmText: "Eject",
        isDanger: false,
      };
    }
    if (bulkActionType === "delete") {
      switch (selectMode) {
        case "accounts":
          return {
            title: `Delete ${count} Account${suffix}?`,
            message: `This action will permanently delete ${count} selected account${suffix}. This action cannot be undone.`,
            confirmText: `Delete ${count} Account${suffix}`,
            isDanger: true,
          };
        case "groups":
          return {
            title: `Delete ${count} Group${suffix}?`,
            message: `WARNING: Deleting groups will also DELETE ALL ACCOUNTS inside them. Are you sure you want to delete ${count} group${suffix}?`,
            confirmText: `Delete Group${suffix}`,
            isDanger: true,
          };
        case "emails":
          return {
            title: `Delete ${count} Email Identity${suffix}?`,
            message: `Are you sure you want to delete ${count} email${suffix}? Accounts linked to these emails will NOT be deleted, but they will become unlinked.`,
            confirmText: `Delete Email${suffix}`,
            isDanger: true,
          };
        default:
          return {
            title: "Confirm",
            message: "Sure?",
            confirmText: "Yes",
            isDanger: true,
          };
      }
    }
    return {
      title: "Confirm",
      message: "Sure?",
      confirmText: "Yes",
      isDanger: false,
    };
  }, [bulkActionType, selectMode, selectedIds.size]);

  if (!mounted) return null;
  if (isRefetching || isPending)
    return (
      <div className="space-y-6 animate-pulse">
        <AccountEmailSkeleton activeTab={activeTab} />
      </div>
    );

  // --- LOGIC PENENTUAN EMPTY STATE ---
  const isDataEmpty =
    (activeTab === "accounts" &&
      accounts.length === 0 &&
      paginatedGroups.length === 0) ||
    (activeTab === "emails" && paginatedEmails.length === 0);

  let emptyType: "no-data" | "search" | "filter" = "no-data";
  if (isDataEmpty) {
    if (isSearching) emptyType = "search";
    else if (isFiltering && activeTab === "accounts") emptyType = "filter";
  }

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
          filterGroupStatus={filterGroupStatus}
          filterCategories={filterCategories}
          filterHasEmail={filterHasEmail}
          filterHasPassword={filterHasPassword}
          sortBy={sortBy}
          onApplyFilter={(updates) => handleUpdateParams(updates)}
          onSortChange={(val) => handleUpdateParams({ sort: val })}
          onResetFilter={handleResetFilter}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          categoriesList={ACCOUNT_CATEGORIES}
        />

        <div className="min-h-[50vh]">
          {activeTab === "accounts" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {paginatedGroups.length > 0 && (
                <section className="space-y-3">
                  <SectionWithSelect
                    title="Groups"
                    count={groups.length}
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
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
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

              {accounts.length > 0 && (
                <section className="space-y-3">
                  <SectionWithSelect
                    title="Accounts"
                    count={serverTotalCount || accounts.length}
                    icon={<ListBulletIcon className="w-5 h-5 text-green-500" />}
                    type="accounts"
                    selectMode={selectMode}
                    selectedCount={selectedIds.size}
                    canBulkEject={canBulkEject}
                    canBulkMove={canBulkMove}
                    onSelectAll={() => handleSelectAllAction("accounts")}
                    onDelete={handleDeleteTrigger}
                    onEject={() => {
                      setBulkActionType("eject");
                      setIsConfirmModalOpen(true);
                    }}
                    onMove={() => setIsGroupSelectModalOpen(true)}
                    onCancel={exitSelectMode}
                    onEnterSelect={() => enterSelectMode("accounts")}
                    isExpanded={isAccountsExpanded}
                    onToggleExpand={() =>
                      setIsAccountsExpanded(!isAccountsExpanded)
                    }
                  />
                  {isAccountsExpanded && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 row-span-30 gap-4">
                      {accounts.map((acc) => (
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

              {/* EMPTY STATE BARU */}
              {isDataEmpty && (
                <>
                  {emptyType === "no-data" && (
                    <EmptyState
                      type="no-data"
                      message="You haven't added any accounts yet"
                      subMessage="It looks like your vault is empty. Click anywhere in this area to add your first account or group."
                      onAction={() => setIsAddDataOpen(true)}
                    />
                  )}
                  {emptyType === "search" && (
                    <EmptyState
                      type="search"
                      message={`No results for "${query}"`}
                      subMessage="We couldn't find any accounts or groups matching your search."
                      onAction={handleClearSearch}
                      actionLabel="Clear Search"
                    />
                  )}
                  {emptyType === "filter" && (
                    <EmptyState
                      type="filter"
                      message="No matches found"
                      subMessage="Try adjusting your filters to see more results."
                      onAction={handleResetFilter}
                      actionLabel="Reset Filters"
                    />
                  )}
                </>
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
                    icon={<EnvelopeIcon className="w-5 h-5 text-purple-500" />}
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
                  />
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
              {/* EMPTY STATE EMAIL */}
              {isDataEmpty && (
                <EmptyState
                  type={isSearching ? "search" : "no-data"}
                  message={
                    isSearching
                      ? `No emails found for "${query}"`
                      : "No email identities"
                  }
                  subMessage={
                    isSearching
                      ? "Try a different search term"
                      : "Add an email identity to link your accounts."
                  }
                  onAction={
                    isSearching
                      ? handleClearSearch
                      : () => setIsAddDataOpen(true)
                  }
                  actionLabel={isSearching ? "Clear Search" : undefined}
                />
              )}
            </div>
          )}
        </div>

        <PaginationControl
          currentPage={serverCurrentPage}
          totalPages={totalPagesCombined}
          onPageChange={(page) => handleUpdateParams({ page: String(page) })}
        />
      </div>

      <SelectConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        isDanger={modalConfig.isDanger}
        isLoading={isProcessing}
      />
      <SelectGroupModal
        isOpen={isGroupSelectModalOpen}
        onClose={() => setIsGroupSelectModalOpen(false)}
        groups={groups}
        onSelectGroup={handleBulkMoveToGroup}
        isLoading={isProcessing}
      />
      <AddDataModal
        existingEmails={emails}
        existingGroups={groups}
        isOpen={isAddDataOpen}
        onClose={() => setIsAddDataOpen(false)}
      />
    </DndContext>
  );
}
