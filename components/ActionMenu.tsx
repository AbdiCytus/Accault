// components/ActionMenu.tsx
"use client";

import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";

export default function ActionMenu({ children }: { children: ReactNode }) {
  return (
    <div className="group relative flex items-center justify-center rounded-lg dark:hover:bg-gray-700 transition-all duration-300 ease-in-out border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
      {/* State 1: Tampilkan Titik Tiga (Default) */}
      <div className="block group-hover:hidden transition-all animate-in fade-in duration-200">
        <EllipsisVerticalIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
      </div>

      {/* State 2: Tampilkan Tombol Aksi (Hover) */}
      <div className="hidden group-hover:flex items-center duration-300 transition-all gap-2 p-0.5 animate-in slide-in-from-right-2 fade-in">
        {children}
      </div>
    </div>
  );
}
