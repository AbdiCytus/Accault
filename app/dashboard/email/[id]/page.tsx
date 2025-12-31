// app/dashboard/email/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getEmailById } from "@/actions/email";
import { getEmails } from "@/actions/email";

import Link from "next/link";
import AccountCard from "@/components/AccountCard";
import EmailVerificationButton from "@/components/EmailVerificationButton";
import EditEmailModal from "@/components/EditEmailModal";
import DeleteEmailButton from "@/components/DeleteEmailButton";
import ActionMenu from "@/components/ActionMenu";
import PasswordViewer from "@/components/PasswordViewer";

import {
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  KeyIcon,
  HomeIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

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
        {/* Breadcumb Navigation */}
        <nav className="flex items-center flex-wrap gap-1.5 text-sm text-gray-500 mb-2">
          {/* 1. Dashboard */}
          <Link
            href="/dashboard?tab=emails"
            className="hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-all flex items-center gap-1"
            title="Ke Dashboard Utama">
            <HomeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <ChevronRightIcon className="w-3 h-3 text-gray-400 shrink-0" />

          {/* 2. Halaman Sekarang */}
          <span className="px-2 py-1 text-gray-900 gap-0.5 dark:text-gray-200 font-semibold truncate max-w-50">
            {emailData.email}
          </span>
        </nav>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          {/* Hiasan Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-bl-full -mr-4 -mt-4 z-0"></div>

          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center shrink-0">
                <EnvelopeIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-all">
                  {emailData.email}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {emailData.name || "Tidak ada nama pengguna"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <ActionMenu>
                  <EditEmailModal
                    emailData={emailData}
                    otherEmails={allEmails}
                  />
                  <DeleteEmailButton id={emailData.id} />
                </ActionMenu>
              </div>
              {/* Tombol Verifikasi (Client Component) */}
              <EmailVerificationButton
                emailId={emailData.id}
                isVerified={emailData.isVerified}
              />
            </div>
          </div>

          {/* INFO DETAIL GRID */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
            {/* 2FA Info */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <ShieldCheckIcon
                className={`w-6 h-6 ${
                  emailData.is2FAEnabled ? "text-green-500" : "text-gray-400"
                }`}
              />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                  Keamanan 2FA
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {emailData.is2FAEnabled ? "Aktif" : "Non-Aktif"}
                </p>
              </div>
            </div>

            {/* No HP */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <PhoneIcon className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                  Nomor Telepon
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {emailData.phoneNumber || "-"}
                </p>
              </div>
            </div>

            {/* Email Pemulih */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <EnvelopeIcon className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                  Email Pemulih
                </p>
                <p
                  className="font-medium text-gray-800 dark:text-white truncate max-w-37.5"
                  title={emailData.recoveryEmail?.email}>
                  {emailData.recoveryEmail?.email || "-"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 sm:col-span-2 lg:col-span-3 xl:col-span-1">
              <div className="flex items-center gap-3 mb-1">
                <KeyIcon className="w-6 h-6 text-rose-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                  Password
                </p>
              </div>
              {/* Panggil komponen PasswordViewer dengan emailId */}
              <PasswordViewer emailId={emailData.id} />
            </div>
          </div>
        </div>

        {/* SECTION: AKUN ANAK (THE CHILDREN) */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span>Akun Terhubung</span>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              {emailData.linkedAccounts.length}
            </span>
          </h2>

          {emailData.linkedAccounts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500">
                Tidak ada akun yang menggunakan email ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {emailData.linkedAccounts.map((acc) => (
                <AccountCard
                  key={acc.id}
                  id={acc.id}
                  platformName={acc.platformName}
                  username={acc.username}
                  categories={acc.categories}
                  hasPassword={!!acc.encryptedPassword}
                  icon={acc.icon}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
