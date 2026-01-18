// actions/profile.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getProfileStats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // --- Ambil semua log 30 hari terakhir ---
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Hapus Log yang lebih tua dari 30 hari (Auto Delete)
  await prisma.activityLog.deleteMany({
    where: {
      userId,
      createdAt: {
        lt: thirtyDaysAgo, // Less than (lebih tua dari) 30 hari lalu
      },
    },
  });

  // 2. Ambil Semua Statistik
  const [
    totalAccounts,
    connectedAccounts,
    totalEmails,
    verifiedEmails,
    totalGroups,
    logs,
  ] = await Promise.all([
    prisma.savedAccount.count({ where: { userId } }),
    prisma.savedAccount.count({ where: { userId, emailId: { not: null } } }),
    prisma.emailIdentity.count({ where: { userId } }),
    prisma.emailIdentity.count({ where: { userId, isVerified: true } }),
    prisma.accountGroup.count({ where: { userId } }),

    // Query Log Diperbarui
    prisma.activityLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { createdAt: "desc" },
      cacheStrategy: {
        ttl: 60,
        swr: 30,
      },
    }),
  ]);

  // 3. Ambil Data Kategori (Sama seperti sebelumnya)
  const accounts = await prisma.savedAccount.findMany({
    where: { userId },
    select: { categories: true },
    cacheStrategy: {
      ttl: 60,
      swr: 30,
    },
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
      connectedAccounts,
      emails: totalEmails,
      verifiedEmails,
      groups: totalGroups,
    },
    chartData: categoryStats,
    logs,
  };
}

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
