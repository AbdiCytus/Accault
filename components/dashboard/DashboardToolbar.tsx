// components/dashboard/DashboardToolbar.tsx
import { useState, useEffect } from "react";
import {
  FunnelIcon,
  ArrowsUpDownIcon,
  CheckIcon,
  EnvelopeIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import {
  FilterType,
  FilterOption,
  SortOption,
  GroupStatusOption,
} from "@/types/dashboard";
import Tooltip from "../ui/Tooltip";

interface DashboardToolbarProps {
  activeTab: string;
  onTabChange: (tab: "accounts" | "emails") => void;

  // Values dari URL (Props)
  filterType: FilterType;
  filterGroupStatus: GroupStatusOption;
  filterCategories: string[];
  filterHasEmail: FilterOption;
  filterHasPassword: FilterOption;
  sortBy: SortOption;

  // Actions
  onApplyFilter: (updates: Record<string, any>) => void; // <--- Callback Baru (Batch Update)
  onSortChange: (sort: SortOption) => void; // Sort biarkan langsung (opsional, tapi biasanya sort langsung apply)
  onResetFilter?: () => void;

  // UI States
  openMenu: "filter" | "sort" | null;
  setOpenMenu: (menu: "filter" | "sort" | null) => void;
  categoriesList: string[];
}

interface DropdownItemProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const SectionHeader = ({ title }: { title: string }) => (
  <div className="px-4 py-1.5 mt-2 mb-1 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
    {title}
  </div>
);

const DropdownItem = ({ label, active, onClick }: DropdownItemProps) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center transition-colors ${
      active
        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
    }`}>
    <span>{label}</span>
    {active && <CheckIcon className="w-4 h-4" />}
  </button>
);

export default function DashboardToolbar(props: DashboardToolbarProps) {
  const {
    activeTab,
    onTabChange,
    filterType,
    filterGroupStatus,
    filterCategories,
    filterHasEmail,
    filterHasPassword,
    sortBy,
    onApplyFilter,
    onSortChange,
    // onResetFilter,
    openMenu,
    setOpenMenu,
    categoriesList,
  } = props;

  // --- LOCAL STATE (Untuk menampung pilihan user sebelum Apply) ---
  const [localType, setLocalType] = useState(filterType);
  const [localGroupStatus, setLocalGroupStatus] = useState(filterGroupStatus);
  const [localCategories, setLocalCategories] = useState(filterCategories);
  const [localHasEmail, setLocalHasEmail] = useState(filterHasEmail);
  const [localHasPassword, setLocalHasPassword] = useState(filterHasPassword);

  // Sync Local State saat Props berubah (misal user reset via URL atau tombol reset)
  useEffect(() => {
    if (openMenu === "filter") {
      setLocalType(filterType);
      setLocalGroupStatus(filterGroupStatus);
      setLocalCategories(filterCategories);
      setLocalHasEmail(filterHasEmail);
      setLocalHasPassword(filterHasPassword);
    }
  }, [
    openMenu,
    filterType,
    filterGroupStatus,
    filterCategories,
    filterHasEmail,
    filterHasPassword,
  ]);

  // Handler Lokal (Tidak update URL, cuma update state lokal)
  const toggleLocalCategory = (cat: string) => {
    setLocalCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  // Handler Tombol Apply
  const handleApplyClick = () => {
    onApplyFilter({
      filterType: localType,
      groupStatus: localGroupStatus,
      category: localCategories,
      hasEmail: localHasEmail,
      hasPassword: localHasPassword,
    });
    setOpenMenu(null); // Tutup menu setelah apply
  };

  // Handler Reset Lokal & Global
  const handleResetClick = () => {
    setLocalType("all");
    setLocalGroupStatus("all");
    setLocalCategories([]);
    setLocalHasEmail("all");
    setLocalHasPassword("all");

    onApplyFilter({
      filterType: "all",
      groupStatus: "all",
      category: [],
      hasEmail: "all",
      hasPassword: "all",
    });

    setOpenMenu(null);
  };

  // Hitung jumlah filter aktif untuk badge
  const activeCount =
    filterCategories.length +
    (filterType !== "all" ? 1 : 0) +
    (filterGroupStatus !== "all" ? 1 : 0) +
    (filterHasEmail !== "all" ? 1 : 0) +
    (filterHasPassword !== "all" ? 1 : 0);

  return (
    <div className="flex justify-between items-start sm:items-center gap-4 sticky top-4 z-30 transition-colors">
      {/* LEFT: Filters & Sort */}
      <div className="flex gap-2 w-full sm:w-auto relative">
        {activeTab === "accounts" && (
          <>
            {/* FILTER BUTTON */}
            <div className="relative">
              <button
                onClick={() =>
                  setOpenMenu(openMenu === "filter" ? null : "filter")
                }
                className={`flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-lg text-sm font-medium border transition-colors ${
                  activeCount > 0
                    ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:dark:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                }`}>
                <FunnelIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
                {activeCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full">
                    {activeCount}
                  </span>
                )}
              </button>

              {/* FILTER DROPDOWN */}
              {openMenu === "filter" && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setOpenMenu(null)}></div>
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden py-2 max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-150 flex flex-col">
                    {/* SCROLLABLE CONTENT */}
                    <div className="flex-1 overflow-y-auto pb-2">
                      <SectionHeader title="Type" />
                      <div className="flex bg-gray-100 dark:bg-gray-700 p-1 mx-4 rounded-lg mb-2">
                        {/* GUNAKAN localType DI SINI */}
                        {(["all", "account", "group"] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setLocalType(type)}
                            className={`flex-1 text-xs py-1.5 rounded-md font-medium capitalize transition-all ${
                              localType === type
                                ? "bg-white dark:bg-blue-800/50 dark:text-blue-400 text-blue-600 shadow-sm"
                                : "text-gray-500 dark:hover:text-gray-200"
                            }`}>
                            {type === "all" ? "Default" : type}
                          </button>
                        ))}
                      </div>

                      {localType === "account" && (
                        <>
                          <SectionHeader title="Account Location" />
                          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 mx-4 rounded-lg mb-2">
                            {(["all", "outside", "inside"] as const).map(
                              (status) => (
                                <button
                                  key={status}
                                  onClick={() => setLocalGroupStatus(status)}
                                  className={`flex-1 text-xs py-1.5 rounded-md font-medium capitalize transition-all ${
                                    localGroupStatus === status
                                      ? "bg-white dark:bg-blue-800/50 dark:text-blue-400 text-blue-600 shadow-sm"
                                      : "text-gray-500 dark:hover:text-gray-200"
                                  }`}>
                                  {status}
                                </button>
                              ),
                            )}
                          </div>
                        </>
                      )}

                      {localType !== "group" && (
                        <>
                          <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                          <SectionHeader title="Categories" />
                          <div className="px-4 flex flex-wrap gap-2 mb-2">
                            {categoriesList.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => toggleLocalCategory(cat)}
                                className={`px-3 py-1 rounded-full text-xs border transition-all select-none ${
                                  localCategories.includes(cat)
                                    ? "bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300 font-medium"
                                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                                }`}>
                                {cat}
                              </button>
                            ))}
                          </div>

                          <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                          <SectionHeader title="Properties" />
                          <div className="px-4 py-2 space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1.5">
                                Email Connected
                              </p>
                              <div className="flex gap-2">
                                {(
                                  [
                                    ["all", "All"],
                                    ["yes", "Yes"],
                                    ["no", "No"],
                                  ] as const
                                ).map(([val, label]) => (
                                  <button
                                    key={val}
                                    onClick={() =>
                                      setLocalHasEmail(val as FilterOption)
                                    }
                                    className={`px-3 py-1 rounded text-xs border ${
                                      localHasEmail === val
                                        ? "bg-blue-50 border-blue-200 text-blue-600 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-800"
                                        : "dark:text-gray-300 dark:hover:bg-gray-900 border-gray-200 dark:border-gray-600"
                                    }`}>
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1.5">
                                Has Password
                              </p>
                              <div className="flex gap-2">
                                {(
                                  [
                                    ["all", "All"],
                                    ["yes", "Yes"],
                                    ["no", "No"],
                                  ] as const
                                ).map(([val, label]) => (
                                  <button
                                    key={val}
                                    onClick={() =>
                                      setLocalHasPassword(val as FilterOption)
                                    }
                                    className={`px-3 py-1 rounded text-xs border ${
                                      localHasPassword === val
                                        ? "bg-blue-50 border-blue-200 text-blue-600 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-800"
                                        : "border-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900"
                                    }`}>
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* FOOTER ACTIONS (APPLY & RESET) */}
                    <div className="border-t border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50 flex gap-2">
                      <button
                        onClick={handleResetClick}
                        className="flex-1 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-white not-dark:shadow-sm dark:border border-gray-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 dark:border-red-800 dark:bg-red-900/20 transition-colors">
                        Reset Filter
                      </button>
                      <button
                        onClick={handleApplyClick}
                        className="flex-1 py-2 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-950/40 border-blue-200 text-blue-600 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-800 not-dark:shadow-sm dark:border rounded-lg transition-colors">
                        Apply Filter
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* SORT BUTTON (Biarkan direct update untuk Sort) */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === "sort" ? null : "sort")}
                className={`flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-lg text-sm font-medium border transition-colors ${
                  sortBy !== "newest"
                    ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:dark:bg-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                }`}>
                <ArrowsUpDownIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Sort</span>
              </button>
              {/* ... Dropdown Sort (Sama seperti kode lama, tidak diubah) ... */}
              {openMenu === "sort" && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setOpenMenu(null)}></div>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden py-1 animate-in zoom-in-95 duration-150">
                    <SectionHeader title="Time Added" />
                    <DropdownItem
                      label="Newest"
                      active={sortBy === "newest"}
                      onClick={() => {
                        onSortChange("newest");
                        setOpenMenu(null);
                      }}
                    />
                    <DropdownItem
                      label="Oldest"
                      active={sortBy === "oldest"}
                      onClick={() => {
                        onSortChange("oldest");
                        setOpenMenu(null);
                      }}
                    />
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <SectionHeader
                      title={
                        filterType === "group" ? "Group Name" : "Platform Name"
                      }
                    />
                    <DropdownItem
                      label="Asc (A-Z)"
                      active={sortBy === "az"}
                      onClick={() => {
                        onSortChange("az");
                        setOpenMenu(null);
                      }}
                    />
                    <DropdownItem
                      label="Desc (Z-A)"
                      active={sortBy === "za"}
                      onClick={() => {
                        onSortChange("za");
                        setOpenMenu(null);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
        {/* ... Tombol disabled untuk Tab Email (Sama seperti kode lama) ... */}
        {activeTab == "emails" && (
          <>
            <Tooltip text="Filter is not available to emails" position="top">
              <button className="opacity-25 flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-lg text-sm font-medium border transition-colors bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <FunnelIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </Tooltip>
            <Tooltip text="Sort is not available to emails" position="top">
              <button className="opacity-25 flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-lg text-sm font-medium border transition-colors bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <ArrowsUpDownIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Sort</span>
              </button>
            </Tooltip>
          </>
        )}
      </div>
      {/* RIGHT: Tab Switcher (Sama seperti kode lama) */}
      <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg w-full sm:w-auto">
        <button
          onClick={() => onTabChange("accounts")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 sm:px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
            activeTab === "accounts"
              ? "bg-white dark:bg-blue-800/50 text-blue-600 dark:text-blue-200 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}>
          <UserIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Account</span>
        </button>
        <button
          onClick={() => onTabChange("emails")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 sm:px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
            activeTab === "emails"
              ? "bg-white dark:bg-violet-800/50 text-purple-600 dark:text-violet-200 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}>
          <EnvelopeIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Email</span>
        </button>
      </div>
    </div>
  );
}
