// lib/logger.ts
import { prisma } from "@/lib/prisma";

export async function logActivity(
  userId: string,
  action: string,
  entity: string,
  details?: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
