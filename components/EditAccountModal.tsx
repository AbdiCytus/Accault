"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAccount } from "@/actions/account"; // Import action baru
import { PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

type EditProps = {
  account: {
    id: string;
    platformName: string;
    username: string;
    category: string;
  };
};

export default function EditAccountModal({ account }: EditProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    const result = await updateAccount(formData); // Panggil fungsi update
    setIsLoading(false);

    if (result?.success) {
      toast.success("Perubahan disimpan!");
      setIsOpen(false);
      router.refresh();
    } else {
      toast.error(result?.message || "Gagal update");
    }
  }

  return (
    <>
     <button
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
        title="Edit Akun">
        <PencilIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                Edit Akun
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form action={handleSubmit} className="p-6 space-y-4">
              <input
                type="hidden"
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border dark:border-gray-700"
                name="id"
                value={account.id}
              />

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Platform
                </label>
                <input
                  name="platform"
                  type="text"
                  required
                  defaultValue={account.platformName}
                  className="border-gray-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border dark:border-gray-700 w-full rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-white mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    type="text"
                    required
                    defaultValue={account.username}
                    className="border-gray-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border dark:border-gray-700 w-full rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-white mb-1">
                    Kategori
                  </label>
                  <select
                    name="category"
                    defaultValue={account.category}
                    className="border-gray-300 text-gray-900 dark:text-white border dark:border-gray-700 w-full rounded-lg px-3 py-2 bg-white dark:bg-gray-800">
                    <option value="Social">Social Media</option>
                    <option value="Game">Game</option>
                    <option value="Work">Pekerjaan</option>
                    <option value="Finance">Keuangan</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Password Baru{" "}
                  <span className="dark:text-white font-normal">
                    (Opsional)
                  </span>
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Biarkan kosong jika tidak ingin mengubah"
                  className="border-gray-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border dark:border-gray-700 w-full rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
