// components/Navbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useLock } from "@/components/providers/LockProvider";
import { lockSession } from "@/actions/security";

import {
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

import { useLanguage } from "@/components/LanguageProvider";

import Image from "next/image";
import Link from "next/link";
import Tooltip from "../ui/Tooltip";

export default function Navbar() {
  const { data: session } = useSession();
  const { t, lang, toggleLanguage } = useLanguage();
  const { lockScreen, hasPin, setShowSetupModal } = useLock();

  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  const handleLogout = async () => {
    await lockSession(); // Hapus cookie server
    sessionStorage.removeItem(`accault_pin_warned_${session?.user?.id}`); // Hapus session storage
    signOut({ callbackUrl: "/login" });
  };

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

  if (pathname == "/login") return null;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 sticky top-0  transition-colors duration-300">
      <div className="mx-auto px-4 sm:px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard">
              <Image
                src="/brand-logo.svg"
                width={120}
                height={120}
                alt="brand-logo"
                priority
              />
            </Link>
            <div className="hidden md:flex items-center gap-6 mx-4">
              <Link
                href="/about"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {t.navbar.about}
              </Link>
              <Link
                href="/help"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {t.navbar.help}
              </Link>
            </div>
          </div>

          {(!session || !session.user) && (
            <div className="flex items-center">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-500 dark:text-gray-50">
                Sign In
              </Link>
            </div>
          )}

          {session?.user && (
            <div className="flex items-center gap-3" ref={dropdownRef}>
              {/* {isDashboard && (
                <Tooltip text="Lock Screen (CTRL + L)" position="left">
                  <button
                    onClick={() => {
                      if (hasPin) lockScreen();
                      else setShowSetupModal(true);
                    }}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <LockClosedIcon className="w-6 h-6" />
                  </button>
                </Tooltip>
              )} */}
              <div className="hidden sm:block mr-1 border-l border-gray-300 dark:border-gray-700 w-1 h-[50%]"></div>
              <div className="hidden sm:flex flex-col items-end">
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
                      THEME
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
                    {/* Dalam Pengembangan */}
                    {/* <button
                    onClick={() => {
                      toggleLanguage();
                      setIsOpen(false); // Opsional: tutup setelah ganti, atau biarkan terbuka
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <LanguageIcon className="w-5 h-5" />
                      <span>{t.navbar.language}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 uppercase">
                      {lang}
                    </span>
                  </button> */}
                  </div>
                  <button
                    onClick={() => {
                      setShowSetupModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-3 transition-colors">
                    <KeyIcon className="w-5 h-5 text-gray-500" />
                    {hasPin ? "Change PIN" : "Setup PIN"}
                  </button>

                  {/* MENU 2: Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
