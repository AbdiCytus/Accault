// components/AccountCard.tsx
"use client";

import { useState } from "react";
import { getAccountPassword, deleteAccount } from "@/actions/account";
import { useRouter } from "next/navigation";
// 👇 Import icon yang dibutuhkan
import {
  TrashIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon, // Icon centang untuk feedback user
} from "@heroicons/react/24/outline";

type AccountProps = {
  id: string;
  platformName: string;
  username: string;
  category: string;
};

export default function AccountCard({
  id,
  platformName,
  username,
  category,
}: AccountProps) {
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State untuk feedback visual saat copy
  const [isCopiedUser, setIsCopiedUser] = useState(false);
  const [isCopiedPass, setIsCopiedPass] = useState(false);

  async function togglePassword() {
    if (isVisible) {
      setIsVisible(false);
      setPassword("");
    } else {
      setIsLoading(true);
      const result = await getAccountPassword(id);
      setIsLoading(false);

      if (result.success) {
        setPassword(result.password);
        setIsVisible(true);
      } else {
        alert("Gagal mengambil password");
      }
    }
  }

  function copyToClipboard(text: string, type: "user" | "pass") {
    navigator.clipboard.writeText(text);

    // Logika Feedback: Ubah icon jadi centang selama 2 detik
    if (type === "user") {
      setIsCopiedUser(true);
      setTimeout(() => setIsCopiedUser(false), 2000);
    } else {
      setIsCopiedPass(true);
      setTimeout(() => setIsCopiedPass(false), 2000);
    }
  }

  async function handleDelete() {
    if (confirm("Yakin ingin menghapus akun ini?")) {
      setIsDeleting(true);
      const result = await deleteAccount(id);
      if (result.success) {
        router.refresh();
      } else {
        alert("Gagal menghapus");
        setIsDeleting(false);
      }
    }
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all relative group">
      {/* Tombol Delete dengan Icon */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
        title="Hapus Akun">
        {isDeleting ? (
          <span className="text-xs">...</span>
        ) : (
          <TrashIcon className="w-5 h-5" />
        )}
      </button>

      <div className="flex items-center gap-2 mb-3">
        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
          {category}
        </span>
      </div>

      <h3 className="font-bold text-lg text-gray-800">{platformName}</h3>

      {/* Username dengan Icon Copy */}
      <div
        onClick={() => copyToClipboard(username, "user")}
        className="text-gray-500 text-sm mb-4 cursor-pointer hover:text-blue-600 flex items-center gap-2 w-fit group/user transition-colors"
        title="Klik untuk salin username">
        <span>{username}</span>
        {/* Icon muncul saat hover, atau berubah jadi centang saat dicopy */}
        {isCopiedUser ? (
          <CheckIcon className="w-4 h-4 text-green-500" />
        ) : (
          <ClipboardDocumentIcon className="w-4 h-4 opacity-0 group-hover/user:opacity-100 transition-opacity" />
        )}
      </div>

      {/* Area Password */}
      <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center mt-2 group/pass">
        <div className="font-mono text-gray-700 text-sm truncate mr-2 select-all">
          {isLoading ? (
            <span className="animate-pulse text-gray-400">Decrypting...</span>
          ) : isVisible ? (
            <span>{password}</span>
          ) : (
            <span className="text-gray-400">••••••••</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Tombol Copy Password */}
          {isVisible && (
            <button
              onClick={() => copyToClipboard(password, "pass")}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-md transition-all"
              title="Salin Password">
              {isCopiedPass ? (
                <CheckIcon className="w-5 h-5 text-green-500" />
              ) : (
                <ClipboardDocumentIcon className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Tombol Show/Hide Mata */}
          <button
            onClick={togglePassword}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-md transition-all"
            title={isVisible ? "Sembunyikan" : "Tampilkan"}>
            {isVisible ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
