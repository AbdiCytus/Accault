// components/profile/LogoutButton.tsx
"use client";

import { signOut } from "next-auth/react";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface LogoutButtonProps {
  fullWidth?: boolean;
}

export default function LogoutButton({ fullWidth = false }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 px-5 py-2 font-medium rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed
        bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 
        dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30
        ${fullWidth ? "w-full" : ""}
      `}>
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin dark:border-red-400/30 dark:border-t-red-400" />
      ) : (
        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
      )}
      <span>{isLoading ? "Keluar..." : "Keluar"}</span>
    </button>
  );
}
