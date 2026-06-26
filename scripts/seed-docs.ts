/**
 * Populates the `doc_sections` table in Supabase with all section metadata
 * and markdown content extracted from processo-desenvolvimento-arphia.md.
 *
 * Prerequisites:
 *   1. Run `supabase/schema.sql` once in the Supabase SQL Editor.
 *   2. Get your service-role key from: Supabase dashboard → Settings → API
 *      (it's the "service_role" key — keep it secret, never commit it)
 *   3. Run with (PowerShell):
 *        $env:SUPABASE_SERVICE_KEY="sua_chave"; npm run seed:docs
 */

import { readFileSync } from "fs";
import { SECTIONS_DATA } from "../src/apps/damatools/sections-meta.ts";

// ─── Config ───────────────────────────────────────────────────────────────────
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SERVICE_KEY) {
  console.error(
    "❌  Missing SUPABASE_SERVICE_KEY environment variable.\n" +
      "    Get it from: Supabase dashboard → Settings → API → service_role\n" +
      "    Run as (PowerShell): $env:SUPABASE_SERVICE_KEY=\"<key>\"; npm run seed:docs"
  );
  process.exit(1);
}

const PROJECT_ID = "zdcgbouiofvoenuaiudv";
const BASE_URL = `https://${PROJECT_ID}.supabase.co/rest/v1`;
const HEADERS = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

// ─── Supabase REST helpers ────────────────────────────────────────────────────
async function dbDelete(table: string, filter: string) {
  const res = await fetch(`${BASE_URL}/${table}?${filter}`, {
    method: "DELETE",
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`DELETE failed: ${res.status} ${await res.text()}`);
}

async function dbInsert(table: string, rows: object[]) {
  const res = await fetch(`${BASE_URL}/${table}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`INSERT failed: ${res.status} ${await res.text()}`);
}

// ─── Read markdown from the source file ──────────────────────────────────────
function readMarkdown(): string {
  const mdPath = new URL("../processo-desenvolvimento-arphia.md", import.meta.url);
  const raw = readFileSync(mdPath, "utf-8");
  // Normalize Windows CRLF → LF
  return raw.replace(/\r\n/g, "\n");
}

// ─── Split markdown into per-section rows ────────────────────────────────────
function splitMarkdownIntoSections(rawMd: string) {
  const parts = rawMd.split(/\n(?=## )/);

  const introContent = parts[0].trimEnd();

  const rows: Array<{
    num: string;
    title: string;
    icon: string;
    description: string;
    content: string;
    sort_order: number;
  }> = [];

  rows.push({
    num: "0",
    title: "Sumário",
    icon: "file",
    description: "Introdução e sumário geral do documento",
    content: introContent,
    sort_order: 0,
  });

  for (const part of parts.slice(1)) {
    const numMatch = part.match(/^## (\d+)\./);
    if (!numMatch) continue;

    const num = numMatch[1];
    const meta = SECTIONS_DATA.find((s) => s.num === num);

    rows.push({
      num,
      title: meta?.title ?? part.split("\n")[0].replace(/^## \d+\.\s*/, ""),
      icon: meta?.icon ?? "file",
      description: meta?.desc ?? "",
      content: part.trimEnd(),
      sort_order: parseInt(num, 10),
    });
  }

  return rows;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("📖  Reading markdown from processo-desenvolvimento-arphia.md…");
  const rawMd = readMarkdown();

  console.log("✂️   Splitting into sections…");
  const rows = splitMarkdownIntoSections(rawMd);
  console.log(`    Found ${rows.length} sections (including intro).`);

  console.log("🗑️   Clearing existing rows…");
  await dbDelete("doc_sections", "sort_order=gte.0");

  console.log("⬆️   Inserting sections into Supabase…");
  // Insert in batches of 5 to stay within request size limits
  for (let i = 0; i < rows.length; i += 5) {
    await dbInsert("doc_sections", rows.slice(i, i + 5));
    process.stdout.write(`    ${Math.min(i + 5, rows.length)}/${rows.length}\r`);
  }

  console.log(`\n✅  Done — ${rows.length} sections inserted.`);
  console.log(
    "\nSections seeded:\n" +
      rows.map((r) => `  [${r.num.padStart(2)}] ${r.title}`).join("\n")
  );
}

main().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
