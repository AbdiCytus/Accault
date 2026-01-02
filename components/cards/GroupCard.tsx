// components/GroupCard.tsx
"use client";

import Link from "next/link";
import { FolderIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as SolidCheckIcon } from "@heroicons/react/24/solid";
import { useDroppable } from "@dnd-kit/core";

type GroupProps = {
  id: string;
  name: string;
  count: number;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
};

export default function GroupCard({
  id,
  name,
  count,
  isSelectMode = false,
  isSelected = false,
  onToggleSelect,
}: GroupProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `group-${id}`, // ID Unik untuk Drop Zone
    data: {
      type: "group",
      groupId: id,
      groupName: name,
    },
  });

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectMode && onToggleSelect) {
      e.preventDefault();
      onToggleSelect(id);
    }
  };
  return (
    <div ref={setNodeRef} className="h-full">
      {isSelectMode && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(id);
          }}
          className="absolute -top-2 -right-2 z-20 cursor-pointer bg-white dark:bg-gray-800 rounded-full shadow-md">
          {isSelected ? (
            <SolidCheckIcon className="w-8 h-8 text-blue-600" />
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-400 transition-colors" />
          )}
        </div>
      )}
      <Link
        href={isSelectMode ? "#" : `/dashboard/group/${id}`}
        onClick={handleCardClick}>
        <div className="relative group cursor-pointer h-full transition-transform hover:-translate-y-1">
          {/* Efek Tumpukan Kertas */}
          <div className="absolute top-0 right-0 -mr-1 -mt-1 w-full h-full bg-blue-100 dark:bg-blue-900/30 rounded-xl -z-10 border border-blue-200 dark:border-blue-800"></div>

          {/* Kartu Utama */}
          <div
            className={`bg-white dark:bg-gray-800 p-5 rounded-xl border-2 shadow-sm h-full flex flex-col justify-between transition-colors
                ${
                  isSelectMode
                    ? isSelected
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-blue-100 dark:border-gray-700 opacity-50 hover:opacity-100"
                    : isOver
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50 scale-105"
                    : "border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                }
            `}>
            <div className="flex items-start justify-between">
              <div
                className={`p-3 rounded-lg transition-colors ${
                  isOver
                    ? "bg-blue-200 text-blue-700"
                    : "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
                }`}>
                <FolderIcon className="w-8 h-8" />
              </div>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-full">
                {count} Items
              </span>
            </div>

            <div className="mt-4">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">
                {name}
              </h3>
              <p
                className={`text-xs mt-1 ${
                  isOver
                    ? "text-blue-700 font-bold"
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                {isSelectMode
                  ? isSelected
                    ? "Selected"
                    : "Select"
                  : isOver
                  ? "Release to move"
                  : "Click to enter group"}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
