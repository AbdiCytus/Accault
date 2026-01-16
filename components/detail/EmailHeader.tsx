import {
  ChevronRightIcon,
  EnvelopeIcon,
  HomeIcon,
  KeyIcon,
  PhoneIcon,
  UserCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import ActionMenu from "../menu/ActionMenu";
import DeleteEmailButton from "../modals/email/DeleteEmailButton";
import EditEmailModal from "../modals/email/EditEmailModal";
import EmailVerificationButton from "../EmailVerificationButton";
import PasswordViewer from "../PasswordViewer";

import { EmailQuery } from "@/types/email";

interface Props {
  emailData: EmailQuery;
  allEmails: { id: string; email: string }[];
}

export default function EmailHeader({ emailData, allEmails }: Props) {
  return (
    <>
      {/* 1. EMAIL BREADCRUMB */}
      <nav className="flex items-center flex-wrap gap-1.5 text-sm text-gray-500 mb-2">
        <Link
          href="/dashboard?tab=emails"
          className="hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-all flex items-center gap-1"
          title="Ke Dashboard Utama">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        <ChevronRightIcon className="w-3 h-3 text-gray-400 shrink-0" />

        <span className="text-gray-900 gap-0.5 dark:text-gray-200 font-semibold truncate max-w-50">
          {emailData.email}
        </span>
      </nav>

      {/* 2. HEADER */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-bl-full -mr-4 -mt-4 z-0"></div>

        <div className="relative z-10 flex sm:flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center shrink-0">
              <EnvelopeIcon className="w-5 h-5 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="sm:hidden text-xl font-bold text-gray-900 dark:text-white">
                Detail
              </h1>
              <h1 className="hidden sm:block text-lg sm:text-3xl font-bold text-gray-900 dark:text-white break-all">
                {emailData.email}
              </h1>
              <p className="hidden sm:block text-gray-500 dark:text-gray-400 text-sm sm:text-md">
                {emailData.name || "This Email Doesn't Has Name"}
              </p>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div>
              <ActionMenu>
                <EditEmailModal emailData={emailData} otherEmails={allEmails} />
                <DeleteEmailButton id={emailData.id} />
              </ActionMenu>
            </div>

            <EmailVerificationButton
              emailId={emailData.id}
              isVerified={emailData.isVerified}
            />
          </div>
        </div>

        {/* DETAIL GRID */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
          {/* Email & Username (MOBILE ONLY*/}
          <div className="sm:hidden flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <EnvelopeIcon className="w-6 h-6 text-purple-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                Email
              </p>
              <p
                className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-70"
                title={emailData.email}>
                {emailData.email}
              </p>
            </div>
          </div>

          <div className="sm:hidden flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <UserCircleIcon className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                Username
              </p>
              <p
                className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-70"
                title={emailData.name ? emailData.name : "User"}>
                {emailData.name ? emailData.name : "-"}
              </p>
            </div>
          </div>
          {/* 2FA*/}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <ShieldCheckIcon
              className={`w-6 h-6 ${
                emailData.is2FAEnabled ? "text-green-500" : "text-gray-400"
              }`}
            />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                2FA
              </p>
              <p className="font-medium text-gray-800 dark:text-white">
                {emailData.is2FAEnabled ? "Active" : "Not Active"}
              </p>
            </div>
          </div>

          {/* Telephone Number */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <PhoneIcon className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                Telephone Number
              </p>
              <p className="font-medium text-gray-800 dark:text-white">
                {emailData.phoneNumber || "-"}
              </p>
            </div>
          </div>

          {/* Email Recovery*/}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <EnvelopeIcon className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                Email Recovery
              </p>
              <p
                className="text-sm sm:text-md font-medium text-gray-800 dark:text-white truncate max-w-70"
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
            {/* View Password */}
            <PasswordViewer emailId={emailData.id} />
          </div>
        </div>
      </div>
    </>
  );
}
