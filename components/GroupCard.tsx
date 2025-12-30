// components/GroupCard.tsx
"use client";

import Link from "next/link";
import { FolderIcon } from "@heroicons/react/24/solid";
import { useDroppable } from "@dnd-kit/core";

type GroupProps = {
  id: string;
  name: string;
  count: number;
};

export default function GroupCard({ id, name, count }: GroupProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `group-${id}`, // ID Unik untuk Drop Zone
    data: {
      type: "group",
      groupId: id,
      groupName: name,
    },
  });
  return (
    <div ref={setNodeRef} className="h-full">
      <Link href={`/dashboard/group/${id}`}>
        <div className="relative group cursor-pointer h-full transition-transform hover:-translate-y-1">
          {/* Efek Tumpukan Kertas (Visual Buku) */}
          <div className="absolute top-0 right-0 -mr-1 -mt-1 w-full h-full bg-blue-100 dark:bg-blue-900/30 rounded-xl -z-10 border border-blue-200 dark:border-blue-800"></div>

          {/* Kartu Utama */}
          <div
            className={`bg-white dark:bg-gray-800 p-5 rounded-xl border-2 shadow-sm h-full flex flex-col justify-between transition-colors
                ${
                  isOver
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50 scale-105" // Efek Visual saat Drag Over
                    : "border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                }
            `}>
            <div className="flex items-start justify-between">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-300">
                <FolderIcon className="w-8 h-8" />
              </div>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-full">
                {count} Akun
              </span>
            </div>

            <div className="mt-4">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">
                {name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isOver ? "Release to move" : "Click to enter group"}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
