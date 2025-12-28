// components/Navbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { data: session } = useSession();

  // Jika belum login, jangan tampilkan navbar (atau bisa tampilkan versi guest)
  if (!session || !session.user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* BAGIAN KIRI: Logo / Nama Aplikasi */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="font-bold text-xl text-gray-800 tracking-tight">
                Account<span className="text-blue-600">Manager</span>
              </span>
            </Link>
          </div>

          {/* BAGIAN KANAN: Profil User & Logout */}
          <div className="flex items-center gap-4">
            {/* Info User (Hidden di HP, Muncul di PC) */}
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-gray-700 leading-none">
                {session.user.name}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {session.user.email}
              </span>
            </div>

            {/* Foto Profil */}
            <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-200">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="bg-blue-100 w-full h-full flex items-center justify-center text-blue-600 font-bold">
                  {session.user.name?.charAt(0)}
                </div>
              )}
            </div>

            {/* Garis Pemisah Kecil */}
            <div className="h-6 w-px bg-gray-300 mx-1"></div>

            {/* Tombol Logout */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Keluar / Logout">
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
