// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAccounts } from "@/actions/account";
import { getEmails } from "@/actions/email";
import { getGroups } from "@/actions/group";

import DashboardClient from "@/components/DashboardClient";
import DashboardHeader from "@/components/DashboardHeader";

type Props = { searchParams: Promise<{ q?: string; tab?: string }> };

export default async function DashboardPage(props: Props) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  // Fetch semua data secara paralel
  const [accounts, emails, groups] = await Promise.all([
    getAccounts(query),
    getEmails(query),
    getGroups(query),
  ]);

  return (
    <div className="p-4 sm:p-8 min-h-[calc(100vh-140px)] bg-gray-50 dark:bg-black">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* HEADER */}
        <DashboardHeader session={session} emails={emails} groups={groups} />

        {/* BODY */}
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
