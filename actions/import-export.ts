// actions/import-export.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type {
  AccountExportData,
  ImportRowData,
  ExportResult,
  EmailExportData,
} from "@/types/import-export";
import { Prisma } from "@/app/generated/prisma/client"; // Pastikan path ini sesuai dengan generate client Anda
import { logActivity } from "@/lib/logger";
import { encrypt, decrypt } from "@/lib/crypto";

// --- 1. DEFINISI TIPE KHUSUS PRISMA (Agar Relasi Terbaca) ---

// Tipe untuk data Email + Relasi (Recovery Email & Count)
type EmailWithRelations = Prisma.EmailIdentityGetPayload<{
  include: {
    recoveryEmail: { select: { email: true } };
    _count: { select: { linkedAccounts: true } };
  };
}>;

// Tipe untuk data Akun + Relasi (Email Identity & Group)
type AccountWithRelations = Prisma.SavedAccountGetPayload<{
  include: {
    emailIdentity: { select: { email: true } };
    group: { select: { name: true } };
  };
}>;

// ---------------------------------------------------------
// 2. ACTION EXPORT
// ---------------------------------------------------------
export async function getExportData(
  scope: "all" | "group" | "single" | "emails",
  id?: string,
): Promise<{ success: boolean; data?: ExportResult[]; message?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    // A. EXPORT EMAIL
    if (scope === "emails") {
      const emails = await prisma.emailIdentity.findMany({
        where: { userId: session.user.id },
        include: {
          recoveryEmail: { select: { email: true } },
          _count: { select: { linkedAccounts: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      // [CRITICAL FIX] Casting ke tipe helper agar properti relasi dikenali
      const typedEmails = emails as unknown as EmailWithRelations[];

      const formattedData: EmailExportData[] = typedEmails.map((e) => ({
        Name: e.name || "-",
        Email: e.email,
        "Phone Number": e.phoneNumber || "-",
        "2FA Enabled": e.is2FAEnabled ? "Yes" : "No",
        Verified: e.isVerified ? "Yes" : "No",
        "Recovery Email": e.recoveryEmail?.email || "-",
        "Total Accounts": e._count.linkedAccounts,
      }));

      await logActivity(
        session.user.id,
        "CREATE",
        "Email",
        `Exported ${emails.length} Emails`,
      );
      return { success: true, data: formattedData };
    }

    // B. EXPORT AKUN
    const whereClause: Prisma.SavedAccountWhereInput = {
      userId: session.user.id,
    };

    if (scope === "group" && id) {
      whereClause.groupId = id;
    } else if (scope === "single" && id) {
      whereClause.id = id;
    }

    const accounts = await prisma.savedAccount.findMany({
      where: whereClause,
      include: {
        emailIdentity: { select: { email: true } },
        group: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // [CRITICAL FIX] Casting ke tipe helper
    const typedAccounts = accounts as unknown as AccountWithRelations[];

    const formattedData: AccountExportData[] = typedAccounts.map((acc) => {
      let plainPassword = null;
      if (acc.encryptedPassword) {
        try {
          plainPassword = decrypt(acc.encryptedPassword);
        } catch (error) {
          console.error(`Password Decrypt Error: ${acc.platformName}`, error);
          plainPassword = "";
        }
      }

      return {
        platformName: acc.platformName,
        username: acc.username,
        password: plainPassword,
        email: acc.emailIdentity?.email || null,
        group: acc.group?.name || null,
        categories: acc.categories.join(", "),
        website: acc.website || null,
        description: acc.description || null,
      };
    });

    await logActivity(
      session.user.id,
      "CREATE",
      "Account",
      `Exported Accounts`,
    );
    return { success: true, data: formattedData };
  } catch (error) {
    console.error("Export Error:", error);
    return { success: false, message: "Failed Getting Export Data" };
  }
}

// ---------------------------------------------------------
// 3. ACTION IMPORT
// ---------------------------------------------------------
export async function importAccounts(
  data: ImportRowData[],
  targetGroupId?: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  let successCount = 0;
  let failCount = 0;

  try {
    for (const row of data) {
      // Validasi sederhana
      if (!row.platformName || !row.username) {
        failCount++;
        continue;
      }

      let finalGroupId: string | null = targetGroupId || null;

      // 1. Handle Group Logic (Cari atau Buat baru jika belum ada ID target)
      if (!finalGroupId && row.group) {
        const existingGroup = await prisma.accountGroup.findFirst({
          where: { name: row.group, userId: session.user.id },
        });

        if (existingGroup) {
          finalGroupId = existingGroup.id;
        } else {
          const newGroup = await prisma.accountGroup.create({
            data: { name: row.group, userId: session.user.id },
          });
          finalGroupId = newGroup.id;
        }
      }

      // 2. Handle Email Linking
      let emailId: string | null = null;
      if (row.email) {
        const emailRecord = await prisma.emailIdentity.findFirst({
          where: { email: row.email, userId: session.user.id },
        });
        if (emailRecord) emailId = emailRecord.id;
      }

      // 3. Handle Categories
      const categoriesArray = row.categories
        ? row.categories.split(",").map((c) => c.trim())
        : ["Imported"];

      // 4. Create Account
      await prisma.savedAccount.create({
        data: {
          userId: session.user.id,
          platformName: row.platformName,
          username: row.username,
          encryptedPassword: row.password ? encrypt(row.password) : null,
          website: row.website,
          description: row.description,
          categories: categoriesArray,
          emailId: emailId,
          groupId: finalGroupId,
          icon: null,
        },
      });

      successCount++;
    }

    revalidatePath("/dashboard");
    if (targetGroupId) revalidatePath(`/dashboard/group/${targetGroupId}`);

    await logActivity(
      session.user.id,
      "CREATE",
      "Account",
      `Accounts Imported: ${successCount} Success, ${failCount} Failed`,
    );
    return {
      success: true,
      message: `Import Done: ${successCount} Success, ${failCount} Failed`,
    };
  } catch (error) {
    await logActivity(
      session.user.id,
      "CREATE",
      "Account",
      `Failed Import Account`,
    );
    console.error("Import Action Error:", error);
    return { success: false, message: "Failed Import Account" };
  }
}
