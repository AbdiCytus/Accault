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

  // Ambil Kategori (Multi Select mengirim data dengan nama yang sama berkali-kali)
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
        categories: categories, // Simpan sebagai Array
        emailId: finalEmailId,
        groupId: groupId || null, // Jika kosong string, jadikan null
        website: website || null,
        description: description || null,
        icon: null, // Nanti kita urus fitur upload gambar terpisah
      },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Akun berhasil disimpan" };
  } catch (error) {
    console.error("Gagal simpan akun:", error);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

// export async function getAccounts(query?: string) {
//   const session = await getServerSession(authOptions);
//   if (!session || !session.user?.id) return [];

//   try {
//     const accounts = await prisma.savedAccount.findMany({
//       where: {
//         userId: session.user.id,
//         ...(query && {
//           OR: [
//             { platformName: { contains: query, mode: "insensitive" } },
//             { username: { contains: query, mode: "insensitive" } },
//           ],
//         }),
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return accounts;
//   } catch (error) {
//     console.error("Gagal ambil data:", error);
//     return [];
//   }
// }

export async function getAccounts(query?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  // Logic Search tetap dipertahankan
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
      emailIdentity: { select: { email: true } }, // Ambil email relasi
      group: { select: { name: true } }, // Ambil nama grup relasi
    },
    orderBy: { createdAt: "desc" },
  });
}

// export async function updateAccount(formData: FormData) {
//   const session = await getServerSession(authOptions);
//   if (!session || !session.user?.id) {
//     return { success: false, message: "Kamu harus login dulu!" };
//   }

//   const id = formData.get("id") as string;
//   const platform = formData.get("platform") as string;
//   const username = formData.get("username") as string;
//   const password = formData.get("password") as string; // Bisa kosong
//   const category = formData.get("category") as string;

//   if (!id || !platform || !username) {
//     return { success: false, message: "Data tidak lengkap." };
//   }

//   try {
//     // Siapkan data yang mau diupdate
//     const dataToUpdate: Prisma.SavedAccountUpdateInput = {
//       platformName: platform,
//       username: username,
//       category: category,
//     };

//     // Logika Password: Hanya update kalau user mengisi password baru
//     if (password && password.trim() !== "") {
//       dataToUpdate.encryptedPassword = encrypt(password);
//     }

//     // Eksekusi update ke database
//     await prisma.savedAccount.update({
//       where: {
//         id: id,
//         userId: session.user.id, // Pastikan yang edit adalah pemiliknya
//       },
//       data: dataToUpdate,
//     });

//     revalidatePath("/dashboard");
//     return { success: true, message: "Akun berhasil diperbarui!" };
//   } catch (error) {
//     console.error("Gagal update akun:", error);
//     return { success: false, message: "Gagal memperbarui akun." };
//   }
// }

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
