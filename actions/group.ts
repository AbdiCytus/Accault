"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { logActivity } from "@/lib/logger";

const ITEMS_PER_PAGE = 12;

// 1. TAMBAH GROUP
export async function addGroup(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const name = formData.get("name") as string;

  if (!name) return { success: false, message: "Group Name Required" };

  try {
    await prisma.accountGroup.create({
      data: {
        userId: session.user.id,
        name: name,
      },
    });

    revalidatePath("/dashboard");
    await logActivity(
      session.user.id,
      "CREATE",
      "Group",
      `Create New Group: ${name}`
    );
    return { success: true, message: "Group Created Successfully!" };
  } catch (error) {
    await logActivity(
      session.user.id,
      "CREATE",
      "Group",
      `Failed Create Group`
    );
    console.error("Gagal buat grup:", error);
    return { success: false, message: "Failed Create Group" };
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

  const group = await prisma.accountGroup.findUnique({
    where: { id: id, userId: session.user.id },
  });

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

    await logActivity(
      session.user.id,
      "UPDATE",
      "Group",
      `Group Name Update From ${group?.name} To ${name}`
    );

    return { success: true, message: "Group Updated Successfully" };
  } catch (error) {
    console.error("Update group error:", error);
    await logActivity(
      session.user.id,
      "CREATE",
      "Group",
      `Failed Update Group`
    );
    return { success: false, message: "Failed Update Group" };
  }
}

// 6. HAPUS GROUP (UNGROUP ACCOUNTS)
export async function deleteGroup(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const group = await prisma.accountGroup.findUnique({
    where: { id: id, userId: session.user.id },
  });

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

    await logActivity(
      session.user.id,
      "DELETE",
      "Group",
      `Delete Group ${group?.name}`
    );
    return {
      success: true,
      message: "Group Deleted",
    };
  } catch (error) {
    console.error(error);
    await logActivity(
      session.user.id,
      "DELETE",
      "Group",
      `Failed Delete Group`
    );
    return { success: false, message: "Failed Delete Group" };
  }
}

export async function getAllGroupAccountIds(
  groupId: string,
  query: string = ""
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const whereCondition: Prisma.SavedAccountWhereInput = {
    userId: session.user.id,
    groupId: groupId,
  };

  if (query) {
    whereCondition.OR = [
      { platformName: { contains: query, mode: "insensitive" } },
      { username: { contains: query, mode: "insensitive" } },
    ];
  }

  const accounts = await prisma.savedAccount.findMany({
    where: whereCondition,
    select: { id: true }, // Kita hanya butuh ID-nya saja agar ringan
  });

  return accounts.map((a) => a.id);
}

export async function getGroupById(
  id: string,
  query: string = "",
  page: number = 1
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const skip = (page - 1) * ITEMS_PER_PAGE;

  const group = await prisma.accountGroup.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!group) return null;

  const whereCondition: Prisma.SavedAccountWhereInput = {
    userId: session.user.id,
    groupId: id,
  };

  if (query) {
    whereCondition.OR = [
      { platformName: { contains: query, mode: "insensitive" } },
      { username: { contains: query, mode: "insensitive" } },
    ];
  }

  // Hitung Total
  const totalAccounts = await prisma.savedAccount.count({
    where: whereCondition,
  });

  const accounts = await prisma.savedAccount.findMany({
    where: whereCondition,
    include: {
      emailIdentity: { select: { email: true } },
      group: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: skip,
    take: ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalAccounts / ITEMS_PER_PAGE);

  return {
    group,
    accounts,
    totalPages,
    totalAccounts, // [UPDATE] Kirim total data
    currentPage: page,
  };
}
