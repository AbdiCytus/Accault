// components/AddDataModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { addGroup } from "@/actions/group";
import { addEmail } from "@/actions/email";
import { addAccount } from "@/actions/account";
import toast from "react-hot-toast";

type Props = {
  // Data existing dilempar dari parent (Dashboard) untuk dropdown
  existingEmails: { id: string; email: string }[];
  existingGroups: { id: string; name: string }[];
};

export default function AddDataModal({
  existingEmails,
  existingGroups,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "account" | "group">(
    "account"
  );
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE KHUSUS FORM ---
  const [is2FA, setIs2FA] = useState(false);
  const [noEmail, setNoEmail] = useState(false);
  const [noPassword, setNoPassword] = useState(false);

  // List Kategori Tetap
  const CATEGORIES = ["Social", "Game", "Work", "Finance", "Other"];

  // --- HANDLER SUBMIT ---
  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    let result;

    try {
      if (activeTab === "group") {
        result = await addGroup(formData);
      } else if (activeTab === "email") {
        result = await addEmail(formData);
      } else {
        result = await addAccount(formData);
      }

      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
        resetFormState();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  }

  function resetFormState() {
    setIs2FA(false);
    setNoEmail(false);
    setNoPassword(false);
    // Reset tab ke default jika perlu
    setActiveTab("account");
  }

  return (
    <>
      {/* 1. TOMBOL PEMICU (HANYA IKON PLUS) */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full sm:rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
        title="Tambah Data">
        <PlusIcon className="w-6 h-6" />
        <span className="hidden sm:inline font-medium">Tambah</span>
      </button>

      {/* 2. MODAL UTAMA */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg mx-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
            {/* Header & Tabs */}
            <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex justify-between items-center px-6 py-4">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                  Tambah Data Baru
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full transition-colors">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex px-6 gap-6">
                <TabButton
                  label="Akun"
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

            {/* Form Body (Scrollable) */}
            <form
              action={handleSubmit}
              className="p-6 space-y-5 overflow-y-auto">
              {/* --- FORM 1: TAMBAH GROUP --- */}
              {activeTab === "group" && (
                <div className="space-y-4">
                  <InputLabel
                    label="Nama Group"
                    name="name"
                    placeholder="Contoh: Pekerjaan Kantor"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                    ℹ️ Group digunakan untuk mengelompokkan akun agar lebih rapi
                    (seperti Folder). Hanya akun yang bisa masuk ke group.
                  </p>
                </div>
              )}

              {/* --- FORM 2: TAMBAH EMAIL --- */}
              {activeTab === "email" && (
                <div className="space-y-4">
                  <InputLabel
                    label="Nama Pengguna (Opsional)"
                    name="name"
                    placeholder="Contoh: Akun Utama Saya"
                  />
                  <InputLabel
                    label="Alamat Email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                  />
                  <InputLabel
                    label="Password Email"
                    name="password"
                    type="password"
                    required
                  />

                  {/* Checkbox 2FA */}
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                    <input
                      type="checkbox"
                      name="is2FA"
                      id="is2FA"
                      onChange={(e) => setIs2FA(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                      htmlFor="is2FA"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                      Aktifkan 2-Factor Authentication (2FA)
                    </label>
                  </div>

                  {/* GROUP INPUT KHUSUS 2FA (Muncul hanya jika dicentang) */}
                  {is2FA && (
                    <div className="space-y-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800 animate-in slide-in-from-top-2 duration-300">
                      <InputLabel
                        label="Nomor Telepon (Wajib untuk 2FA)"
                        name="phoneNumber"
                        placeholder="+62..."
                        required
                      />

                      {/* Dropdown Recovery Email (Sekarang ada di dalam blok is2FA) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email Pemulih (Wajib untuk 2FA)
                        </label>
                        <select
                          name="recoveryEmailId"
                          required
                          defaultValue=""
                          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
                          <option value="" disabled>
                            Pilih Email Pemulih...
                          </option>
                          {existingEmails.length === 0 && (
                            <option disabled>Belum ada data email lain</option>
                          )}
                          {existingEmails.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.email}
                            </option>
                          ))}
                        </select>
                        {existingEmails.length === 0 && (
                          <p className="text-xs text-red-500 mt-1">
                            * Anda perlu menambahkan email lain terlebih dahulu
                            untuk dijadikan pemulih.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- FORM 3: TAMBAH AKUN (KOMPLEKS) --- */}
              {activeTab === "account" && (
                <div className="space-y-4">
                  <InputLabel
                    label="Nama Platform / Layanan"
                    name="platform"
                    placeholder="Contoh: Netflix"
                    required
                  />

                  {/* Multi Select Category (Checkbox Style) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kategori (Pilih minimal satu)
                    </label>
                    <div className="flex flex-wrap gap-2">
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

                  <InputLabel label="Username" name="username" required />

                  {/* Opsi Email */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Terhubung ke Email
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                        <input
                          type="checkbox"
                          name="noEmail"
                          onChange={(e) => setNoEmail(e.target.checked)}
                        />
                        Tanpa Email
                      </label>
                    </div>
                    {!noEmail && (
                      <select
                        name="emailId"
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
                        <option value="">-- Pilih Email (Opsional) --</option>
                        {existingEmails.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.email}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Opsi Password */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                        <input
                          type="checkbox"
                          name="noPassword"
                          onChange={(e) => setNoPassword(e.target.checked)}
                        />
                        Tanpa Password
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

                  {/* Group Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Masuk ke Group (Opsional)
                    </label>
                    <select
                      name="groupId"
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
                      <option value="">-- Tidak ada group --</option>
                      {existingGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <InputLabel
                    label="Website URL (Opsional)"
                    name="website"
                    placeholder="https://"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Keterangan (Opsional)
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-4 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors">
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// --- SUB COMPONENTS (Helpers) ---
interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
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
