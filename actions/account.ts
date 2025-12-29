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
  const icon = formData.get("icon") as string
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
    groupId: null,
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
  const platform = formData.get("platform") as string;
  const username = formData.get("username") as string;
  const categories = formData.getAll("category") as string[];

  // Logic update yang lain bisa disusul saat kita buat UI Editnya
  // ...

  try {
    await prisma.savedAccount.update({
      where: { id, userId: session.user.id },
      data: {
        platformName: platform,
        username,
        categories,
        // ... field lain
      },
    });
    revalidatePath("/dashboard");
    return { success: true, message: "Akun diupdate" };
  } catch (error) {
    console.error("Gagal update akun:", error);
    return { success: false, message: "Gagal update" };
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
