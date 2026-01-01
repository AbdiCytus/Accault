"use client";

import {
  DocumentTextIcon,
  EnvelopeIcon,
  FolderIcon,
  GlobeAltIcon,
  HashtagIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import PasswordViewer from "../PasswordViewer";
import { AccountQuery } from "@/types/account";

interface infoCard {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

type Account = { account: AccountQuery };

export default function AccountClient({ account }: Account) {
  return (
    <>
      {/* 3. BODY */}
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
            label="Email Connected">
            {account.emailIdentity ? (
              <Link
                href={`/dashboard/email/${account.emailId}`}
                className="text-blue-600 hover:underline">
                {account.emailIdentity.email}
              </Link>
            ) : (
              <span className="text-gray-400 italic">
                {"This account's not connected from any email"}
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
          <InfoCard icon={<GlobeAltIcon className="w-5 h-5" />} label="Website">
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

          <InfoCard icon={<FolderIcon className="w-5 h-5" />} label="Group">
            {account.group ? (
              <Link
                href={`/dashboard/group/${account.group.id}`}
                className="flex items-center gap-2 text-gray-800 dark:text-white hover:text-blue-600">
                <FolderIcon className="w-4 h-4 text-yellow-500" />
                {account.group.name}
              </Link>
            ) : (
              <span className="text-gray-400 italic">
                {"This account's not from any group"}
              </span>
            )}
          </InfoCard>

          <InfoCard
            icon={<DocumentTextIcon className="w-5 h-5" />}
            label="Notes">
            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
              {account.description || "-"}
            </p>
          </InfoCard>
        </div>
      </div>
    </>
  );
}

// Helper Component
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
