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
  return raw.replace(/\r\n/g, "\n");
}

// ─── Split markdown into per-section rows (code-fence aware) ─────────────────
//
// A naive split on /\n(?=## )/ would break on ## headings that appear inside
// fenced code blocks (e.g. the spec template in section 14.4). This function
// scans line-by-line, tracking fence depth, and only splits on ## headings
// that are outside any code fence.
//
function splitMarkdownIntoSections(rawMd: string) {
  const lines = rawMd.split("\n");

  // Collect the line indices where a top-level ## section heading starts
  // (i.e. outside any code fence).
  const sectionStartLines: number[] = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Toggle fence state on lines that start with ``` (with any optional lang tag)
    if (/^```/.test(line)) {
      inFence = !inFence;
    }
    if (!inFence && line.startsWith("## ")) {
      sectionStartLines.push(i);
    }
  }

  const rows: Array<{
    num: string;
    title: string;
    icon: string;
    description: string;
    content: string;
    sort_order: number;
  }> = [];

  // Everything before the first ## heading is the intro / TOC
  const introLines = sectionStartLines.length > 0
    ? lines.slice(0, sectionStartLines[0])
    : lines;
  rows.push({
    num: "0",
    title: "Sumário",
    icon: "file",
    description: "Introdução e sumário geral do documento",
    content: introLines.join("\n").trimEnd(),
    sort_order: 0,
  });

  // Each subsequent block runs from one ## heading to the next
  for (let idx = 0; idx < sectionStartLines.length; idx++) {
    const start = sectionStartLines[idx];
    const end = idx + 1 < sectionStartLines.length
      ? sectionStartLines[idx + 1]
      : lines.length;

    const heading = lines[start];
    const numMatch = heading.match(/^## (\d+)\.\s+(.+)/);
    if (!numMatch) continue; // skip non-numbered headings (e.g. ## Encerramento)

    const num = numMatch[1];
    const meta = SECTIONS_DATA.find((s) => s.num === num);
    const content = lines.slice(start, end).join("\n").trimEnd();

    rows.push({
      num,
      title: meta?.title ?? numMatch[2],
      icon: meta?.icon ?? "file",
      description: meta?.desc ?? "",
      content,
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
  console.log(
    "\nSections found:\n" +
      rows.map((r) => `  [${r.num.padStart(2)}] ${r.title}`).join("\n")
  );

  console.log("\n🗑️   Clearing existing rows…");
  await dbDelete("doc_sections", "sort_order=gte.0");

  console.log("⬆️   Inserting sections into Supabase…");
  for (let i = 0; i < rows.length; i += 5) {
    await dbInsert("doc_sections", rows.slice(i, i + 5));
    process.stdout.write(`    ${Math.min(i + 5, rows.length)}/${rows.length}\r`);
  }

  console.log(`\n✅  Done — ${rows.length} sections inserted.`);
}

main().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
