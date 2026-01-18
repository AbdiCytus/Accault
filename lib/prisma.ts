// lib/prisma.ts

// -- With Accelerate -- //
// import { PrismaClient } from "@/app/generated/prisma/client";
// import { withAccelerate } from "@prisma/extension-accelerate";

// export const prisma = new PrismaClient({
//   accelerateUrl: process.env.DATABASE_URL!,
// }).$extends(withAccelerate());

// -- With Adapter -- //
import 'dotenv/config'
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
