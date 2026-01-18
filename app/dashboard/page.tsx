// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAccounts } from "@/actions/account";
import { getEmails } from "@/actions/email";
import { getGroups } from "@/actions/group";
import { checkHasPin } from "@/actions/security";
import { cookies } from "next/headers";

import DashboardClient from "@/components/DashboardClient";
import DashboardHeader from "@/components/DashboardHeader";

// 1. Definisikan tipe SearchParams yang lebih detail untuk Next.js 15+
type SearchParams = Promise<{
  q?: string;
  tab?: string;
  page?: string;
  filterType?: string;
  sort?: string;
  groupStatus?: string;
  category?: string | string[]; // Bisa string tunggal atau array
  hasEmail?: string;
  hasPassword?: string;
}>;

type Props = {
  searchParams: SearchParams;
};

export default async function DashboardPage(props: Props) {
  // 2. Await searchParams (Wajib di Next.js versi terbaru)
  const searchParams = await props.searchParams;

  // 3. Parsing Parameter dari URL
  const query = searchParams.q || "";
  const tab = searchParams.tab || "accounts";
  const page = Number(searchParams.page) || 1;
  const filterType = searchParams.filterType || "all";
  const sort = searchParams.sort || "newest";
  const groupStatus = searchParams.groupStatus || "all";
  const hasEmail = searchParams.hasEmail || "all";
  const hasPassword = searchParams.hasPassword || "all";

  // Handle kategori (URL bisa ?category=A atau ?category=A&category=B)
  let categories: string[] = [];
  if (searchParams.category) {
    categories = Array.isArray(searchParams.category)
      ? searchParams.category
      : [searchParams.category];
  }

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // --- LOGIKA LOCKING (Tidak Berubah) ---
  const hasPin = await checkHasPin();
  const isUnlocked =
    (await cookies()).get("accault_session_unlocked")?.value === "true";
  const shouldFetchData = !hasPin || (hasPin && isUnlocked);

  // Default value jika terkunci/kosong
  const accountsData = {
    accounts: [],
    metadata: { totalCount: 0, totalPages: 1, currentPage: 1 },
  };
  let emails: any[] = [];
  let groups: any[] = [];

  if (shouldFetchData) {
    // 4. Panggil Data dengan Parameter Lengkap
    // Perhatikan: getGroups & getEmails masih pakai cara lama (string query)
    const [accResult, emailsResult, groupsResult] = await Promise.all([
      getAccounts({
        query,
        page,
        sort,
        filterType,
        groupStatus,
        categories,
        hasEmail,
        hasPassword,
      }),
      getEmails(query),
      getGroups(query),
    ]);

    // Hasil getAccounts sekarang adalah object { accounts, metadata }
    // accountsData = accResult;
    emails = emailsResult;
    groups = groupsResult;
  }

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-5xl mx-auto space-y-5">
        <DashboardHeader
          session={session}
          emails={emails}
          groups={groups}
          activeTab={tab}
        />

        {/* CATATAN: Di sini DashboardClient mungkin akan memunculkan error TypeScript 
          karena prop 'totalPages' dan 'currentPage' belum kita tambahkan di definisi komponennya.
          Kita akan perbaiki ini di Langkah 3.
        */}
        <DashboardClient
          accounts={accountsData.accounts} // Kirim array akun
          groups={groups}
          emails={emails}
          query={query}
          serverTotalPages={accountsData.metadata.totalPages}
          serverCurrentPage={accountsData.metadata.currentPage}
          serverTotalCount={accountsData.metadata.totalCount}
        />
      </div>
    </div>
  );
}
