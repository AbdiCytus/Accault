// components/menu/ActionMenu.tsx
"use client";

import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { ReactNode, useState, useRef, useEffect } from "react";

export default function ActionMenu({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={menuRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className={`relative flex items-center justify-center rounded-lg transition-all duration-300 ease-in-out border ${
        isOpen
          ? "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
          : "border-transparent hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-600"
      }`}>


      {/* State 1: Trigger (Dots) */}
      <button
        onClick={() => setIsOpen(true)}
        className={`p-1 cursor-pointer text-gray-500 dark:text-gray-400 focus:outline-none animate-in fade-in duration-200 ${
          isOpen ? "hidden" : "block"
        }`}>
        <EllipsisVerticalIcon className="w-6 h-6" />
      </button>

      {/* State 2: Action Buttons (Children) */}
      <div
        className={`items-center gap-2 p-0.5 animate-in slide-in-from-right-2 fade-in duration-200 ${
          isOpen ? "flex" : "hidden"
        }`}>
        {children}
      </div>
    </div>
  );
}
