// app/dashboard/account/[id]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAccountById } from "@/actions/account";
import { getEmails } from "@/actions/email";
import { getGroups } from "@/actions/group";

import AccountHeader from "@/components/detail/AccountHeader";
import AccountClient from "@/components/detail/AccountClient";

type Props = { params: Promise<{ id: string }> };

export default async function AccountDetailPage(props: Props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const account = await getAccountById(params.id);
  if (!account) notFound();

  const [emails, groups] = await Promise.all([getEmails(), getGroups()]);

  const afterDeleteUrl = account.group
    ? `/dashboard/group/${account.group.id}`
    : "/dashboard";

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-4xl mx-auto space-y-6">
        <AccountHeader
          account={account}
          emails={emails}
          groups={groups}
          afterDeleteUrl={afterDeleteUrl}
        />
        <AccountClient account={account} />
      </div>
    </div>
  );
}
