-- Run this once in the Supabase SQL Editor before running the seed script.

CREATE TABLE IF NOT EXISTS public.doc_sections (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  num         TEXT    NOT NULL UNIQUE,   -- '0' = intro/sumário, '1'–'21' = sections
  title       TEXT    NOT NULL,
  icon        TEXT    NOT NULL DEFAULT 'file',
  description TEXT    NOT NULL DEFAULT '',
  content     TEXT    NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL
);

ALTER TABLE public.doc_sections ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated users) can read doc sections.
CREATE POLICY "public_read_doc_sections"
  ON public.doc_sections
  FOR SELECT
  USING (true);
