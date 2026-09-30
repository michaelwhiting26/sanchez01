import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { MIGRATIONS } from "./migrations";

/**
 * The database. One tiny interface over Postgres. With DATABASE_URL set (Neon, Vercel Postgres, Supabase, RDS, ...) it uses that server; otherwise it
 * runs PGlite, a real Postgres in-process, persisted under .data/pglite, so local development needs no install. Migrations run on first use.
 */
export interface Db {
  query<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, params?: readonly unknown[]): Promise<T[]>;
}

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { default: postgres } = await import("postgres");
    const sql = postgres(url, { max: 5, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require" });
    return { query: async <T extends Record<string, unknown>>(q: string, params: readonly unknown[] = []) => (await sql.unsafe(q, params as never[])) as unknown as T[] };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  if (process.env.NODE_ENV === "production") {
    // No DATABASE_URL on a deployment (its disk is read-only): a real Postgres in memory, so the site works as a demo. Data is lost on restart. Set DATABASE_URL to keep it.
    console.warn("[db] DATABASE_URL is not set: using an in-memory database (demo only, not persistent).");
    const mem = new PGlite();
    return { query: async <T extends Record<string, unknown>>(q: string, params: readonly unknown[] = []) => (await mem.query<T>(q, params as unknown[])).rows };
  }
  const dir = path.join(process.cwd(), ".data", "pglite");
  await fs.mkdir(path.dirname(dir), { recursive: true }); // PGlite creates its own folder but not the parent
  const pg = new PGlite(dir);
  return { query: async <T extends Record<string, unknown>>(q: string, params: readonly unknown[] = []) => (await pg.query<T>(q, params as unknown[])).rows };
}

async function migrate(db: Db): Promise<void> {
  await db.query("CREATE TABLE IF NOT EXISTS schema_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  const done = new Set((await db.query<{ id: string }>("SELECT id FROM schema_migrations")).map((r) => r.id));
  for (const m of MIGRATIONS) {
    if (done.has(m.id)) continue;
    for (const stmt of m.sql.split(";").map((s) => s.trim()).filter(Boolean)) await db.query(stmt);
    await db.query("INSERT INTO schema_migrations (id) VALUES ($1)", [m.id]);
  }
}

let ready: Promise<Db> | null = null;
export function getDb(): Promise<Db> {
  ready ??= connect().then(async (db) => {
    await migrate(db);
    return db;
  });
  return ready;
}
