// app/dashboard/account/[id]/loading.tsx
import { Skeleton } from "@/components/ui/Skeleton";

export default function AccountDetailLoading() {
  return (
    <div className="bg-white dark:bg-black">
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 min-h-screen bg-white dark:bg-black">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="flex items-center gap-6">
            {/* Icon Besar */}
            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-48 sm:w-64" /> {/* Platform Name */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />{" "}
                {/* Category Badge 1 */}
                <Skeleton className="h-6 w-24 rounded-full" />{" "}
                {/* Category Badge 2 */}
              </div>
            </div>
          </div>
          {/* Action Buttons (Edit/Delete) */}
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {/* KOLOM KIRI (Credentials) */}
          <div className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            {/* Password Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </div>
            {/* Email Linked Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>

          {/* KOLOM KANAN (Meta Info) */}
          <div className="space-y-6">
            {/* Website/URL */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            {/* Group Info */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            {/* Notes / Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
