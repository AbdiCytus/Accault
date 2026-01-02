// app/dashboard/email/[id]/loading.tsx
import { Skeleton } from "@/components/ui/Skeleton";

export default function EmailDetailLoading() {
  return (
    <div className="p-4 sm:p-8 space-y-8 bg-white dark:bg-black">
      <div className="max-w-5xl mx-auto">
        {/* --- EMAIL HEADER CARD --- */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden mb-10">
          {/* Background Accent simulation */}
          <Skeleton className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-20" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" /> {/* Email Address */}
                  <Skeleton className="h-5 w-32" /> {/* Username */}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-28 rounded-full" />{" "}
                {/* Verified Badge */}
                <Skeleton className="h-8 w-28 rounded-full" /> {/* 2FA Badge */}
              </div>
            </div>

            {/* Stats Box Kecil */}
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 w-full md:w-auto min-w-[150px]">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </div>

        {/* --- LINKED ACCOUNTS LIST --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-6 w-48" /> {/* Title "Linked Accounts" */}
            <Skeleton className="h-8 w-32 rounded-lg" /> {/* Filter/Action */}
          </div>

          {/* List Mode Skeleton (karena biasanya connected accounts berbentuk list) */}
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
