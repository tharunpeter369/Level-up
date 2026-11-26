import { sql } from "drizzle-orm";
import type { Db } from "../../db/client.ts";

/** Resolves if the database answers a trivial query; rejects with the driver's error otherwise. */
export async function pingDatabase(db: Db): Promise<void> {
  await db.execute(sql`select 1`);
}
