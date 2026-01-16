"use client";

import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { FolderOpenIcon } from "@heroicons/react/24/outline";
import type { AccountGroup } from "@/app/generated/prisma/client";
import Link from "next/link";
import ActionMenu from "../menu/ActionMenu";
import EditGroupModal from "../modals/group/EditGroupModal";
import DeleteGroupButton from "../modals/group/DeleteGroupButton";
import ImportExportnMenu from "../menu/ImportExportMenu";

type Props = { group: AccountGroup };

export default function GroupHeader({ group }: Props) {
  return (
    <>
      {/* 1. GROUP BREADCRUMB */}
      <nav className="flex items-center flex-wrap gap-1.5 text-sm text-gray-500 mb-2">
        <Link
          href="/dashboard"
          className="hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-all flex items-center gap-1">
          <HomeIcon className="w-4 h-4" />{" "}
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <ChevronRightIcon className="w-3 h-3 text-gray-400 shrink-0" />
        <span className="px-2 py-1 text-gray-900 dark:text-gray-200 font-semibold truncate max-w-50 flex items-center gap-1">
          <FolderOpenIcon className="w-4 h-4 text-yellow-500" /> {group.name}
        </span>
      </nav>

      {/* 2. GROUP HEADER */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative transition-all">
        <div
          className="absolute top-0 right-0 w-20 h-20 bg-blue-100 dark:bg-blue-900/20 z-0"
          style={{ borderRadius: "0 18.5% 0 100%" }}></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-2xl flex items-center justify-center shrink-0">
              <FolderOpenIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-all">
                {group.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Group</p>
            </div>
          </div>

          <div className="flex flex-row-reverse sm:flex-row items-center gap-2 self-end md:self-auto">
            <ActionMenu>
              <EditGroupModal group={group} isIcon={true} />
              <DeleteGroupButton id={group.id} />
            </ActionMenu>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <ImportExportnMenu variant="group" scope="group" id={group.id} />
          </div>
        </div>
      </div>
    </>
  );
}
