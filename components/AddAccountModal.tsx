// components/AddAccountModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAccount } from "@/actions/account"; // Import Server Action
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function AddAccountModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);

    const result = await addAccount(formData);
    setIsLoading(false);

    if (result.success == true) {
      setIsOpen(false);
      toast.success("Akun berhasil ditambahkan!");
      router.refresh();
    } else toast.error(result?.message || "Gagal menyimpan");
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm hover:shadow-md">
        <PlusIcon className="w-5 h-5" />
        <span>Tambah Akun</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden transition-colors">
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                Simpan Akun Baru
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form action={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Platform / Nama Layanan
                </label>
                <input
                  name="platform"
                  type="text"
                  required
                  placeholder="Contoh: Facebook"
                  className="border-gray-300 w-full border dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username / Email
                  </label>
                  <input
                    name="username"
                    type="text"
                    required
                    className="border-gray-300 w-full border dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <select
                    name="category"
                    className="border-gray-300 w-full border dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
                    <option value="Social">Social Media</option>
                    <option value="Game">Game</option>
                    <option value="Work">Pekerjaan</option>
                    <option value="Finance">Keuangan</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="border-gray-300 w-full border dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
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
