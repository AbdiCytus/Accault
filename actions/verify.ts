"use server";

import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

// 1. KIRIM EMAIL VERIFIKASI (Dengan Rate Limit & Expiry)
export async function sendVerificationEmail(emailId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, message: "Unauthorized" };

  try {
    const emailData = await prisma.emailIdentity.findUnique({
      where: { id: emailId, userId: session.user.id },
    });

    if (!emailData) return { success: false, message: "Email Not Found" };
    if (emailData.isVerified)
      return { success: false, message: "Email Already Verified" };

    // --- LOGIKA RATE LIMIT (MAX 3X PER HARI) ---
    const now = new Date();
    const lastSent = emailData.lastVerificationSent;
    let attempts = emailData.verificationAttempts;

    // Cek apakah hari ini berbeda dengan terakhir kirim (Reset jika sudah ganti hari)
    if (lastSent && lastSent.toDateString() !== now.toDateString()) {
      attempts = 0;
    }

    if (attempts >= 3) {
      return {
        success: false,
        message: "Verification Limit Has Been Reached, Try Again Tomorrow",
      };
    }

    // --- GENERATE TOKEN & EXPIRY (1 HARI) ---
    const token = `${Math.random().toString(36).substring(2, 15)}${Date.now()}`;
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 Jam

    // Update DB (Simpan token, expiry, dan increment attempt)
    await prisma.emailIdentity.update({
      where: { id: emailId },
      data: {
        verificationToken: token,
        tokenExpiresAt: expiresAt,
        lastVerificationSent: now,
        verificationAttempts: attempts + 1,
      },
    });

    // Kirim Email (Nodemailer)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const verifyLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: `"Accault" <${process.env.SMTP_EMAIL}>`,
      to: emailData.email,
      subject: "Verified Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2563EB;">Email Verification</h2>
          <p>Hello, <b>${emailData.name || "User"}</b>,</p>
          <p>Our system received a request to verify your email address: <b>${
            emailData.email
          }</b>.</p>
          <p>Please click the button below to verify:</p>
          <a href="${verifyLink}" style="display: inline-block; background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verified Now</a>
          <p>This link only valid for <b>24 hours</b>.</p>
          <p style="margin-top: 20px; font-size: 12px; color: #888;">If this is not you, you can ignore this email.</p>
        </div> `,
    });

    return {
      success: true,
      message: `Verification Link Has Been Sent`,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed send email" };
  }
}

// 2. PROSES VERIFIKASI TOKEN (Cek Token & Expiry)
export async function verifyEmailToken(token: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, message: "Unauthorized" };
  try {
    const emailData = await prisma.emailIdentity.findFirst({
      where: { verificationToken: token },
    });

    if (!emailData) return { success: false, message: "Invalid Token" };

    // --- CEK EXPIRY ---
    if (emailData.tokenExpiresAt && new Date() > emailData.tokenExpiresAt) {
      return {
        success: false,
        message: "Link Expired",
      };
    }

    // Verifikasi Sukses
    await prisma.emailIdentity.update({
      where: { id: emailData.id },
      data: {
        isVerified: true,
        verificationToken: null,
        tokenExpiresAt: null,
        verificationAttempts: 0,
      },
    });

    await logActivity(
      session.user.id,
      "LOGIN",
      "Email",
      `Email Verified: ${emailData.email}`
    );
    return { success: true, message: "Email Verified Successfully" };
  } catch (error) {
    const emailData = await prisma.emailIdentity.findFirst({
      where: { verificationToken: token },
    });
    
    await logActivity(
      session.user.id,
      "LOGIN",
      "Email",
      `Email Verification Failed  ${emailData?.email}`
    );
    console.error(error);
    return { success: false, message: "System Error" };
  }
}
