// app/dashboard/group/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupById } from "@/actions/group";
import GroupClient from "@/components/detail/GroupClient";
import GroupHeader from "@/components/detail/GroupHeader";

// Import Tipe Data Eksplisit
import { AccountWithRelations, GroupWithCount } from "@/types/dashboard";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function GroupDetailPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const query = searchParams?.q || "";
  const page = Number(searchParams?.page) || 1;

  // Fetch data paginated
  const data = await getGroupById(params.id, query, page);

  if (!data || !data.group) notFound();

  // Fetch all groups (untuk fitur Move)
  const allGroups = await prisma.accountGroup.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { accounts: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-5xl mx-auto space-y-6">
        <GroupHeader group={data.group} />

        {/* PERBAIKAN: Tambahkan 'as unknown as ...' untuk mengatasi Type Mismatch */}
        <GroupClient
          group={data.group}
          accounts={data.accounts as unknown as AccountWithRelations[]}
          allGroups={allGroups as unknown as GroupWithCount[]}
          totalPages={data.totalPages}
          currentPage={data.currentPage}
          totalAccounts={data.totalAccounts}
        />
      </div>
    </div>
  );
}
