// components/dashboard/DashboardToolbar.tsx
import {
  FunnelIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
  UserIcon,
  EnvelopeIcon,
  CheckIcon,
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

  // Filter States
  filterType: FilterType;
  onFilterTypeChange: (type: FilterType) => void;

  filterGroupStatus: GroupStatusOption;
  onFilterGroupStatusChange: (status: GroupStatusOption) => void;

  filterCategories: string[];
  onToggleCategory: (cat: string) => void;

  filterHasEmail: FilterOption;
  onFilterHasEmailChange: (opt: FilterOption) => void;

  filterHasPassword: FilterOption;
  onFilterHasPasswordChange: (opt: FilterOption) => void;

  // Sort States
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;

  // UI States
  openMenu: "filter" | "sort" | null;
  setOpenMenu: (menu: "filter" | "sort" | null) => void;

  categoriesList: string[];
  onResetFilter: () => void;
}

interface DropdownItemProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

// Sub-components untuk internal toolbar
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
    onFilterTypeChange,
    filterGroupStatus,
    onFilterGroupStatusChange,
    filterCategories,
    onToggleCategory,
    filterHasEmail,
    onFilterHasEmailChange,
    filterHasPassword,
    onFilterHasPasswordChange,
    sortBy,
    onSortChange,
    openMenu,
    setOpenMenu,
    categoriesList,
    onResetFilter,
  } = props;

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
                  filterType !== "all" ||
                  filterCategories.length > 0 ||
                  filterHasEmail !== "all" ||
                  filterHasPassword !== "all" ||
                  filterGroupStatus !== "all"
                    ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:dark:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                }`}>
                <FunnelIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
                {filterCategories.length > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full">
                    {filterCategories.length}
                  </span>
                )}
              </button>

              {/* FILTER DROPDOWN */}
              {openMenu === "filter" && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setOpenMenu(null)}></div>
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden py-2 max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-150">
                    <SectionHeader title="Type" />
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 mx-4 rounded-lg mb-2">
                      <button
                        onClick={() => onFilterTypeChange("all")}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                          filterType === "all"
                            ? "bg-white dark:bg-blue-800/50 dark:text-blue-400 text-blue-600 shadow-sm"
                            : "text-gray-500 dark:hover:text-gray-200"
                        }`}>
                        Default
                      </button>
                      <button
                        onClick={() => onFilterTypeChange("account")}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                          filterType === "account"
                            ? "bg-white text-blue-600 dark:bg-blue-800/50 dark:text-blue-400 shadow-sm"
                            : "text-gray-500 dark:hover:text-gray-200"
                        }`}>
                        Account
                      </button>
                      <button
                        onClick={() => onFilterTypeChange("group")}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                          filterType === "group"
                            ? "bg-white text-blue-600 dark:bg-blue-800/50 dark:text-blue-400 shadow-sm"
                            : "text-gray-500 dark:hover:text-gray-200"
                        }`}>
                        Group
                      </button>
                    </div>

                    {filterType === "account" && (
                      <>
                        <SectionHeader title="Account Location (Group)" />
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 mx-4 rounded-lg mb-2">
                          <button
                            onClick={() => onFilterGroupStatusChange("all")}
                            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                              filterGroupStatus === "all"
                                ? "bg-white dark:bg-blue-800/50 dark:text-blue-400 text-blue-600 shadow-sm"
                                : "text-gray-500 dark:hover:text-gray-200"
                            }`}>
                            All
                          </button>
                          <button
                            onClick={() => onFilterGroupStatusChange("outside")}
                            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                              filterGroupStatus === "outside"
                                ? "bg-white dark:bg-blue-800/50 dark:text-blue-400 text-blue-600 shadow-sm"
                                : "text-gray-500 dark:hover:text-gray-200"
                            }`}>
                            Outside
                          </button>
                          <button
                            onClick={() => onFilterGroupStatusChange("inside")}
                            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                              filterGroupStatus === "inside"
                                ? "bg-white dark:bg-blue-800/50 dark:text-blue-400 text-blue-600 shadow-sm"
                                : "text-gray-500 dark:hover:text-gray-200"
                            }`}>
                            Inside
                          </button>
                        </div>
                      </>
                    )}

                    {filterType !== "group" && (
                      <>
                        <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                        <SectionHeader title="Categories" />
                        <div className="px-4 flex flex-wrap gap-2 mb-2">
                          {categoriesList.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => onToggleCategory(cat)}
                              className={`px-3 py-1 rounded-full text-xs border transition-all select-none ${
                                filterCategories.includes(cat)
                                  ? "bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300 font-medium"
                                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                              }`}>
                              {cat}
                            </button>
                          ))}
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                        <SectionHeader title="other" />
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
                                    onFilterHasEmailChange(val as FilterOption)
                                  }
                                  className={`px-3 py-1 rounded text-xs border ${
                                    filterHasEmail === val
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
                                    onFilterHasPasswordChange(
                                      val as FilterOption
                                    )
                                  }
                                  className={`px-3 py-1 rounded text-xs border ${
                                    filterHasPassword === val
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

                    <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2 px-4 pb-2">
                      <button
                        onClick={onResetFilter}
                        className="w-full py-2 text-xs text-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        Reset Filter
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* SORT BUTTON */}
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
                      onClick={() => onSortChange("newest")}
                    />
                    <DropdownItem
                      label="Oldest"
                      active={sortBy === "oldest"}
                      onClick={() => onSortChange("oldest")}
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
                      onClick={() => onSortChange("az")}
                    />
                    <DropdownItem
                      label="Desc (Z-A)"
                      active={sortBy === "za"}
                      onClick={() => onSortChange("za")}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}

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

      {/* RIGHT: Tab Switcher */}
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
