// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAccounts } from "@/actions/account";
import { getEmails } from "@/actions/email";
import { getGroups } from "@/actions/group";
import { checkHasPin } from "@/actions/security"; // Import checkHasPin
import { cookies } from "next/headers"; // Import cookies

import DashboardClient from "@/components/DashboardClient";
import DashboardHeader from "@/components/DashboardHeader";

type Props = { searchParams: Promise<{ q?: string; tab?: string }> };

export default async function DashboardPage(props: Props) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const tab = searchParams?.tab || "accounts";

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // --- LOGIKA BARU: SERVER-SIDE LOCKING ---
  
  // // 1. Cek apakah user punya PIN
  const hasPin = await checkHasPin();
  
  // // 2. Cek apakah sesi ini sudah di-unlock via cookie
  const isUnlocked = (await cookies()).get("accault_session_unlocked")?.value === "true";

  // // 3. Tentukan apakah boleh fetch data
  // // Boleh fetch JIKA: (User BELUM punya PIN) ATAU (User SUDAH punya PIN DAN Cookie Valid)
  const shouldFetchData = !hasPin || (hasPin && isUnlocked);

  let accounts: any[] = [];
  let emails: any[] = [];
  let groups: any[] = [];

  if (shouldFetchData) {
    // Fetch data hanya jika diizinkan
    [accounts, emails, groups] = await Promise.all([
      getAccounts(query),
      getEmails(query),
      getGroups(query),
    ]);
  } else {
    // Jika terkunci, biarkan array kosong. 
    // Prisma TIDAK DIPANGGIL sama sekali untuk data berat ini.
    console.log("Dashboard Locked: Skipping Database Queries");
  }
  // ----------------------------------------

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-5xl mx-auto space-y-5">
        <DashboardHeader
          session={session}
          emails={emails}
          groups={groups}
          activeTab={tab}
        />

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