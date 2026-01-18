// components/AddAccountModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAccount } from "@/actions/account"; // Import Server Action
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AddAccountModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);

    // Panggil Server Action
    const result = await addAccount(formData);
    setIsLoading(false);

    if (result.success == true) {
      setIsOpen(false);
      alert(result.message);
      router.refresh();
    } else alert(result.message);
  }

  return (
    <>
      {/* TOMBOL PEMICU */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm hover:shadow-md">
        <PlusIcon className="w-5 h-5" /> {/* Icon Tambah */}
        <span>Add Account</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header Modal */}
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                Save New Account
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-colors">
                <XMarkIcon className="w-6 h-6" /> {/* Icon Silang */}
              </button>
            </div>

            {/* Form */}
            <form action={handleSubmit} className="p-6 space-y-4">
              {/* Input Platform */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <input
                  name="platform"
                  type="text"
                  disabled
                  placeholder="Facebook"
                  className="disabled:cursor-not-allowed w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Row: Username & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username / Email
                  </label>
                  <input
                    name="username"
                    type="text"
                    disabled
                    placeholder="email@example.com"
                    className="disabled:cursor-not-allowed w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    className="w-full border rounded-lg px-3 py-2 bg-white">
                    <option value="Social">Social Media</option>
                    <option value="Game">Game</option>
                    <option value="Work">Work</option>
                    <option value="Finance">Finance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Input Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  disabled
                  className="disabled:cursor-not-allowed w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Footer Modal (Tombol Action) */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled
                  className="disabled:cursor-not-allowed bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
