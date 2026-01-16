"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { logActivity } from "@/lib/logger";

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
    return { success: false, message: "Platform & Username are required" };
  }
  if (categories.length === 0) {
    return { success: false, message: "Select at least 1 category" };
  }

  // Validasi Logika "No Password" & "No Email"
  let finalEncryptedPass: string | null = null;
  if (!noPassword) {
    if (!password)
      return {
        success: false,
        message: "Password is required",
      };
    finalEncryptedPass = encrypt(password);
  }

  let finalEmailId: string | null = null;
  if (!noEmail) {
    if (!emailId) return { success: false, message: "Email is required" };
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
    await logActivity(
      session.user.id,
      "CREATE",
      "Account",
      `Create New Account ${platform}`
    );
    return { success: true, message: "Account Add Success!" };
  } catch (error) {
    await logActivity(
      session.user.id,
      "CREATE",
      "Account",
      "Failed Create Account"
    );
    console.error("Failed Add Account:", error);
    return { success: false, message: "Account Add Failed!" };
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
    return { success: false, message: "Platform Name & Username are Required" };
  }

  let passwordUpdate: { encryptedPassword?: string | null } = {};
  if (noPassword) passwordUpdate = { encryptedPassword: null };
  else if (password && password.trim() !== "") {
    passwordUpdate = { encryptedPassword: encrypt(password) };
  }

  // LOGIKA EMAIL:
  let emailUpdate: { emailId?: string | null } = {};
  if (noEmail) emailUpdate = { emailId: null };
  else if (!noEmail && !emailId)
    return { success: false, message: "Email is Required" };
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

    await logActivity(
      session.user.id,
      "UPDATE",
      "Account",
      `Update ${platform}`
    );
    return { success: true, message: "Account Update Success!", redirectPath };
  } catch (error) {
    await logActivity(
      session.user.id,
      "UPDATE",
      "Account",
      "Failed Update Account"
    );
    console.error(error);
    return { success: false, message: "Account Update Failed!" };
  }
}

export async function deleteAccount(accountId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) return { success: false };

  const platform = await prisma.savedAccount.findUnique({
    where: { id: accountId, userId: session.user.id },
  });

  try {
    await prisma.savedAccount.delete({
      where: {
        id: accountId,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");

    await logActivity(
      session.user.id,
      "DELETE",
      "Account",
      `Delete ${platform?.platformName}`
    );
    return { success: true };
  } catch (err) {
    await logActivity(
      session.user.id,
      "DELETE",
      "Account",
      "Failed Delete Account"
    );
    console.error("Account Delete Failed!", err);
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
      select: {
        groupId: true,
        platformName: true,
        group: { select: { name: true } },
      },
    });

    if (!account) return { success: false, message: "Account Not Found" };
    if (!account.groupId)
      return { success: false, message: "Account is not inside of group" };

    // 2. Update groupId menjadi NULL (Keluarkan dari group)
    await prisma.savedAccount.update({
      where: { id: accountId },
      data: { groupId: null },
    });

    // 3. Refresh Data di Halaman Terkait
    revalidatePath("/dashboard"); // Refresh Dashboard
    revalidatePath(`/dashboard/group/${account.groupId}`); // Refresh Halaman Group asal
    revalidatePath(`/dashboard/account/${accountId}`); // Refresh Detail Akun itu sendiri

    await logActivity(
      session.user.id,
      "UPDATE",
      "Account",
      `Remove ${account.platformName} from ${account.group?.name}`
    );
    return { success: true, message: "Account Ejected From Group" };
  } catch (error) {
    await logActivity(
      session.user.id,
      "UPDATE",
      "Account",
      `Failed Remove Account From Group`
    );
    console.error("Failed Eject Account:", error);
    return { success: false, message: "Failed Eject Account" };
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

    if (!account) return { success: false, message: "Account Not Found" };

    // 2. Validasi: Pastikan Group milik user
    const group = await prisma.accountGroup.findUnique({
      where: { id: groupId, userId: session.user.id },
    });

    if (!group) return { success: false, message: "Group Not Found" };

    // 3. Update Akun
    await prisma.savedAccount.update({
      where: { id: accountId },
      data: { groupId: groupId },
    });

    // 4. Refresh Halaman
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/group/${groupId}`);

    await logActivity(
      session.user.id,
      "UPDATE",
      "Account",
      `Move ${account.platformName} to ${group.name}`
    );
    return {
      success: true,
      message: `Account Successfull Move to ${group.name}`,
    };
  } catch (error) {
    await logActivity(
      session.user.id,
      "UPDATE",
      "Account",
      `Failed Move Account to Group`
    );
    console.error("Failed move account:", error);
    return { success: false, message: "Failed Move Account to Group" };
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
    await logActivity(
      session.user.id,
      "DELETE",
      "Account",
      `Delete ${accountIds.length} Accounts`
    );
    return {
      success: true,
      message: `${accountIds.length} Accounts Successfull Delete`,
    };
  } catch (error) {
    await logActivity(
      session.user.id,
      "DELETE",
      "Account",
      `Failed Delete Accounts`
    );
    console.error("Bulk delete accounts error:", error);
    return { success: false, message: "Failed Delete Accounts" };
  }
}

export async function deleteBulkGroups(groupIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
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
    await logActivity(
      session.user.id,
      "DELETE",
      "Group",
      `Delete ${groupIds.length} Groups`
    );
    return {
      success: true,
      message: `${groupIds.length} Groups Deleted`,
    };
  } catch (error) {
    await logActivity(
      session.user.id,
      "DELETE",
      "Account",
      `Failed Delete Groups`
    );
    console.error("Bulk delete groups error:", error);
    return { success: false, message: "Failed Delete Groups" };
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
      return { success: false, message: "Group Destination Not Found" };

    await prisma.savedAccount.updateMany({
      where: {
        id: { in: accountIds },
        userId: session.user.id,
      },
      data: { groupId },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/group/${groupId}`);
    await logActivity(
      session.user.id,
      "UPDATE",
      "Account",
      `Move ${accountIds.length} Accounts to ${group.name}`
    );
    return {
      success: true,
      message: `${accountIds.length} Accounts Moved to ${group.name}`,
    };
  } catch (error) {
    console.error("Bulk move error:", error);
    await logActivity(
      session.user.id,
      "UPDATE",
      "Account",
      `Failed Move Accounts to Group`
    );
    return { success: false, message: "Failed Move Accounts to Group" };
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
    await logActivity(
      session.user.id,
      "UPDATE",
      "Account",
      `Remove ${accountIds.length} Accounts From Their Group`
    );
    return {
      success: true,
      message: `${accountIds.length} Accounts Ejected From Their Group`,
    };
  } catch (error) {
    console.error("Bulk remove group error:", error);
    await logActivity(
      session.user.id,
      "UPDATE",
      "Account",
      `Failed Remove Accounts From Their Group`
    );
    return {
      success: false,
      message: "Failed Remove Accounts From Their Group",
    };
  }
}
