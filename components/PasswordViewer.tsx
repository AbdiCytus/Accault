"use client";

import { useState } from "react";
import { getAccountPassword } from "@/actions/account";
import { getEmailPassword } from "@/actions/email";
import {
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface PasswordViewerProps {
  accountId?: string;
  emailId?: string;
}

export default function PasswordViewer({
  accountId,
  emailId,
}: PasswordViewerProps) {
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);


  async function togglePassword(e?: React.MouseEvent) {
    e?.preventDefault(); // Mencegah link parent diklik
    e?.stopPropagation();

    if (isVisible) {
      setIsVisible(false);
      setPassword("");
    } else {
      setIsLoading(true);

      let result;
      if (accountId) result = await getAccountPassword(accountId);
      else if (emailId) result = await getEmailPassword(emailId);
      else result = { success: false, password: "" };

      setIsLoading(false);

      if (result.success) {
        setPassword(result.password);
        setIsVisible(true);
      } else toast.error("Failed Getting Password");
    }
  }

  function copyToClipboard(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(password);
    setIsCopied(true);
    toast.success("Password disalin!");
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <div className="flex bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg justify-between items-center border border-gray-200 dark:border-gray-700">
      <div className="font-mono text-gray-700 dark:text-gray-300 text-sm truncate mr-2 select-all flex-1">
        {isLoading ? (
          <span className="animate-pulse text-gray-400">Decrypting...</span>
        ) : isVisible ? (
          <span>{password}</span>
        ) : (
          <span className="text-gray-400 dark:text-gray-600 tracking-widest">
            ••••••••••••
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isVisible && (
          <button
            onClick={copyToClipboard}
            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-all"
            title="Salin Password">
            {isCopied ? (
              <CheckIcon className="w-5 h-5 text-green-500" />
            ) : (
              <ClipboardDocumentIcon className="w-5 h-5" />
            )}
          </button>
        )}
        <button
          onClick={togglePassword}
          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-all"
          title={isVisible ? "Sembunyikan" : "Tampilkan"}>
          {isVisible ? (
            <EyeSlashIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
