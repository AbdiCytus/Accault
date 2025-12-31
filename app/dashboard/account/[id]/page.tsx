// app/dashboard/account/[id]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAccountById } from "@/actions/account";
import { getEmails } from "@/actions/email";
import { getGroups } from "@/actions/group";

import Link from "next/link";
import Image from "next/image";

import PasswordViewer from "@/components/PasswordViewer";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import EditAccountModal from "@/components/EditAccountModal";
import ActionMenu from "@/components/ActionMenu";

import {
  GlobeAltIcon,
  UserCircleIcon,
  HashtagIcon,
  DocumentTextIcon,
  FolderIcon,
  EnvelopeIcon,
  HomeIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import HeaderActionMenu from "@/components/HeaderActionMenu";

type Props = { params: Promise<{ id: string }> };

interface infoCard {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

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
        {/* NAVIGASI BREADCUMB */}
        <nav className="flex items-center flex-wrap gap-1.5 text-sm text-gray-500 mb-2">
          {/* 1. Link ke Dashboard (Selalu Muncul) */}
          <Link
            href="/dashboard"
            className="hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-all flex items-center gap-1"
            title="Ke Dashboard Utama">
            <HomeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* 2. Link ke Group (Hanya jika akun punya group) */}
          {account.group && (
            <>
              <ChevronRightIcon className="w-3 h-3 text-gray-400 shrink-0" />
              <Link
                href={`/dashboard/group/${account.group.id}`}
                className="hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-all flex items-center gap-1 font-medium"
                title={`Kembali ke Folder ${account.group.name}`}>
                <FolderIcon className="w-4 h-4 text-yellow-500" />
                <span className="truncate max-w-37.5">
                  {account.group.name}
                </span>
              </Link>
            </>
          )}

          {/* 3. Indikator Halaman Sekarang (Tidak bisa diklik) */}
          <ChevronRightIcon className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="px-2 py-1 text-gray-900 dark:text-gray-200 font-semibold truncate max-w-50">
            {account.platformName}
          </span>
        </nav>

        {/* HERO SECTION */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Ikon Platform */}
          <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
            {account.icon ? (
              <Image
                src={account.icon}
                alt={account.platformName}
                width={200}
                height={200}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="text-4xl text-gray-200">
                {account.platformName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {account.platformName}
            </h1>
            <div className="flex flex-wrap gap-2">
              {account.categories.map((cat) => (
                <span
                  key={cat}
                  className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* TOMBOL AKSI (Edit & Hapus) */}
          <div className="flex items-center gap-2">
            <ActionMenu>
              <EditAccountModal
                account={account}
                emails={emails}
                groups={groups}
                isIcon={true}
              />
              <DeleteAccountButton
                id={account.id}
                accountName={account.platformName}
                redirectTo={afterDeleteUrl}
                isIcon={true}
              />
            </ActionMenu>
            <HeaderActionMenu
              variant="account"
              scope="single"
              id={account.id}
            />
          </div>
        </div>

        {/* GRID INFORMASI (Sama seperti sebelumnya...) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <InfoCard
              icon={<UserCircleIcon className="w-5 h-5" />}
              label="Username">
              <p className="text-lg font-mono text-gray-800 dark:text-white select-all">
                {account.username}
              </p>
            </InfoCard>

            <InfoCard
              icon={<EnvelopeIcon className="w-5 h-5" />}
              label="Email Terdaftar">
              {account.emailIdentity ? (
                <Link
                  href={`/dashboard/email/${account.emailId}`}
                  className="text-blue-600 hover:underline">
                  {account.emailIdentity.email}
                </Link>
              ) : (
                <span className="text-gray-400 italic">
                  Tidak terhubung ke email master
                </span>
              )}
            </InfoCard>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                <HashtagIcon className="w-5 h-5" /> Password
              </h3>
              {account.encryptedPassword ? (
                <PasswordViewer accountId={account.id} />
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-500 text-sm italic border border-gray-100 dark:border-gray-800">
                  {"This account doesn't have a password"}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <InfoCard
              icon={<GlobeAltIcon className="w-5 h-5" />}
              label="Website">
              {account.website ? (
                <a
                  href={account.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate block">
                  {account.website}
                </a>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </InfoCard>

            <InfoCard
              icon={<FolderIcon className="w-5 h-5" />}
              label="Group Folder">
              {account.group ? (
                <Link
                  href={`/dashboard/group/${account.group.id}`}
                  className="flex items-center gap-2 text-gray-800 dark:text-white hover:text-blue-600">
                  <FolderIcon className="w-4 h-4 text-yellow-500" />
                  {account.group.name}
                </Link>
              ) : (
                <span className="text-gray-400">Tidak ada group</span>
              )}
            </InfoCard>

            <InfoCard
              icon={<DocumentTextIcon className="w-5 h-5" />}
              label="Keterangan / Catatan">
              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                {account.description || "Tidak ada keterangan tambahan."}
              </p>
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component Kecil
function InfoCard({ icon, label, children }: infoCard) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
        {icon} {label}
      </h3>
      <div>{children}</div>
    </div>
  );
}
