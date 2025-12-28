// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAccounts } from "@/actions/account";
import AddAccountModal from "@/components/AddAccountModal";
import AccountCard from "@/components/AccountCard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 1. Ambil Data Akun (Server Side Fetching) 🚀
  const accounts = await getAccounts();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER: Judul & Tombol Tambah */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Brankas Akun</h1>
            <p className="text-gray-500">Halo, {session.user?.name}</p>
          </div>
          <AddAccountModal />
        </div>

        {/* LIST AKUN (GRID) */}
        {accounts.length === 0 ? (
          // State Kosong
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">
              Belum ada akun yang disimpan.
            </p>
            <p className="text-sm text-gray-400">
              {`Klik tombol "Tambah Akun" untuk mulai.`}
            </p>
          </div>
        ) : (
          // State Ada Data
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                id={account.id}
                platformName={account.platformName}
                username={account.username}
                category={account.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
