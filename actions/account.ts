"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/crypto";
import { revalidatePath } from "next/cache";

interface ActionResponse {
  success: boolean;
  message: string;
}

export async function addAccount(formData: FormData): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id)
    return { success: false, message: "Login dulu!" };

  const platform = formData.get("platform") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const category = (formData.get("category") as string) || "Other";

  if (!platform || !username || !password)
    return { success: false, message: "Semua data wajib diisi." };

  try {
    const encryptedPassword = encrypt(password);
    await prisma.savedAccount.create({
      data: {
        platformName: platform,
        username: username,
        encryptedPassword: encryptedPassword,
        category: category,
        userId: session.user.id,
      },
    });
    return { success: true, message: "Data berhasil ditambahkan!" };
  } catch (err) {
    console.error("Gagal simpan akun:", err);
    return { success: false, message: "Terjadi kesalahan server." };
  }
}

export async function getAccounts() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) return [];
  try {
    const accounts = await prisma.savedAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return accounts;
  } catch (err) {
    console.error("Gagal ambil data:", err);
    return [];
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
  if (!session || !session.user?.id) return { success: false, password: "" };

  try {
    const account = await prisma.savedAccount.findUnique({
      where: {
        id: accountId,
        userId: session.user.id,
      },
    });

    if (!account) return { success: false, password: "" };

    const realPassword = decrypt(account.encryptedPassword);

    return { success: true, password: realPassword };
  } catch (error) {
    console.error("Gagal dekripsi:", error);
    return { success: false, password: "" };
  }
}
