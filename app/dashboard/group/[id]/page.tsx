// app/dashboard/group/[id]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getGroupById } from "@/actions/group";
import Link from "next/link";
import AccountCard from "@/components/AccountCard";
import DeleteGroupButton from "@/components/DeleteGroupButton";
import {
  FolderOpenIcon,
  HomeIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

type Props = { params: Promise<{ id: string }> };

export default async function GroupDetailPage(props: Props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Ambil data group beserta akun di dalamnya
  const groupData = await getGroupById(params.id);
  if (!groupData) notFound();

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* 1. NAVIGASI KEMBALI */}
        <nav className="flex items-center flex-wrap gap-1.5 text-sm text-gray-500 mb-2">
          {/* 1. Dashboard */}
          <Link
            href="/dashboard"
            className="hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-all flex items-center gap-1"
            title="Ke Dashboard Utama">
            <HomeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Separator */}
          <ChevronRightIcon className="w-3 h-3 text-gray-400 shrink-0" />

          {/* 2. Halaman Sekarang (Nama Group) */}
          <span className="px-2 py-1 text-gray-900 dark:text-gray-200 font-semibold truncate max-w-50 flex items-center gap-1">
            <FolderOpenIcon className="w-4 h-4 text-yellow-500" />
            {groupData.name}
          </span>
        </nav>

        {/* 2. HEADER GROUP (Judul & Tombol Hapus) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          {/* Hiasan Background Abstrak */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-4 -mt-4 z-0"></div>

          {/* Container Flex: Kiri (Info) & Kanan (Tombol Hapus) */}
          <div className="relative z-10 flex flex-row justify-between items-start md:items-center gap-4">
            {/* KIRI: Ikon & Nama Group */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-2xl flex items-center justify-center shrink-0">
                <FolderOpenIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-all">
                  {groupData.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Folder Group</p>
              </div>
            </div>

            {/* KANAN: Tombol Hapus Group */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl border border-gray-100 dark:border-gray-600 shrink-0">
              <DeleteGroupButton id={groupData.id} />
            </div>
          </div>
        </div>

        {/* 3. DAFTAR AKUN DALAM GROUP */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span>Daftar Akun</span>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              {groupData.accounts.length}
            </span>
          </h2>

          {groupData.accounts.length === 0 ? (
            // Tampilan Jika Kosong
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <FolderOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Group ini masih kosong.</p>
              <p className="text-sm text-gray-400">
                Edit akun yang sudah ada dan pindahkan ke group ini.
              </p>
            </div>
          ) : (
            // Tampilan Grid Akun
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupData.accounts.map((acc) => (
                <AccountCard
                  key={acc.id}
                  id={acc.id}
                  platformName={acc.platformName}
                  username={acc.username}
                  categories={acc.categories} // Array kategori
                  email={acc.emailIdentity?.email} // Email (muncul karena kita update backend group tadi)
                  hasPassword={!!acc.encryptedPassword}
                  icon={acc.icon} // Gambar ikon
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
