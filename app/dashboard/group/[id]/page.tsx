// app/dashboard/group/[id]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getGroupById } from "@/actions/group";
import Link from "next/link";
import AccountCard from "@/components/AccountCard";
import { ArrowLeftIcon, FolderOpenIcon } from "@heroicons/react/24/outline";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function GroupDetailPage(props: Props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const groupData = await getGroupById(params.id);
  if (!groupData) notFound();

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER & NAVIGASI */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
            <ArrowLeftIcon className="w-4 h-4 mr-1" /> Kembali ke Dashboard
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
            {/* Hiasan Background Folder */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-4 -mt-4 z-0"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
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
          </div>
        </div>

        {/* SECTION: ISI GROUP */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span>Daftar Akun</span>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              {groupData.accounts.length}
            </span>
          </h2>

          {groupData.accounts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <FolderOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Group ini masih kosong.</p>
              <p className="text-sm text-gray-400">
                Edit akun yang sudah ada dan masukkan ke group ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupData.accounts.map((acc) => (
                <AccountCard
                  key={acc.id}
                  id={acc.id}
                  platformName={acc.platformName}
                  username={acc.username}
                  category={acc.categories[0] || "Other"}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
