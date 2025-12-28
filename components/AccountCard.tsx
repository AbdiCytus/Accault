// components/AccountCard.tsx
"use client";

import { useState } from "react";
import { getAccountPassword } from "@/actions/account";
import toast from "react-hot-toast";
import EditAccountModal from "./EditAccountModal";
import DeleteAccountModal from "./DeleteAccountModal";

import {
  TrashIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  EllipsisVerticalIcon,
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
  const [isVisible, setIsVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
        toast.error("Gagal mengambil password");
      }
    }
  }

  function copyToClipboard(text: string, type: "user" | "pass") {
    navigator.clipboard.writeText(text);

    if (type === "user") {
      setIsCopiedUser(true);
      toast.success("Username disalin!");
      setTimeout(() => setIsCopiedUser(false), 2000);
    } else {
      setIsCopiedPass(true);
      toast.success("Password disalin!");
      setTimeout(() => setIsCopiedPass(false), 2000);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all relative group/card">
      <div className="absolute top-4 right-4 z-10">
        <div className="group bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full p-1 transition-all duration-200 hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
          <div className="block group-hover:hidden p-1 cursor-pointer text-gray-400 dark:text-gray-500">
            <EllipsisVerticalIcon className="w-5 h-5" />
          </div>

          <div className="hidden group-hover:flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
            <EditAccountModal
              account={{ id, platformName, username, category }}
            />

            <button
              onClick={() => setIsDeleteOpen(true)}
              className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
              title="Hapus Akun">
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        account={{ id, platformName }}
      />

      <div className="flex items-center gap-2 mb-3">
        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded">
          {category}
        </span>
      </div>

      <h3 className="font-bold text-lg text-gray-800 dark:text-white">
        {platformName}
      </h3>

      <div
        onClick={() => copyToClipboard(username, "user")}
        className="text-gray-500 dark:text-gray-400 text-sm mb-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 w-fit group/user transition-colors">
        <span>{username}</span>
        {isCopiedUser ? (
          <CheckIcon className="w-4 h-4 text-green-500" />
        ) : (
          <ClipboardDocumentIcon className="w-4 h-4 opacity-0 group-hover/user:opacity-100 transition-opacity" />
        )}
      </div>

      <div className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg flex justify-between items-center mt-2 group/pass border border-transparent dark:border-gray-700">
        <div className="font-mono text-gray-700 dark:text-gray-300 text-sm truncate mr-2 select-all">
          {isLoading ? (
            <span className="animate-pulse text-gray-400">Decrypting...</span>
          ) : isVisible ? (
            <span>{password}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-600">••••••••</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isVisible && (
            <button
              onClick={() => copyToClipboard(password, "pass")}
              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-all">
              {isCopiedPass ? (
                <CheckIcon className="w-5 h-5 text-green-500" />
              ) : (
                <ClipboardDocumentIcon className="w-5 h-5" />
              )}
            </button>
          )}
          <button
            onClick={togglePassword}
            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-all">
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
