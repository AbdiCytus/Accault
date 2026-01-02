// app/dashboard/profile/page.tsx
import { getProfileStats } from "@/actions/profile";
import ProfileChart from "@/components/profile/ProfileChart";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  ClockIcon,
  ChartBarIcon,
  RectangleStackIcon, // Ikon untuk Akun
  EnvelopeIcon, // Ikon untuk Email
  RectangleGroupIcon, // Ikon untuk Grup
} from "@heroicons/react/24/outline";

export default async function ProfilePage() {
  const data = await getProfileStats();

  if (!data) {
    redirect("/login");
  }

  const { user, stats, logs } = data;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* LAYOUT GRID: Kiri (Info & Logs) - Kanan (Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* --- KOLOM KIRI (Width: 4/12) --- */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. KARTU PROFIL & STATISTIK */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              {/* Header Profil */}
              <div className="flex gap-3 items-center mb-2">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-800 shadow-md mb-3 bg-gray-200">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold">
                      {user.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {user.name}
                  </h1>
                  <p className="text-sm sm:text-md text-gray-500 dark:text-gray-400 font-medium">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* STATISTIK HORIZONTAL (Dengan Ikon) */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {/* Total Akun */}
                <div className="flex flex-col text-center gap-2 items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors group">
                  <span className="text-[12px] uppercase text-gray-500 font-semibold">
                    Accounts
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-1 group-hover:scale-110 transition-transform">
                      <RectangleStackIcon className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.accounts}
                    </span>
                  </div>
                </div>

                {/* Total Email */}
                <div className="flex flex-col text-center gap-2 items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors group">
                  <span className="text-[12px] uppercase text-gray-500 font-semibold">
                    Emails
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full mb-1 group-hover:scale-110 transition-transform">
                      <EnvelopeIcon className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.emails}
                    </span>
                  </div>
                </div>

                {/* Total Grup */}
                <div className="flex flex-col text-center gap-2 items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors group">
                  <span className="text-[12px] uppercase text-gray-500 font-semibold">
                    Groups
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full mb-1 group-hover:scale-110 transition-transform">
                      <RectangleGroupIcon className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.groups}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. RIWAYAT AKTIVITAS (Dipindah ke Kiri) */}
              <div className="flex items-center gap-3 mt-5 mb-4 py-4 border-y border-gray-100 dark:border-gray-800">
                <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Recent Activity
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="text-center text-gray-400 py-10 text-sm">
                    No Activity
                  </div>
                ) : (
                  <div className="space-y-6 pl-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-800 last:border-0">
                        <div
                          className={`absolute -left-1.25 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-gray-900 
                          ${
                            log.action === "LOGIN"
                              ? "bg-green-500"
                              : log.action === "DELETE"
                              ? "bg-red-500"
                              : log.action === "UPDATE"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}></div>

                        <div className="flex flex-col space-y-1">
                          <span className="text-xs text-gray-400 font-mono">
                            {formatDate(log.createdAt)}
                          </span>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
                            {log.details || log.action}
                          </p>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 w-fit">
                            {log.entity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- KOLOM KANAN (Width: 8/12) --- */}
          <div className="lg:col-span-8">
            {/* KARTU CHART (Sekarang lebih lebar) */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full min-h-125 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <ChartBarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Analitik Penyimpanan
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Visualisasi distribusi data akun Anda
                    </p>
                  </div>
                </div>
              </div>

              {/* Area Grafik */}
              <div className="flex-1 w-full min-h-100">
                <ProfileChart stats={stats} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
