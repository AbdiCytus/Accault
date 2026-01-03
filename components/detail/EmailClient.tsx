import AccountCard from "../cards/AccountCard";
import { EmailQuery } from "@/types/email";

type Props = { emailData: EmailQuery };

export default function EmailClient({ emailData }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <span>Connected Accounts</span>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
          {emailData.linkedAccounts.length}
        </span>
      </h2>

      {emailData.linkedAccounts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500">
            {"There's no account connected with this email"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
}
