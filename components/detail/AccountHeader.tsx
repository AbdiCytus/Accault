"use client";

import {
  ChevronRightIcon,
  FolderIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import ActionMenu from "../menu/ActionMenu";
import EditAccountModal from "../modals/account/EditAccountModal";
import DeleteAccountButton from "../modals/account/DeleteAccountButton";
import ImportExportMenu from "../menu/ImportExportMenu";

import { AccountGroup, EmailIdentity } from "@/app/generated/prisma/client";
import { AccountQuery } from "@/types/account";

interface Account {
  account: AccountQuery;
  emails: EmailIdentity[];
  groups: AccountGroup[];
  afterDeleteUrl: string;
}

export default function AccountHeader({
  account,
  emails,
  groups,
  afterDeleteUrl,
}: Account) {
  return (
    <>
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center flex-wrap gap-1.5 text-sm text-gray-500 mb-2">
        <Link
          href="/dashboard"
          className="hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-all flex items-center gap-1"
          title="Ke Dashboard Utama">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        {account.group && (
          <>
            <ChevronRightIcon className="w-3 h-3 text-gray-400 shrink-0" />
            <Link
              href={`/dashboard/group/${account.group.id}`}
              className="hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-all flex items-center gap-1 font-medium"
              title={`Kembali ke Folder ${account.group.name}`}>
              <FolderIcon className="w-4 h-4 text-yellow-500" />
              <span className="truncate max-w-37.5">{account.group.name}</span>
            </Link>
          </>
        )}

        <ChevronRightIcon className="w-3 h-3 text-gray-400 shrink-0" />
        <span className="px-2 py-1 text-gray-900 dark:text-gray-200 font-semibold truncate max-w-50">
          {account.platformName}
        </span>
      </nav>

      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between md:flex-row items-start md:items-center">
        <div className="flex gap-5">
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

          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {account.platformName}
            </h1>
            <div className="flex flex-wrap gap-2">
              {account.categories.map((cat) => (
                <span
                  key={cat}
                  className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full sm:max-w-max justify-end">
          <div className="flex flex-row-reverse sm:flex-row items-center gap-2">
            <ActionMenu>
              <EditAccountModal
                account={account}
                emails={emails}
                groups={groups}
              />
              <DeleteAccountButton
                id={account.id}
                accountName={account.platformName}
                redirectTo={afterDeleteUrl}
              />
            </ActionMenu>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <ImportExportMenu
              variant="account"
              scope="single"
              id={account.id}
            />
          </div>
        </div>
      </div>
    </>
  );
}
