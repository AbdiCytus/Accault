// actions/profile.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache"; // Import revalidatePath

export async function getProfileStats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // 1. Ambil Semua Statistik dalam satu Promise.all agar efisien
  const [
    totalAccounts,
    connectedAccounts, // Baru
    totalEmails,
    verifiedEmails, // Baru
    totalGroups,
    logs,
  ] = await Promise.all([
    // Hitung Total Akun
    prisma.savedAccount.count({ where: { userId } }),
    // Hitung Akun yg Punya Email (emailId tidak null)
    prisma.savedAccount.count({ where: { userId, emailId: { not: null } } }),

    // Hitung Total Email
    prisma.emailIdentity.count({ where: { userId } }),
    // Hitung Email yg Terverifikasi (isVerified = true)
    prisma.emailIdentity.count({ where: { userId, isVerified: true } }),

    prisma.accountGroup.count({ where: { userId } }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // 2. Ambil Data Kategori (Tetap sama)
  const accounts = await prisma.savedAccount.findMany({
    where: { userId },
    select: { categories: true },
  });

  const categoryStats: Record<string, number> = {};
  accounts.forEach((acc) => {
    acc.categories.forEach((cat) => {
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
  });

  return {
    user: session.user,
    stats: {
      accounts: totalAccounts,
      connectedAccounts, // Kirim data baru
      emails: totalEmails,
      verifiedEmails, // Kirim data baru
      groups: totalGroups,
    },
    chartData: categoryStats,
    logs,
  };
}

// --- ACTION BARU: CLEAR ALL LOGS ---
export async function clearAllActivities() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.activityLog.deleteMany({
      where: { userId: session.user.id },
    });

    revalidatePath("/dashboard/profile");
    return { success: true, message: "History cleared" };
  } catch (error) {
    console.error("Clear logs error:", error);
    return { success: false, message: "Failed to clear history" };
  }
}
