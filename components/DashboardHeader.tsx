import AddDataModal from "./modals/AddDataModal";
import SearchInput from "./dashboard/SearchInput";
import ImportExportMenu from "./menu/ImportExportMenu";
import ProfilePict from "./ProfilePict";

type Props = {
  session: { user?: { name: string } };
  emails: { id: string; email: string }[];
  groups: { id: string; name: string }[];
};

export default async function DashboardHeader({
  session,
  emails,
  groups,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4 transition-colors">
      <div className="w-full md:w-auto flex gap-3 items-center">
        <ProfilePict />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            Manage Accounts
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Hello, <span className="font-medium">{session.user?.name}</span>
          </p>
        </div>
      </div>

      <div className="flex w-full md:w-auto gap-3 sm:items-center">
        <SearchInput />
        <div className="flex gap-2 items-center">
          <ImportExportMenu variant="dashboard" scope="all" />
          <AddDataModal existingEmails={emails} existingGroups={groups} />
        </div>
      </div>
    </div>
  );
}
