// app/dashboard/page.tsx
import AddAccountModal from "@/components/mvp/AddAccountModal";
import AccountCard from "@/components/mvp/AccountCard";
import SearchInput from "@/components/mvp/SearchInput";

type Props = { searchParams: Promise<{ q?: string }> };

const data = [
  {
    id: "1",
    platformName: "Instagram",
    username: "white_shadow.97",
    category: "Social Media",
  },
  {
    id: "2",
    platformName: "Facebook",
    username: "Ringo Otokuyou",
    category: "Social Media",
  },
  {
    id: "3",
    platformName: "Cooking Dash",
    username: "RedSlate527",
    category: "Game",
  },
  {
    id: "4",
    platformName: "UpWork",
    username: "ringo009@gmail.com",
    category: "Work",
  },
  {
    id: "5",
    platformName: "Gojek",
    username: "Ringo",
    category: "Other",
  },
];

export default async function DashboardPage(props: Props) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";

  return (
    <>
      <div className="p-2 sm:p-1 w-full text-xs text-center text-gray-500 bg-slate-200">
        <p>
          This page is a{" "}
          <span className="text-sky-700">MVP (Minimum Viable Product) </span>
          dashboard from Accault, this is how the Accault beta ver looks like.
          <span className="text-green-700"> This page is readonly.</span>
        </p>
      </div>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* HEADER: Judul & Tombol Tambah */}
          <div className="flex flex-col gap-3 sm:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-full md:w-auto">
              <h1 className="text-2xl font-bold text-gray-800">
                Account Vault
              </h1>
              <p className="text-gray-500 text-sm">Hello, User</p>
            </div>

            <div className="flex w-full md:w-auto gap-3 items-center">
              <SearchInput />
              <AddAccountModal />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((acc) => (
              <AccountCard
                key={acc.id}
                id={acc.id}
                platformName={acc.platformName}
                username={acc.username}
                category={acc.category}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
