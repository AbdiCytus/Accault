// app/dashboard/group/[id]/loading.tsx
import { Skeleton } from "@/components/ui/Skeleton";

export default function GroupDetailLoading() {
  return (
    <div className="p-4 sm:p-8 space-y-8 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        {/* --- GROUP HEADER --- */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-4 w-full">
            <Skeleton className="h-4 w-32" /> {/* Breadcrumb/Label */}
            <Skeleton className="h-10 w-3/4 sm:w-1/2" /> {/* Group Name */}
            <Skeleton className="h-4 w-48" /> {/* Stats info */}
          </div>
          <div className="flex gap-2 shrink-0">
            <Skeleton className="h-10 w-24 rounded-lg" /> {/* Edit Btn */}
            <Skeleton className="h-10 w-10 rounded-lg" /> {/* Delete Btn */}
          </div>
        </div>

        {/* --- TOOLBAR (Search) --- */}
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>

        {/* --- ACCOUNTS GRID (Isi Grup) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
              <div className="pt-2 flex justify-end">
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
