// app/dashboard/group/[id]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma"; // Pastikan path prisma client benar
import GroupClient from "@/components/detail/GroupClient";
import GroupHeader from "@/components/detail/GroupHeader";

type Props = { params: Promise<{ id: string }> };

export default async function GroupDetailPage(props: Props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const group = await prisma.accountGroup.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!group) notFound();

  const accounts = await prisma.savedAccount.findMany({
    where: {
      groupId: params.id,
      userId: session.user.id,
    },
    include: {
      emailIdentity: { select: { email: true } },
      group: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-8">
          <GroupHeader group={group} />
          <GroupClient group={group} accounts={accounts} />
        </div>
      </div>
    </div>
  );
}
