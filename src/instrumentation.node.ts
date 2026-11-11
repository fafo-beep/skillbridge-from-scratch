import { db, dbConfigured } from "@/lib/db";

export async function recordError(data: { message: string; digest: string; path: string; stack: string }) {
  if (!dbConfigured) return;
  await db.errorLog.create({ data });
}
