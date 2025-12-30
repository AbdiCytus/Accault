"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";

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
        email: email.toLowerCase(),
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
export async function getEmails(query?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const whereCondition: Prisma.EmailIdentityWhereInput = {
    userId: session.user.id,
  };
  if (query) {
    whereCondition.OR = [
      { email: { contains: query, mode: "insensitive" } },
      { name: { contains: query, mode: "insensitive" } },
    ];
  }

  const emails = await prisma.emailIdentity.findMany({
    where: whereCondition,
    include: {
      // Ambil info email pemulih
      _count: { select: { linkedAccounts: true } },
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

// 5. AMBIL DETAIL EMAIL (+ AKUN TERHUBUNG)
export async function getEmailById(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return await prisma.emailIdentity.findUnique({
    where: { id, userId: session.user.id },
    include: {
      recoveryEmail: { select: { email: true } },
      linkedAccounts: true, // Ambil semua akun anak
    },
  });
}

// 6. TOGGLE VERIFIKASI EMAIL
export async function toggleEmailVerification(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const email = await prisma.emailIdentity.findUnique({
      where: { id, userId: session.user.id },
      select: { isVerified: true },
    });

    if (!email) return { success: false, message: "Email tidak ditemukan" };

    // Ubah status kebalikannya (True <-> False)
    // Catatan: Di aplikasi real, ini harusnya mengirim email.
    // Untuk tahap ini kita buat switch manual dulu agar UI bekerja.
    await prisma.emailIdentity.update({
      where: { id },
      data: { isVerified: !email.isVerified },
    });

    revalidatePath(`/dashboard/email/${id}`);
    revalidatePath("/dashboard");
    return {
      success: true,
      message: email.isVerified ? "Verifikasi dicabut" : "Email terverifikasi",
    };
  } catch (error) {
    console.error("Gagal update status", error);
    return { success: false, message: "Gagal update status" };
  }
}

export async function updateEmail(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const id = formData.get("id") as string;
  const newEmail = formData.get("email") as string;
  // const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const is2FA = formData.get("is2FA") === "on";
  const phoneNumber = formData.get("phoneNumber") as string;
  const recoveryEmailId = formData.get("recoveryEmailId") as string;

  const currentData = await prisma.emailIdentity.findUnique({
    where: { id, userId: session.user.id },
  });

  // Validasi dasar
  if (!currentData) return { success: false, message: "Data tidak ditemukan" };
  if (!email) return { success: false, message: "Email wajib diisi" };

  const isEmailChanged = currentData.email !== newEmail;

  // Jika berubah, kita reset status verifikasi
  let verificationReset = {};
  if (isEmailChanged) {
    verificationReset = {
      isVerified: false,
      verificationToken: null,
      tokenExpiresAt: null,
    };
  }

  // Logic Password (hanya update jika diisi)
  let passwordUpdate = {};
  if (password && password.trim() !== "") {
    passwordUpdate = { encryptedPassword: encrypt(password) };
  }

  interface twoFactorUpdateProps {
    is2FAEnabled: boolean;
    phoneNumber?: string | null;
    recoveryEmailId?: string | null;
  }

  // Logic 2FA
  let twoFactorUpdate: twoFactorUpdateProps = { is2FAEnabled: is2FA };
  if (is2FA) {
    if (!phoneNumber)
      return { success: false, message: "No HP wajib untuk 2FA" };
    if (!recoveryEmailId)
      return { success: false, message: "Email Pemulih wajib untuk 2FA" };
    twoFactorUpdate = {
      is2FAEnabled: true,
      phoneNumber,
      recoveryEmailId,
    };
  } else {
    // Reset jika 2FA dimatikan
    twoFactorUpdate = {
      is2FAEnabled: false,
      phoneNumber: null,
      recoveryEmailId: null,
    };
  }

  try {
    await prisma.emailIdentity.update({
      where: { id, userId: session.user.id },
      data: {
        name: formData.get("name") as string,
        email: newEmail.toLowerCase(),
        ...passwordUpdate,
        ...twoFactorUpdate,
        ...verificationReset,
      },
    });

    revalidatePath(`/dashboard/email/${id}`);
    revalidatePath("/dashboard");
    return { success: true, message: "Email berhasil diperbarui" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal update email" };
  }
}

// 8. HAPUS EMAIL (UNLINK CHILDREN)
export async function deleteEmail(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.savedAccount.updateMany({
      where: { emailId: id, userId: session.user.id },
      data: { emailId: null },
    });

    // Baru hapus emailnya
    await prisma.emailIdentity.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Email dihapus. Akun terkait telah diputuskan.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menghapus email" };
  }
}
