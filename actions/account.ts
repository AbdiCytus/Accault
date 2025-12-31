"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";

interface ActionResponse {
  success: boolean;
  message: string;
}

export async function addAccount(formData: FormData): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  // Ambil data
  const platform = formData.get("platform") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const noPassword = formData.get("noPassword") === "on";
  const noEmail = formData.get("noEmail") === "on";
  const emailId = formData.get("emailId") as string;
  const groupId = formData.get("groupId") as string;
  const website = formData.get("website") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;
  const categories = formData.getAll("category") as string[];

  // Validasi Dasar
  if (!platform || !username) {
    return { success: false, message: "Platform dan Username wajib diisi" };
  }
  if (categories.length === 0) {
    return { success: false, message: "Minimal pilih satu kategori" };
  }

  // Validasi Logika "No Password" & "No Email"
  let finalEncryptedPass: string | null = null;
  if (!noPassword) {
    if (!password)
      return {
        success: false,
        message: "Password wajib diisi (kecuali dicentang No Password)",
      };
    finalEncryptedPass = encrypt(password);
  }

  let finalEmailId: string | null = null;
  if (!noEmail && emailId) {
    finalEmailId = emailId;
  }

  try {
    await prisma.savedAccount.create({
      data: {
        userId: session.user.id,
        platformName: platform,
        username: username,
        encryptedPassword: finalEncryptedPass,
        categories: categories,
        emailId: finalEmailId,
        groupId: groupId || null,
        website: website || null,
        description: description || null,
        icon: icon || null,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Akun berhasil disimpan" };
  } catch (error) {
    console.error("Gagal simpan akun:", error);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

export async function getAccounts(query?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const whereCondition: Prisma.SavedAccountWhereInput = {
    userId: session.user.id,
  };

  if (query) {
    whereCondition.OR = [
      { platformName: { contains: query, mode: "insensitive" } },
      { username: { contains: query, mode: "insensitive" } },
    ];
  }

  return await prisma.savedAccount.findMany({
    where: whereCondition,
    include: {
      emailIdentity: { select: { email: true } },
      group: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAccountById(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return await prisma.savedAccount.findUnique({
    where: { id, userId: session.user.id },
    include: {
      emailIdentity: { select: { email: true, name: true } }, // Ambil info email terhubung
      group: { select: { id: true, name: true } }, // Ambil info grup
    },
  });
}

export async function updateAccount(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const id = formData.get("id") as string;

  // Ambil Data Form
  const platform = formData.get("platform") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const noPassword = formData.get("noPassword") === "on";

  const emailId = formData.get("emailId") as string;
  const noEmail = formData.get("noEmail") === "on";

  const groupIdRaw = formData.get("groupId") as string;
  const groupId = groupIdRaw || null;

  const website = formData.get("website") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;
  const categories = formData.getAll("category") as string[];

  const isIconDeleted = formData.get("isIconDeleted") === "true";

  if (!platform || !username) {
    return { success: false, message: "Platform & Username wajib" };
  }

  let passwordUpdate: { encryptedPassword?: string | null } = {};
  if (noPassword) passwordUpdate = { encryptedPassword: null };
  else if (password && password.trim() !== "") {
    passwordUpdate = { encryptedPassword: encrypt(password) };
  }

  // LOGIKA EMAIL:
  let emailUpdate: { emailId?: string | null } = {};
  if (noEmail) emailUpdate = { emailId: null };
  else if (emailId) emailUpdate = { emailId: emailId };

  let iconUpdate: string | null | undefined = undefined;
  if (icon) iconUpdate = icon;
  else if (isIconDeleted) iconUpdate = null;

  try {
    await prisma.savedAccount.update({
      where: { id, userId: session.user.id },
      data: {
        platformName: platform,
        username,
        categories,
        groupId: groupId,
        website: website || null,
        description: description || null,
        icon: iconUpdate,
        ...passwordUpdate,
        ...emailUpdate,
      },
    });

    const redirectPath = groupId ? `/dashboard/group/${groupId}` : "/dashboard";

    // Revalidate halaman detail dan dashboard
    revalidatePath(`/dashboard/account/${id}`);
    revalidatePath("/dashboard");

    return { success: true, message: "Perubahan disimpan!", redirectPath };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal update akun" };
  }
}

export async function deleteAccount(accountId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) return { success: false };

  try {
    await prisma.savedAccount.delete({
      where: {
        id: accountId,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Data gagal dihapus", err);
    return { success: false };
  }
}

export async function getAccountPassword(accountId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, password: "" };

  const account = await prisma.savedAccount.findUnique({
    where: { id: accountId, userId: session.user.id },
  });

  if (!account || !account.encryptedPassword)
    return { success: false, password: "" };

  return { success: true, password: decrypt(account.encryptedPassword) };
}

export async function removeAccountFromGroup(accountId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    // 1. Cek dulu akun ini ada di group mana (untuk keperluan revalidate path)
    const account = await prisma.savedAccount.findUnique({
      where: { id: accountId, userId: session.user.id },
      select: { groupId: true },
    });

    if (!account) return { success: false, message: "Akun tidak ditemukan" };
    if (!account.groupId)
      return { success: false, message: "Akun tidak berada di dalam group" };

    // 2. Update groupId menjadi NULL (Keluarkan dari group)
    await prisma.savedAccount.update({
      where: { id: accountId },
      data: { groupId: null },
    });

    // 3. Refresh Data di Halaman Terkait
    revalidatePath("/dashboard"); // Refresh Dashboard
    revalidatePath(`/dashboard/group/${account.groupId}`); // Refresh Halaman Group asal
    revalidatePath(`/dashboard/account/${accountId}`); // Refresh Detail Akun itu sendiri

    return { success: true, message: "Berhasil dikeluarkan dari group" };
  } catch (error) {
    console.error("Gagal keluar group:", error);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

export async function moveAccountToGroup(accountId: string, groupId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    // 1. Validasi: Pastikan Akun milik user
    const account = await prisma.savedAccount.findUnique({
      where: { id: accountId, userId: session.user.id },
    });

    if (!account) return { success: false, message: "Akun tidak ditemukan" };

    // 2. Validasi: Pastikan Group milik user
    const group = await prisma.accountGroup.findUnique({
      where: { id: groupId, userId: session.user.id },
    });

    if (!group) return { success: false, message: "Group tidak ditemukan" };

    // 3. Update Akun
    await prisma.savedAccount.update({
      where: { id: accountId },
      data: { groupId: groupId },
    });

    // 4. Refresh Halaman
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/group/${groupId}`);

    return { success: true, message: `Berhasil dipindahkan ke ${group.name}` };
  } catch (error) {
    console.error("Gagal memindahkan akun:", error);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}
// --- BATCH ACTIONS ---

export async function deleteBulkAccounts(accountIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.savedAccount.deleteMany({
      where: {
        id: { in: accountIds },
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      message: `${accountIds.length} akun berhasil dihapus`,
    };
  } catch (error) {
    console.error("Bulk delete accounts error:", error);
    return { success: false, message: "Gagal menghapus akun" };
  }
}

export async function deleteBulkGroups(groupIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    // Opsional: Hapus akun di dalamnya dulu atau set null, tergantung rule database (Cascade/SetNull).
    // Asumsi Prisma schema menggunakan Cascade delete atau kita hapus akun dulu:
    await prisma.savedAccount.deleteMany({
      where: { groupId: { in: groupIds }, userId: session.user.id },
    });

    await prisma.accountGroup.deleteMany({
      where: {
        id: { in: groupIds },
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      message: `${groupIds.length} group berhasil dihapus`,
    };
  } catch (error) {
    console.error("Bulk delete groups error:", error);
    return { success: false, message: "Gagal menghapus group" };
  }
}

export async function moveBulkAccountsToGroup(
  accountIds: string[],
  groupId: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const group = await prisma.accountGroup.findUnique({
      where: { id: groupId, userId: session.user.id },
    });
    if (!group)
      return { success: false, message: "Group tujuan tidak ditemukan" };

    await prisma.savedAccount.updateMany({
      where: {
        id: { in: accountIds },
        userId: session.user.id,
      },
      data: { groupId },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/group/${groupId}`);
    return {
      success: true,
      message: `${accountIds.length} akun dipindahkan ke ${group.name}`,
    };
  } catch (error) {
    console.error("Bulk move error:", error);
    return { success: false, message: "Gagal memindahkan akun" };
  }
}

export async function removeBulkAccountsFromGroup(accountIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.savedAccount.updateMany({
      where: {
        id: { in: accountIds },
        userId: session.user.id,
      },
      data: { groupId: null }, // Set null untuk mengeluarkan
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      message: `${accountIds.length} akun dikeluarkan dari group`,
    };
  } catch (error) {
    console.error("Bulk remove group error:", error);
    return { success: false, message: "Gagal mengeluarkan akun dari group" };
  }
}
