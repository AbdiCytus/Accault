// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAccounts } from "@/actions/account";
import AddAccountModal from "@/components/AddAccountModal";
import AccountCard from "@/components/AccountCard";
import SearchInput from "@/components/SearchInput";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function DashboardPage(props: Props) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const accounts = await getAccounts(query);

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4 transition-colors">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Brankas Akun
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Halo, {session.user?.name}
            </p>
          </div>

          <div className="flex w-full md:w-auto gap-3 items-center">
            <SearchInput />
            <AddAccountModal />
          </div>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {query
                ? `Tidak ditemukan akun dengan nama "${query}"`
                : "Belum ada akun yang disimpan."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                id={account.id}
                platformName={account.platformName}
                username={account.username}
                category={account.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
