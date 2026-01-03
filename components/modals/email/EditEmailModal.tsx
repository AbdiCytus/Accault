"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEmail } from "@/actions/email";
import { EmailIdentity } from "@/app/generated/prisma/client";
import {
  PencilSquareIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Portal from "@/components/Portal";

type Props = {
  emailData: EmailIdentity;
  otherEmails: { id: string; email: string }[];
};

export default function EditEmailModal({
  emailData,
  otherEmails,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE FORM ---
  const [inputEmail, setInputEmail] = useState(emailData.email);
  const [is2FA, setIs2FA] = useState(emailData.is2FAEnabled);

  // STATE RECOVERY
  const [recoverySearch, setRecoverySearch] = useState("");
  const [selectedRecoveryId, setSelectedRecoveryId] = useState(
    emailData.recoveryEmailId || ""
  );
  const [isRecoveryDropdownOpen, setIsRecoveryDropdownOpen] = useState(false);

  // --- STATE KONFIRMASI ---
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const recoveryOptions = otherEmails.filter((e) => e.id !== emailData.id);
  const isEmailChanged = inputEmail !== emailData.email;

  // 1. HANDLER PERTAMA: Saat tombol "Simpan" diklik
  async function handlePreSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append("id", emailData.id);

    if (emailData.isVerified && isEmailChanged) {
      setPendingFormData(formData);
      setShowConfirmation(true);
      return;
    }

    // Jika kondisi di atas tidak terpenuhi, langsung simpan
    await processUpdate(formData);
  }

  // 2. HANDLER KEDUA: Proses Simpan ke Server (Eksekusi Akhir)
  async function processUpdate(formData: FormData) {
    setIsLoading(true);
    setShowConfirmation(false);

    // UX Delay sedikit
    await new Promise((r) => setTimeout(r, 800));

    const result = await updateEmail(formData);
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
      setPendingFormData(null);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  // Fungsi Reset saat modal ditutup/dibuka
  const handleOpen = () => {
    setInputEmail(emailData.email);
    setIs2FA(emailData.is2FAEnabled);
    setShowConfirmation(false);
    setIsOpen(true);
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={handleOpen}
        className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-500 dark:hover:bg-blue-900/50 transition-all rounded-lg"
        title="Edit Email">
        <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* OVERLAY MODAL */}
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div
              className={`bg-white dark:bg-gray-800 rounded-xl w-full ${
                is2FA ? "max-w-4xl" : "max-w-lg"
              } mx-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300`}>
              {!showConfirmation ? (
                <>
                  <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center px-6 py-4 shrink-0">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                      Edit Email
                    </h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      disabled={isLoading}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Warning Verification */}
                  {emailData.isVerified && (
                    <div
                      className={`p-3 mx-6 mt-5 text-xs rounded-lg border flex items-start gap-2 transition-colors ${
                        isEmailChanged
                          ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                          : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                      }`}>
                      <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        {isEmailChanged ? (
                          <>
                            <b>Warning!</b> Changing email address will {" "}
                            <strong>remove</strong> verified status
                          </>
                        ) : (
                          "Email Verified"
                        )}
                      </span>
                    </div>
                  )}

                  <form
                    onSubmit={handlePreSubmit}
                    className="p-6 overflow-y-auto">
                    {/* GRID LAYOUT JIKA 2FA AKTIF */}
                    <div
                      className={
                        is2FA
                          ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                          : "space-y-4"
                      }>
                      {/* KOLOM KIRI (DATA UTAMA) */}
                      <div className="space-y-4 p-4 shadow-md dark:shadow-gray-900 rounded-lg mb-2">
                        {/* Nama Pengguna */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Username
                          </label>
                          <input
                            name="name"
                            placeholder="Bob"
                            defaultValue={emailData.name || ""}
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        {/* Alamat Email & Warning Box */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address<span className="text-red-500">*</span>
                          </label>
                          <input
                            name="email"
                            type="email"
                            placeholder="example@gmail.com"
                            value={inputEmail}
                            onChange={(e) => setInputEmail(e.target.value)}
                            required
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Password
                          </label>
                          <input
                            name="password"
                            type="password"
                            placeholder="Fill to change password..."
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        {/* 2FA Checkbox */}
                        <div
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                            is2FA
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                              : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                          }`}>
                          <input
                            type="checkbox"
                            name="is2FA"
                            id="is2FA_edit"
                            checked={is2FA}
                            onChange={(e) => setIs2FA(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                          />
                          <label
                            htmlFor="is2FA_edit"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                            Activate 2FA
                          </label>
                        </div>
                      </div>

                      {/* KOLOM KANAN (KEAMANAN) */}
                      {is2FA && (
                        <div className="space-y-4 p-4 shadow-md dark:shadow-gray-900 rounded-lg mb-2 animate-in slide-in-from-right-4 fade-in duration-300">
                          <div className="rounded-xl bg-white dark:bg-gray-800/50 h-full">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Telephone Number<span className="text-red-500">*</span>
                                </label>
                                <input
                                  name="phoneNumber"
                                  defaultValue={emailData.phoneNumber || ""}
                                  placeholder="+62-XXXX-XXXX-XXXX"
                                  required
                                  type="number"
                                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                              </div>

                              {/* SEARCHABLE DROPDOWN RECOVERY */}
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Email Recovery<span className="text-red-500">*</span>
                                </label>
                                <SearchableEmailDropdown
                                  emails={recoveryOptions}
                                  selectedId={selectedRecoveryId}
                                  onSelect={setSelectedRecoveryId}
                                  isOpen={isRecoveryDropdownOpen}
                                  setIsOpen={setIsRecoveryDropdownOpen}
                                  search={recoverySearch}
                                  setSearch={setRecoverySearch}
                                />
                                <input
                                  type="hidden"
                                  name="recoveryEmailId"
                                  value={selectedRecoveryId}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        disabled={isLoading}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* --- LAYAR 2: KONFIRMASI (Tampilan Tetap Sama) --- */
                <div className="p-8 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600 dark:text-yellow-400 ring-8 ring-yellow-50 dark:ring-yellow-900/10">
                    <ExclamationTriangleIcon className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Email Address Change Confirmation
                  </h3>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 text-sm text-left">
                    <p className="text-gray-800 dark:text-gray-200 mb-2 font-medium">
                      Changing email consequence:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                      <li>
                       Change email from <b>{emailData.email}</b> to{" "}
                        <b>{inputEmail}</b>.
                      </li>
                      <li className="text-red-600 dark:text-red-400 font-bold">
                        {'Remove verified status'}
                      </li>
                      <li>You must verified again manually</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmation(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Kembali
                    </button>
                    <button
                      onClick={() =>
                        pendingFormData && processUpdate(pendingFormData)
                      }
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30">
                      {isLoading ? "Saving..." : "Confirm Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}

interface EmailOption {
  id: string;
  email: string;
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
          {selectedEmail ? selectedEmail.email : "-- Pilih Email --"}
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
