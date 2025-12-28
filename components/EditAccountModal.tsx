"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAccount } from "@/actions/account"; // Import action baru
import { PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
      setIsOpen(false);
      router.refresh();
    } else {
      alert(result?.message || "Gagal update");
    }
  }

  return (
    <>
      {/* TOMBOL PEMICU: Icon Pensil */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-12 text-gray-300 hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-blue-50"
        title="Edit Akun">
        <PencilIcon className="w-5 h-5" />
      </button>

      {/* MODAL EDIT */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Edit Akun</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form action={handleSubmit} className="p-6 space-y-4">
              {/* ID Tersembunyi (Wajib untuk update) */}
              <input type="hidden" name="id" value={account.id} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <input
                  name="platform"
                  type="text"
                  required
                  defaultValue={account.platformName} // Pre-fill data lama
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    type="text"
                    required
                    defaultValue={account.username}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    name="category"
                    defaultValue={account.category}
                    className="w-full border rounded-lg px-3 py-2 bg-white">
                    <option value="Social">Social Media</option>
                    <option value="Game">Game</option>
                    <option value="Work">Pekerjaan</option>
                    <option value="Finance">Keuangan</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru{" "}
                  <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Biarkan kosong jika tidak ingin mengubah"
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
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
