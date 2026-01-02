// components/AddDataModal.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { addGroup } from "@/actions/group";
import { addEmail } from "@/actions/email";
import { addAccount } from "@/actions/account";
import toast from "react-hot-toast";
import Image from "next/image";
import Portal from "../Portal";

interface Props {
  existingEmails: { id: string; email: string }[];
  existingGroups: { id: string; name: string }[];
  // Props baru untuk Kontrol Eksternal
  isOpen?: boolean;
  onClose?: () => void;
}

type TabOption = "email" | "account" | "group";

export default function AddDataModal({
  existingEmails,
  existingGroups,
  isOpen: externalIsOpen, // Rename agar tidak bentrok
  onClose: externalOnClose,
}: Props) {
  const router = useRouter();

  // State Internal (hanya dipakai jika tidak ada kontrol eksternal)
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<TabOption>("account");
  const [isLoading, setIsLoading] = useState(false);

  // --- LOGIKA HYBRID (CONTROLLED VS UNCONTROLLED) ---
  const isControlled = externalIsOpen !== undefined;

  // Gunakan prop eksternal jika ada, jika tidak gunakan state internal
  const showModal = isControlled ? externalIsOpen : internalIsOpen;

  // Fungsi penutup modal yang fleksibel
  const handleClose = () => {
    if (isControlled && externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
    // Reset form saat modal tertutup (opsional, tapi UX bagus)
    if (showModal) {
      setTimeout(resetFormState, 300); // Delay sedikit agar animasi tutup selesai
    }
  };

  const handleOpen = () => setInternalIsOpen(true);

  // --- STATE KHUSUS FORM ---
  const [is2FA, setIs2FA] = useState(false);
  const [noEmail, setNoEmail] = useState(false);
  const [noPassword, setNoPassword] = useState(false);

  // State Gambar (Base64)
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Searchable Dropdown
  const [emailSearch, setEmailSearch] = useState("");
  const [selectedEmailId, setSelectedEmailId] = useState("");
  const [isEmailDropdownOpen, setIsEmailDropdownOpen] = useState(false);

  const [groupSearch, setGroupSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  const CATEGORIES = ["Social", "Game", "Work", "Finance", "Other"];

  // --- HANDLER GAMBAR ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("Max Image Size is 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setIconPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveIcon = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIconPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- HANDLER SUBMIT ---
  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    if (iconPreview) formData.append("icon", iconPreview);
    if (selectedEmailId) formData.set("emailId", selectedEmailId);
    else if (activeTab === "email" && selectedEmailId)
      formData.set("recoveryEmailId", selectedEmailId);

    // Simulasi delay UX
    await new Promise((resolve) => setTimeout(resolve, 800));
    let result;

    try {
      if (activeTab === "group") result = await addGroup(formData);
      else if (activeTab === "email") result = await addEmail(formData);
      else result = await addAccount(formData);

      if (result.success) {
        toast.success(result.message);
        handleClose(); // Gunakan handleClose
        setIsLoading(false);
        router.refresh();
      } else {
        toast.error(result.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("System Error!");
      setIsLoading(false);
    }
  }

  function resetFormState() {
    setIs2FA(false);
    setNoEmail(false);
    setNoPassword(false);
    setIconPreview(null);
    setEmailSearch("");
    setSelectedEmailId("");
    setActiveTab("account");
  }

  const getModalWidth = () => {
    if (activeTab === "account") return "max-w-4xl";
    if (activeTab === "email" && is2FA) return "max-w-4xl";
    return "max-w-lg";
  };

  return (
    <>
      {/* TRIGGER BUTTON (Hanya muncul jika mode Uncontrolled) */}
      {!isControlled && (
        <button
          onClick={handleOpen}
          className="w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full sm:rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
          title="Tambah Data">
          <PlusIcon className="w-6 h-6" />
        </button>
      )}

      {/* MODAL */}
      {showModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-70 p-4 backdrop-blur-sm">
            <div
              className={`bg-white dark:bg-gray-800 rounded-xl w-full ${getModalWidth()} mx-auto shadow-2xl overflow-hidden flex flex-col max-h-[95vh] transition-all duration-300 ease-in-out animate-in zoom-in-95`}>
              {/* Header */}
              <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0">
                <div className="flex justify-between items-center px-6 py-4">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                    Add New Data
                  </h3>
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex px-6 gap-6">
                  <TabButton
                    label="Account"
                    isActive={activeTab === "account"}
                    onClick={() => setActiveTab("account")}
                  />
                  <TabButton
                    label="Email"
                    isActive={activeTab === "email"}
                    onClick={() => setActiveTab("email")}
                  />
                  <TabButton
                    label="Group"
                    isActive={activeTab === "group"}
                    onClick={() => setActiveTab("group")}
                  />
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto">
                {/* --- CONTENT TAB GROUP --- */}
                {activeTab === "group" && (
                  <div className="space-y-4">
                    <InputLabel
                      label="Group Name"
                      name="name"
                      placeholder="ex: Metaverse"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-sky-300 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-sky-900">
                      <InformationCircleIcon className="w-4" /> Only account can
                      be moved inside group
                    </p>
                  </div>
                )}

                {/* --- CONTENT TAB EMAIL --- */}
                {activeTab === "email" && (
                  <div
                    className={
                      is2FA
                        ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                        : "space-y-4"
                    }>
                    <div className="space-y-4 p-4 shadow-md dark:shadow-gray-900 rounded-lg mb-2">
                      <InputLabel
                        label="Username"
                        placeholder="Bob"
                        name="name"
                      />
                      <InputLabel
                        label="Email Address"
                        placeholder="example@gmail.com"
                        name="email"
                        type="email"
                        required
                      />
                      <InputLabel
                        label="Password"
                        name="password"
                        placeholder=""
                        type="password"
                        required
                      />
                      <div
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                          is2FA
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                        }`}>
                        <input
                          type="checkbox"
                          name="is2FA"
                          id="is2FA"
                          checked={is2FA}
                          onChange={(e) => setIs2FA(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer focus:ring-0"
                        />
                        <label
                          htmlFor="is2FA"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                          Activated 2FA
                        </label>
                      </div>
                    </div>
                    {is2FA && (
                      <div className="space-y-4 p-4 shadow-md dark:shadow-gray-900 rounded-lg mb-2 animate-in slide-in-from-right-4 fade-in">
                        <div className="rounded-xl bg-white dark:bg-gray-800/50 h-full">
                          <div className="space-y-4">
                            <InputLabel
                              type="number"
                              label="Telephone Number"
                              name="phoneNumber"
                              placeholder="+62-XXXX-XXXX-XXXX"
                              required
                            />
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Recovery
                                <span className="text-red-500">*</span>
                              </label>
                              <SearchableEmailDropdown
                                emails={existingEmails}
                                selectedId={selectedEmailId}
                                onSelect={setSelectedEmailId}
                                isOpen={isEmailDropdownOpen}
                                setIsOpen={setIsEmailDropdownOpen}
                                search={emailSearch}
                                setSearch={setEmailSearch}
                              />
                              <input
                                type="hidden"
                                name="recoveryEmailId"
                                value={selectedEmailId}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- CONTENT TAB ACCOUNT --- */}
                {activeTab === "account" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* KIRI */}
                    <div className="space-y-5 p-4 shadow-md dark:shadow-gray-900 rounded-lg mb-2">
                      <InputLabel
                        label="Platform Name"
                        name="platform"
                        placeholder="Facebook"
                        required
                      />
                      <InputLabel
                        label="Username"
                        name="username"
                        placeholder="Bob"
                        required
                      />
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Connect to Email
                            {!noEmail && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                            <input
                              type="checkbox"
                              name="noEmail"
                              onChange={(e) => setNoEmail(e.target.checked)}
                            />{" "}
                            Without Email
                          </label>
                        </div>
                        {!noEmail && (
                          <>
                            <SearchableEmailDropdown
                              emails={existingEmails}
                              selectedId={selectedEmailId}
                              onSelect={setSelectedEmailId}
                              isOpen={isEmailDropdownOpen}
                              setIsOpen={setIsEmailDropdownOpen}
                              search={emailSearch}
                              setSearch={setEmailSearch}
                            />
                            <input
                              type="hidden"
                              name="emailId"
                              value={selectedEmailId}
                            />
                          </>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                            {!noPassword && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                            <input
                              type="checkbox"
                              name="noPassword"
                              onChange={(e) => setNoPassword(e.target.checked)}
                            />{" "}
                            Without Password
                          </label>
                        </div>
                        {!noPassword && (
                          <input
                            type="password"
                            name="password"
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                          />
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Group
                        </label>
                        <SearchableGroupDropdown
                          groups={existingGroups}
                          selectedId={selectedGroupId}
                          onSelect={setSelectedGroupId}
                          isOpen={isGroupDropdownOpen}
                          setIsOpen={setIsGroupDropdownOpen}
                          search={groupSearch}
                          setSearch={setGroupSearch}
                        />
                        <input
                          type="hidden"
                          name="groupId"
                          value={selectedGroupId}
                        />
                      </div>
                    </div>

                    {/* KANAN */}
                    <div className="space-y-5 p-4 shadow-md dark:shadow-gray-900 rounded-lg mb-2">
                      <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Icon / Logo
                        </label>
                        <div className="flex items-center gap-4">
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all overflow-hidden relative group shrink-0">
                            {iconPreview ? (
                              <Image
                                src={iconPreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                height={200}
                                width={200}
                              />
                            ) : (
                              <PhotoIcon className="w-8 h-8 text-gray-400" />
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white text-xs font-medium">
                                Change
                              </span>
                            </div>
                            {iconPreview && (
                              <div
                                onClick={handleRemoveIcon}
                                className="absolute top-1 right-1 p-1 bg-white/90 rounded-full hover:bg-red-500 hover:text-white transition-colors text-gray-600 shadow-sm z-10"
                                title="Hapus Gambar">
                                <TrashIcon className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <p>Click icon to change image</p>
                            <p className="text-xs mt-1">
                              Format: JPG, PNG (Max 1MB).
                            </p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Categories<span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-9.5">
                          {CATEGORIES.map((cat) => (
                            <label
                              key={cat}
                              className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                              <input
                                type="checkbox"
                                name="category"
                                value={cat}
                                className="rounded text-blue-600 focus:ring-0"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-200">
                                {cat}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <InputLabel
                        label="Website/URL"
                        name="website"
                        type="url"
                        placeholder="https://www.example.com"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                         Note
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* FOOTER BUTTONS */}
                <div className="pt-6 flex justify-end gap-3 shrink-0 mt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}

// --- SUB COMPONENTS ---

interface EmailOption {
  id: string;
  email: string;
}

interface GroupOption {
  id: string;
  name: string;
}

interface SearchableEmailDropdownProps {
  emails: EmailOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  search: string;
  setSearch: (search: string) => void;
}

interface SearchableGroupDropdownProps {
  groups: GroupOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  search: string;
  setSearch: (search: string) => void;
}

// Komponen Searchable Dropdown Baru
function SearchableEmailDropdown({
  emails,
  selectedId,
  onSelect,
  isOpen,
  setIsOpen,
  search,
  setSearch,
}: SearchableEmailDropdownProps) {
  const filteredEmails = emails.filter((e) =>
    e.email.toLowerCase().includes(search.toLowerCase())
  );
  const selectedEmail = emails.find((e) => e.id === selectedId);

  return (
    <div className="relative">
      {/* Box Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 cursor-pointer flex justify-between items-center">
        <span
          className={
            selectedEmail ? "text-gray-900 dark:text-white" : "text-gray-400"
          }>
          {selectedEmail ? selectedEmail.email : "Select Email"}
        </span>
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 max-h-60 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded border-none focus:ring-0 outline-none text-gray-900 dark:text-white"
            />
          </div>

          {/* List Options */}
          <div className="overflow-y-auto flex-1">
            {filteredEmails.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Not Found
              </div>
            ) : (
              filteredEmails.slice(0, 3).map((e) => (
                <div
                  key={e.id}
                  onClick={() => {
                    onSelect(e.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors ${
                    selectedId === e.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                      : "text-gray-700 dark:text-gray-200"
                  }`}>
                  {e.email}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop untuk menutup dropdown saat klik luar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
}

function SearchableGroupDropdown({
  groups,
  selectedId,
  onSelect,
  isOpen,
  setIsOpen,
  search,
  setSearch,
}: SearchableGroupDropdownProps) {
  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );
  const selected = groups.find((g) => g.id === selectedId);

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 cursor-pointer flex justify-between items-center">
        <span
          className={
            selected ? "text-gray-900 dark:text-white" : "text-gray-400"
          }>
          {selected ? selected.name : "No Group"}
        </span>
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
      </div>
      {isOpen && (
        <>
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 max-h-60 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded border-none focus:ring-0 outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {/* Opsi Kosong (No Group) */}
              <div
                onClick={() => {
                  onSelect("");
                  setIsOpen(false);
                  setSearch("");
                }}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-gray-500 italic border-b border-gray-100 dark:border-gray-700/50`}>
                No Group
              </div>

              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  Not Found
                </div>
              ) : (
                filtered.slice(0, 3).map((g) => (
                  <div
                    key={g.id}
                    onClick={() => {
                      onSelect(g.id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors ${
                      selectedId === g.id
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                        : "text-gray-700 dark:text-gray-200"
                    }`}>
                    {g.name}
                  </div>
                ))
              )}
            </div>
          </div>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}></div>
        </>
      )}
    </div>
  );
}

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
        isActive
          ? "border-blue-600 text-blue-600 dark:text-blue-400"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      }`}>
      {label}
    </button>
  );
}

interface InputLabelProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function InputLabel({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: InputLabelProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
      />
    </div>
  );
}
