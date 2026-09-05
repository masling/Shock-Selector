import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { supabasePoolConfig } from "./supabase-connection";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const supabaseConnection = supabasePoolConfig(process.env.DATABASE_URL, process.env.SUPABASE_PROJECT_REF);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(supabaseConnection ? { adapter: new PrismaPg(supabaseConnection) } : {}),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
