// components/DashboardClient.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { UserIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import AccountCard from "./AccountCard";
import GroupCard from "./GroupCard";
import EmailCard from "./EmailCard";

import type {
  SavedAccount,
  AccountGroup,
  EmailIdentity,
} from "@/app/generated/prisma/client";

type AccountWithRelations = SavedAccount & {
  emailIdentity: { email: string } | null;
  group: { name: string } | null;
};

type GroupWithCount = AccountGroup & {
  _count: { accounts: number };
};

type EmailWithRelations = EmailIdentity & {
  recoveryEmail?: { email: string } | null;
  _count: { linkedAccounts: number };
};

// Tipe data yang diterima dari Server
type DashboardProps = {
  accounts: AccountWithRelations[];
  groups: GroupWithCount[];
  emails: EmailWithRelations[];
  query: string;
};

export default function DashboardClient({
  accounts,
  groups,
  emails,
  query,
}: DashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab =
    searchParams.get("tab") === "emails" ? "emails" : "accounts";

  const handleTabChange = (tab: "accounts" | "emails") => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* 1. TOGGLE SWITCHER */}
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-xl flex gap-1 shadow-inner">
          <button
            onClick={() => handleTabChange("accounts")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "accounts"
                ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}>
            <UserIcon className="w-4 h-4" />
            Akun & Group
          </button>
          <button
            onClick={() => handleTabChange("emails")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "emails"
                ? "bg-white dark:bg-gray-800 text-purple-600 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}>
            <EnvelopeIcon className="w-4 h-4" />
            Email Master
          </button>
        </div>
      </div>

      {/* 2. AREA KONTEN */}
      {activeTab === "accounts" ? (
        /* --- MODE AKUN --- */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Section Group */}
          {groups.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  count={group._count.accounts}
                />
              ))}
            </div>
          )}

          {/* Section Akun */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.length === 0 && groups.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500">
                  {query
                    ? `Tidak ada akun/grup dengan kata kunci "${query}"`
                    : "Belum ada akun atau grup."}
                </p>
              </div>
            ) : (
              accounts.map((acc) => (
                <AccountCard
                  key={acc.id}
                  id={acc.id}
                  platformName={acc.platformName}
                  username={acc.username}
                  categories={acc.categories}
                  email={acc.emailIdentity?.email}
                  hasPassword={!!acc.encryptedPassword}
                  icon={acc.icon}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        /* --- MODE EMAIL --- */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {emails.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500">
                {query
                  ? `Tidak ada email dengan kata kunci "${query}"`
                  : "Belum ada email master."}
              </p>
            </div>
          ) : (
            emails.map((email) => (
              <EmailCard
                key={email.id}
                id={email.id}
                email={email.email}
                name={email.name}
                isVerified={email.isVerified}
                linkedCount={email._count.linkedAccounts}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
