"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateAccount } from "@/actions/account";
import { SavedAccount } from "@/app/generated/prisma/client";
import {
  XMarkIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Image from "next/image";
import Portal from "./Portal";

interface EditProps {
  account: SavedAccount;
  emails: { id: string; email: string }[];
  groups: { id: string; name: string }[];
  isIcon: boolean;
}

interface InputLabelProps {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}

export default function EditAccountModal({
  account,
  emails,
  groups,
  isIcon = false,
}: EditProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initial State dari Data Existing
  const [noEmail, setNoEmail] = useState(!account.emailId);
  const [noPassword, setNoPassword] = useState(!account.encryptedPassword);
  const [iconPreview, setIconPreview] = useState<string | null>(account.icon);

  // Dropdown State
  const [emailSearch, setEmailSearch] = useState("");
  const [selectedEmailId, setSelectedEmailId] = useState(account.emailId || "");
  const [isEmailDropdownOpen, setIsEmailDropdownOpen] = useState(false);

  //State Group
  const [groupSearch, setGroupSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const CATEGORIES = ["Social", "Game", "Work", "Finance", "Other"];

  // Handle Gambar
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) return toast.error("Max 1MB");
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

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    // Append data
    if (iconPreview) formData.set("icon", iconPreview);
    else formData.append("isIconDeleted", "true");

    if (!noEmail && selectedEmailId) formData.set("emailId", selectedEmailId);
    formData.set("groupId", selectedGroupId);

    await new Promise((r) => setTimeout(r, 800)); // UX Delay

    const result = await updateAccount(formData);
    setIsLoading(false);

    if (result?.success) {
      toast.success(result.message);
      setIsOpen(false);
      if (result.redirectPath) {
        router.push(result.redirectPath);
        router.refresh();
      } else router.refresh();
    } else toast.error(result?.message || "Gagal update");
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={
          isIcon
            ? "p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
            : "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        }
        title="Edit Akun">
        {/* Jika isIcon true, render ikon saja. Jika false, render tombol biasa */}
        {isIcon ? (
          <PencilSquareIcon className="w-5 h-5" />
        ) : (
          <>
            <PencilSquareIcon className="w-4 h-4" />
            <span>Edit</span>
          </>
        )}
      </button>

      {isOpen && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            {/* MODAL LEBAR MAX-W-4XL */}
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl mx-auto shadow-2xl overflow-hidden flex flex-col max-h-[95vh] transition-colors">
              <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center px-6 py-4 shrink-0">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                  Edit Akun
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto">
                <input type="hidden" name="id" value={account.id} />

                {/* --- GRID 2 KOLOM --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* KOLOM KIRI */}
                  <div className="space-y-5 p-4 shadow-md dark:shadow-gray-900 rounded-lg mb-2">
                    <InputLabel
                      label="Nama Platform"
                      name="platform"
                      defaultValue={account.platformName}
                      required
                    />

                    <InputLabel
                      label="Username"
                      name="username"
                      defaultValue={account.username}
                      required
                    />

                    {/* Email Logic */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Terkait
                        </label>
                        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                          <input
                            type="checkbox"
                            name="noEmail"
                            checked={noEmail}
                            onChange={(e) => setNoEmail(e.target.checked)}
                          />
                          Tanpa Email
                        </label>
                      </div>
                      {!noEmail && (
                        <div className="relative">
                          <div
                            onClick={() =>
                              setIsEmailDropdownOpen(!isEmailDropdownOpen)
                            }
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 cursor-pointer flex justify-between items-center">
                            <span
                              className={
                                selectedEmailId
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-400"
                              }>
                              {emails.find((e) => e.id === selectedEmailId)
                                ?.email || "-- Pilih Email --"}
                            </span>
                            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          {isEmailDropdownOpen && (
                            <>
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden flex flex-col">
                                <div className="p-1 border-b border-gray-100 dark:border-gray-700">
                                  <input
                                    autoFocus
                                    type="text"
                                    placeholder="Cari..."
                                    value={emailSearch}
                                    onChange={(e) =>
                                      setEmailSearch(e.target.value)
                                    }
                                    className="w-full text-sm px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded border-none focus:ring-0 outline-none text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div className="max-h-40 overflow-y-auto">
                                  {emails
                                    .filter((e) =>
                                      e.email
                                        .toLowerCase()
                                        .includes(emailSearch.toLowerCase())
                                    )
                                    .slice(0, 3)
                                    .map((e) => (
                                      <div
                                        key={e.id}
                                        onClick={() => {
                                          setSelectedEmailId(e.id);
                                          setIsEmailDropdownOpen(false);
                                        }}
                                        className="px-2 py-1.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer rounded text-gray-700 dark:text-gray-200">
                                        {e.email}
                                      </div>
                                    ))}
                                </div>
                              </div>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() =>
                                  setIsEmailDropdownOpen(false)
                                }></div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Password Logic */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Password
                        </label>
                        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                          <input
                            type="checkbox"
                            name="noPassword"
                            checked={noPassword}
                            onChange={(e) => setNoPassword(e.target.checked)}
                          />
                          Tanpa Password
                        </label>
                      </div>
                      {!noPassword && (
                        <input
                          type="password"
                          name="password"
                          placeholder="Isi untuk ubah password..."
                          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      )}
                    </div>

                    {/* Group Searchable */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Group
                      </label>
                      <div className="relative">
                        <div
                          onClick={() =>
                            setIsGroupDropdownOpen(!isGroupDropdownOpen)
                          }
                          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 cursor-pointer flex justify-between items-center">
                          <span
                            className={
                              selectedGroupId
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-400"
                            }>
                            {groups.find((g) => g.id === selectedGroupId)
                              ?.name || "-- Tidak ada group --"}
                          </span>
                          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        {isGroupDropdownOpen && (
                          <>
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden flex flex-col">
                              <div className="p-1 border-b border-gray-100 dark:border-gray-700">
                                <input
                                  autoFocus
                                  type="text"
                                  placeholder="Cari group..."
                                  value={groupSearch}
                                  onChange={(e) =>
                                    setGroupSearch(e.target.value)
                                  }
                                  className="w-full text-sm px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded border-none focus:ring-0 outline-none text-gray-900 dark:text-white"
                                />
                              </div>
                              <div className="max-h-40 overflow-y-auto">
                                <div
                                  onClick={() => {
                                    setSelectedGroupId("");
                                    setIsGroupDropdownOpen(false);
                                    setGroupSearch("");
                                  }}
                                  className="px-2 py-1.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer rounded text-gray-500 italic border-b border-gray-100 dark:border-gray-700/50">
                                  -- Tidak ada group --
                                </div>
                                {groups
                                  .filter((g) =>
                                    g.name
                                      .toLowerCase()
                                      .includes(groupSearch.toLowerCase())
                                  )
                                  .slice(0, 3)
                                  .map((g) => (
                                    <div
                                      key={g.id}
                                      onClick={() => {
                                        setSelectedGroupId(g.id);
                                        setIsGroupDropdownOpen(false);
                                        setGroupSearch("");
                                      }}
                                      className="px-2 py-1.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer rounded text-gray-700 dark:text-gray-200">
                                      {g.name}
                                    </div>
                                  ))}
                              </div>
                            </div>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() =>
                                setIsGroupDropdownOpen(false)
                              }></div>
                          </>
                        )}
                      </div>
                      <input
                        type="hidden"
                        name="groupId"
                        value={selectedGroupId}
                      />
                    </div>
                  </div>

                  {/* KOLOM KANAN */}
                  <div className="space-y-5 p-4 shadow-md dark:shadow-gray-900 rounded-lg mb-2">
                    {/* Upload Icon */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ikon / Logo
                      </label>
                      <div className="flex items-center gap-4">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden relative group shrink-0">
                          {iconPreview ? (
                            <Image
                              src={iconPreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              width={200}
                              height={200}
                            />
                          ) : (
                            <span className="text-2xl text-gray-400 font-bold">
                              {account.platformName.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs">Ubah</span>
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
                          <p>Klik gambar untuk mengubah.</p>
                          <p className="text-xs mt-1">
                            Klik ikon sampah untuk menghapus.
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

                    {/* Kategori */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Kategori
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <label
                            key={cat}
                            className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                            <input
                              type="checkbox"
                              name="category"
                              value={cat}
                              defaultChecked={account.categories.includes(cat)}
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
                      label="Website"
                      name="website"
                      defaultValue={account.website || ""}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Keterangan
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        defaultValue={account.description || ""}
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 mt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-70 flex items-center gap-2">
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
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

function InputLabel({ label, name, defaultValue, required }: InputLabelProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        name={name}
        defaultValue={defaultValue || ""}
        required={required}
        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
      />
    </div>
  );
}
