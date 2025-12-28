"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";
import { revalidatePath } from "next/cache";

// 1. TAMBAH EMAIL BARU
export async function addEmail(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  // Ambil data dari form
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const is2FA = formData.get("is2FA") === "on"; // Checkbox
  const phoneNumber = formData.get("phoneNumber") as string;
  const recoveryEmailId = formData.get("recoveryEmailId") as string; // ID dari email lain

  if (!email || !password) {
    return { success: false, message: "Email dan Password wajib diisi" };
  }

  // Validasi 2FA
  if (is2FA && !phoneNumber) {
    return { success: false, message: "Nomor HP wajib diisi jika 2FA aktif" };
  }

  try {
    await prisma.emailIdentity.create({
      data: {
        userId: session.user.id,
        name: name || null,
        email: email,
        encryptedPassword: encrypt(password), // Enkripsi password email
        is2FAEnabled: is2FA,
        phoneNumber: is2FA ? phoneNumber : null,
        recoveryEmailId: recoveryEmailId || null,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Email berhasil ditambahkan" };
  } catch (error) {
    console.error("Gagal tambah email:", error);
    return {
      success: false,
      message: "Gagal menambah email (Mungkin email sudah ada)",
    };
  }
}

// 2. AMBIL DAFTAR EMAIL
export async function getEmails() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const emails = await prisma.emailIdentity.findMany({
    where: { userId: session.user.id },
    include: {
      recoveryEmail: { select: { email: true } }, // Ambil info email pemulih
      _count: { select: { linkedAccounts: true } }, // Hitung anak akun
    },
    orderBy: { createdAt: "desc" },
  });

  return emails;
}

// 3. AMBIL PASSWORD EMAIL (Untuk Show Password)
export async function getEmailPassword(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, password: "" };

  const data = await prisma.emailIdentity.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!data) return { success: false, password: "" };

  return { success: true, password: decrypt(data.encryptedPassword) };
}

// 4. HAPUS EMAIL
export async function deleteEmail(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.emailIdentity.delete({
      where: { id, userId: session.user.id },
    });

    // Karena di Schema kita pakai onDelete: SetNull pada SavedAccount,
    // maka akun-akun yang terhubung otomatis field emailId-nya jadi NULL.
    // Tidak perlu update manual. Aman.

    revalidatePath("/dashboard");
    return { success: true, message: "Email berhasil dihapus" };
  } catch (err) {
    console.error("Gagal menghapus email", err);
    return { success: false, message: "Gagal hapus email" };
  }
}
