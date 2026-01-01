// app/dashboard/email/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getEmailById } from "@/actions/email";
import { getEmails } from "@/actions/email";

import EmailHeader from "@/components/detail/EmailHeader";
import EmailClient from "@/components/detail/EmailClient";

type Props = { params: Promise<{ id: string }> };

export default async function EmailDetailPage(props: Props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const emailData = await getEmailById(params.id);
  if (!emailData) notFound();

  const allEmails = await getEmails();

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-5xl mx-auto space-y-8">
        <EmailHeader emailData={emailData} allEmails={allEmails} />
        <EmailClient emailData={emailData} />
      </div>
    </div>
  );
}
