import { Skeleton } from "../ui/Skeleton";

interface Props {
  activeTab: string;
}

export default function AccountEmailSkeleton({ activeTab }: Props) {
  return (
    <>
      {activeTab === "accounts" ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <Skeleton className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex flex-col justify-between h-45" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <Skeleton className="p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 h-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
