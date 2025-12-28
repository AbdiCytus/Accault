"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
export async function getGroups() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  return await prisma.accountGroup.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { accounts: true } } }, // Hitung jumlah akun di dalamnya
    orderBy: { createdAt: "asc" },
  });
}

// 3. HAPUS GROUP
export async function deleteGroup(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.accountGroup.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Grup dihapus" };
  } catch (error) {
    return { success: false, message: "Gagal hapus grup" };
  }
}
