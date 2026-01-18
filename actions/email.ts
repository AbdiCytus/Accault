"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { logActivity } from "@/lib/logger";

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
    return { success: false, message: "Email or Password Required" };
  }

  // Validasi 2FA
  if (is2FA && !phoneNumber) {
    return { success: false, message: "Phone Number Required for 2FA" };
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
    await logActivity(
      session.user.id,
      "CREATE",
      "Email",
      `Create New Email ${email}`,
    );
    return { success: true, message: "Email Created Successfully!" };
  } catch (error) {
    console.error("Failed Create Email:", error);
    await logActivity(
      session.user.id,
      "CREATE",
      "Email",
      `Failed Create Email`,
    );
    return {
      success: false,
      message: "Failed Create Email (Maybe duplicate)",
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
    // cacheStrategy: {
    //   ttl: 60,
    //   swr: 30,
    // },
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
      select: { isVerified: true, email: true },
    });

    if (!email) return { success: false, message: "Email Not Found" };

    await prisma.emailIdentity.update({
      where: { id },
      data: { isVerified: !email.isVerified },
    });

    revalidatePath(`/dashboard/email/${id}`);
    revalidatePath("/dashboard");

    await logActivity(
      session.user.id,
      "UPDATE",
      "Email",
      `Email Verification ${email.email}: ${
        email.isVerified ? "Success" : "Failed"
      }`,
    );
    return {
      success: true,
      message: email.isVerified ? "Verified Status Removed" : "Email Verified",
    };
  } catch (error) {
    await logActivity(
      session.user.id,
      "UPDATE",
      "Email",
      `Email Verification Failed`,
    );
    console.error("Failed Status Update", error);
    return { success: false, message: "Failed Status Update" };
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
  if (!currentData) return { success: false, message: "Data Not Found" };
  if (!email) return { success: false, message: "Email Required" };

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
      return { success: false, message: "Phone Number Required for 2FA" };
    if (!recoveryEmailId)
      return { success: false, message: "Email Recovery Required for 2FA" };
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
    await logActivity(
      session.user.id,
      "UPDATE",
      "Email",
      `Email Update ${email}`,
    );
    return { success: true, message: "Email Updated Successfully!" };
  } catch (error) {
    console.error(error);
    await logActivity(
      session.user.id,
      "UPDATE",
      "Email",
      `Failed Update Email`,
    );
    return { success: false, message: "Failed Update Email" };
  }
}

// 8. HAPUS EMAIL (UNLINK CHILDREN)
export async function deleteEmail(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const email = await prisma.emailIdentity.findUnique({
    where: { id: id, userId: session.user.id },
  });

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
    await logActivity(
      session.user.id,
      "DELETE",
      "Email",
      `Delete Email ${email?.email}`,
    );
    return {
      success: true,
      message: "Email Deleted",
    };
  } catch (error) {
    await logActivity(
      session.user.id,
      "DELETE",
      "Email",
      `Failed Delete Email`,
    );
    console.error(error);
    return { success: false, message: "Failed Delete Email" };
  }
}

// 9. BULK DELETE EMAILS
export async function deleteBulkEmails(ids: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.savedAccount.updateMany({
      where: {
        emailId: { in: ids },
        userId: session.user.id,
      },
      data: {
        emailId: null, // Set ke null, jangan dihapus akunnya
      },
    });

    const deleteResult = await prisma.emailIdentity.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");

    await logActivity(
      session.user.id,
      "DELETE",
      "Email",
      `Bulk Deleted ${deleteResult.count} Emails`,
    );

    return {
      success: true,
      message: `Successfully deleted ${deleteResult.count} emails.`,
    };
  } catch (error) {
    console.error("Bulk Delete Email Error:", error);
    await logActivity(
      session.user.id,
      "DELETE",
      "Email",
      "Failed Bulk Delete Emails",
    );
    return { success: false, message: "Failed to delete emails." };
  }
}
