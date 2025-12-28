// app/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAccounts } from "@/actions/account";
import { getEmails } from "@/actions/email";
import { getGroups } from "@/actions/group";

import AddDataModal from "@/components/AddDataModal";
import AccountCard from "@/components/AccountCard";
import SearchInput from "@/components/SearchInput";
import DashboardClient from "@/components/DashboardClient";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function DashboardPage(props: Props) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  // Fetch semua data secara paralel agar cepat
  const [accounts, emails, groups] = await Promise.all([
    getAccounts(query),
    getEmails(),
    getGroups(),
  ]);

  return (
    <div className="p-4 sm:p-8 min-h-[calc(100vh-140px)] bg-gray-50 dark:bg-black">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4 transition-colors">
          <div className="w-full md:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              Brankas Akun
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Halo, <span className="font-medium">{session.user?.name}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 sm:items-center">
            <div className="w-full sm:w-64 lg:w-80">
              <SearchInput />
            </div>
            <div className="w-full sm:w-auto flex justify-end">
              {/* Gunakan Modal Baru & Lempar Data */}
              <AddDataModal existingEmails={emails} existingGroups={groups} />
            </div>
          </div>
        </div>
        {/* AREA CLIENT (Toggle & Cards) */}
        <DashboardClient
          accounts={accounts}
          groups={groups}
          emails={emails}
          query={query}
        />
      </div>
    </div>
  );
}
