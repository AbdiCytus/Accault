"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// 1. Verifikasi PIN & Set Cookie Unlocked
export async function verifyPin(pin: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { securityPin: true, pinAttempts: true, lockoutUntil: true },
  });

  if (!user || !user.securityPin) {
    return { success: false, message: "PIN not set" };
  }

  // Cek Lockout
  if (user.lockoutUntil && new Date() < user.lockoutUntil) {
    const timeLeft = Math.ceil(
      (user.lockoutUntil.getTime() - new Date().getTime()) / 1000
    );
    return {
      success: false,
      message: `Too many attempts. Try again in ${timeLeft}s`,
      lockedOut: true,
    };
  }

  const decryptedPin = decrypt(user.securityPin);

  if (pin === decryptedPin) {
    // Reset percobaan
    await prisma.user.update({
      where: { id: session.user.id },
      data: { pinAttempts: 0, lockoutUntil: null },
    });

    // SET COOKIE: Menandakan sesi ini terbuka
    (await cookies()).set("accault_session_unlocked", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return { success: true };
  } else {
    // Handle Gagal
    const newAttempts = user.pinAttempts + 1;
    let newLockout: Date | null = null;

    if (newAttempts >= 5) {
      newLockout = new Date(new Date().getTime() + 60 * 1000); // 1 Menit
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pinAttempts: newAttempts >= 5 ? 0 : newAttempts,
        lockoutUntil: newLockout,
      },
    });

    return {
      success: false,
      message:
        newAttempts >= 5
          ? "Locked out for 1 minute"
          : `Incorrect PIN. ${5 - newAttempts} attempts left.`,
      lockedOut: newAttempts >= 5,
    };
  }
}

// 2. Setup / Ubah PIN
export async function setPin(pin: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  if (!/^\d{6}$/.test(pin)) {
    return { success: false, message: "PIN must be 6 digits number" };
  }

  try {
    const encryptedPin = encrypt(pin);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { securityPin: encryptedPin, pinAttempts: 0, lockoutUntil: null },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "PIN Setup Successful" };
  } catch (error) {
    console.error("Set PIN Error:", error);
    return { success: false, message: "Failed to set PIN" };
  }
}

// 3. Cek apakah user punya PIN (untuk logic frontend)
export async function checkHasPin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { securityPin: true },
  });

  return !!user?.securityPin;
}

// 4. Kunci Sesi (Logout / Manual Lock)
export async function lockSession() {
  (await cookies()).delete("accault_session_unlocked");
  revalidatePath("/dashboard");
}

// 5. Cek Status Sesi (Yang tadi hilang)
export async function checkSessionStatus() {
  const cookieStore = await cookies();
  const isUnlocked =
    cookieStore.get("accault_session_unlocked")?.value === "true";
  return { isSessionUnlocked: isUnlocked };
}
