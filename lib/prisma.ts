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

import { PrismaClient} from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
