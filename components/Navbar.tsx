// components/Navbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session || !session.user) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 transition-colors duration-300">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="font-bold text-xl text-gray-800 dark:text-white tracking-tight">
                Account<span className="text-blue-600">Manager</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4" ref={dropdownRef}>
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-none">
                {session.user.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {session.user.email}
              </span>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative group flex items-center gap-1 focus:outline-none">
              <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-blue-100 transition-all">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-blue-100 dark:bg-blue-900 w-full h-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                    {session.user.name?.charAt(0)}
                  </div>
                )}
              </div>
            </button>

            {isOpen && (
              <div className="absolute top-16 right-2 mt-2 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 md:hidden">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {session.user.email}
                  </p>
                </div>

                {/* MENU 1: Tema */}
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    TEMA
                  </p>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-sm transition-all ${
                        theme === "light"
                          ? "bg-white text-blue-600 shadow-sm hover:text-gray-800"
                          : "text-gray-500 dark:text-gray-400 hover:text-white"
                      }`}
                      title="Mode Terang">
                      <SunIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-sm transition-all ${
                        theme === "dark"
                          ? "bg-gray-600 text-blue-400 shadow-sm hover:text-white"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
                      }`}
                      title="Mode Gelap">
                      <MoonIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* MENU 2: Logout */}
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
