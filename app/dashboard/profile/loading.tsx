// app/dashboard/profile/loading.tsx
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="p-4 sm:p-8 flex-1 bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* --- KOLOM KIRI (Info User & Logs) --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              {/* Profile Header Skeleton */}
              <div className="flex gap-3 items-center mb-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>

              {/* Stats Horizontal (3 Kotak Kecil) */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
              </div>

              {/* Recent Activity Header */}
              <div className="flex items-center justify-between py-4 border-y border-gray-100 dark:border-gray-800 mb-4">
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-24 h-8" />
                </div>
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>

              {/* Activity List Items */}
              <div className="space-y-6 pl-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 pl-6 border-l-2 border-gray-100 dark:border-gray-800 relative">
                    {/* Dot */}
                    <Skeleton className="absolute -left-1.5 top-1 w-3 h-3 rounded-full" />
                    <Skeleton className="h-3 w-20" /> {/* Date */}
                    <Skeleton className="h-4 w-full" /> {/* Title */}
                    <Skeleton className="h-3 w-16" /> {/* Badge */}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- KOLOM KANAN (Chart & Progress) --- */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full min-h-[500px]">
              {/* Header Chart */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>

              {/* Chart Area (Kotak Besar) */}
              <Skeleton className="w-full h-[300px] rounded-xl mb-8" />

              {/* Stats Progress Section */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                <Skeleton className="h-4 w-32 mb-4" /> {/* Title */}
                {/* Progress Bar 1 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-10 w-40" /> {/* Icon + Text */}
                    <Skeleton className="h-10 w-20" /> {/* Percent */}
                  </div>
                  <Skeleton className="h-3 w-full rounded-full" />
                </div>
                {/* Progress Bar 2 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                  <Skeleton className="h-3 w-full rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
