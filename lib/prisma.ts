// lib/prisma.ts

// -- With Accelerate -- //

// import { PrismaClient, Prisma } from "@/app/generated/prisma/client";
// import { withAccelerate } from "@prisma/extension-accelerate";

// type PrismaClientOptions = Prisma.PrismaClientOptions

// class MyPrismaClient extends PrismaClient {
//   constructor(options?: Omit<PrismaClientOptions, 'adapter' | 'accelerateUrl'>) {
//     super({
//       ...options,
//       accelerateUrl: process.env.DATABASE_URL!,
//     })
//   }
// }

// export const prisma = new MyPrismaClient().$extends(withAccelerate())

// -- With Adapter -- //

import 'dotenv/config'
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
