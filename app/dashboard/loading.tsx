// app/dashboard/loading.tsx
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-8 space-y-6 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header Section (Title + Button) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Toolbar (Search + Filters) */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1 rounded-lg" /> {/* Search */}
          <Skeleton className="h-10 w-32 rounded-lg" /> {/* Filter 1 */}
          <Skeleton className="h-10 w-32 rounded-lg" /> {/* Filter 2 */}
        </div>

        {/* Grid Card Skeleton */}
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
                <Skeleton className="h-8 w-full rounded-lg" />{" "}
                {/* Copy Field 1 */}
                <Skeleton className="h-8 w-full rounded-lg" />{" "}
                {/* Copy Field 2 */}
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
