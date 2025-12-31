"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";

// 1. TAMBAH GROUP
export async function addGroup(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const name = formData.get("name") as string;

  if (!name) return { success: false, message: "Nama grup wajib diisi" };

  try {
    await prisma.accountGroup.create({
      data: {
        userId: session.user.id,
        name: name,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Grup berhasil dibuat" };
  } catch (error) {
    console.error("Gagal buat grup:", error);
    return { success: false, message: "Gagal membuat grup" };
  }
}

// 2. AMBIL SEMUA GROUP (Untuk Dropdown & Dashboard)
export async function getGroups(query?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const whereCondition: Prisma.AccountGroupWhereInput = {
    userId: session.user.id,
  };
  if (query) {
    whereCondition.name = { contains: query, mode: "insensitive" };
  }

  return await prisma.accountGroup.findMany({
    where: whereCondition,
    include: { _count: { select: { accounts: true } } }, // Hitung jumlah akun di dalamnya
    orderBy: { createdAt: "asc" },
  });
}

// 5. UPDATE GROUP (RENAME)
export async function updateGroup(id: string, name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.accountGroup.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: { name },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/group/${id}`);

    return { success: true, message: "Group berhasil diupdate" };
  } catch (error) {
    console.error("Update group error:", error);
    return { success: false, message: "Gagal mengupdate group" };
  }
}

// 6. HAPUS GROUP (UNGROUP ACCOUNTS)
export async function deleteGroup(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.savedAccount.updateMany({
      where: { groupId: id, userId: session.user.id },
      data: { groupId: null },
    });

    // Hapus group
    await prisma.accountGroup.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      message:
        "Group dihapus. Akun di dalamnya telah dipindahkan ke dashboard.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menghapus group" };
  }
}

export async function getGroupById(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return await prisma.accountGroup.findUnique({
    where: { id, userId: session.user.id },
    include: {
      accounts: {
        orderBy: { createdAt: "desc" },
        include: {
          emailIdentity: { select: { email: true } },
        },
      },
    },
  });
}
