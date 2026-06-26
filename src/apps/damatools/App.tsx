import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { marked } from "marked";
import { useNavigate } from "react-router";
import { useAuth } from "../../shared/contexts/AuthContext";
import LoginModal from "../../shared/components/auth/LoginModal";
import { supabase } from "../../shared/lib/supabase";
import { SECTIONS_DATA } from "./sections-meta";

// ─── Color tokens (matches original design) ──────────────────────────────────
const CSS = `
  :root {
    --dt-bg: #FCFCFA;
    --dt-surface: #F4F2EC;
    --dt-surface-2: #EDEAE3;
    --dt-border: #E5E2D9;
    --dt-border-strong: #D4D0C5;
    --dt-text: #1C1B17;
    --dt-text-muted: #6B6860;
    --dt-text-subtle: #989489;
    --dt-accent: #B43A2B;
    --dt-accent-soft: #F5E3DE;
    --dt-accent-soft-2: #EBC9C0;
    --dt-code-bg: #F4F2EC;
    --dt-tier1: #B43A2B;
    --dt-tier1-bg: #F5E3DE;
    --dt-tier2: #A66B14;
    --dt-tier2-bg: #F5E8D0;
    --dt-tier3: #3B6E47;
    --dt-tier3-bg: #DCEAE0;
  }
  [data-dt-dark="true"] {
    --dt-bg: #0E0D0B;
    --dt-surface: #18171A;
    --dt-surface-2: #232228;
    --dt-border: #2A2930;
    --dt-border-strong: #3A3942;
    --dt-text: #F4F2EC;
    --dt-text-muted: #A39F95;
    --dt-text-subtle: #6B6860;
    --dt-accent: #E85D4A;
    --dt-accent-soft: #2A1612;
    --dt-accent-soft-2: #3D1F19;
    --dt-code-bg: #18171A;
    --dt-tier1: #E85D4A;
    --dt-tier1-bg: #2A1612;
    --dt-tier2: #D49A4F;
    --dt-tier2-bg: #2A1F0E;
    --dt-tier3: #7AB088;
    --dt-tier3-bg: #1A2A1F;
  }
  .dt-root {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.65;
    color: var(--dt-text);
    background: var(--dt-bg);
    min-height: 100vh;
    font-feature-settings: 'ss01' on, 'cv11' on;
  }
  /* ── Topbar ── */
  .dt-topbar {
    position: sticky; top: 0; z-index: 50;
    background: rgba(252,252,250,.88);
    backdrop-filter: saturate(180%) blur(20px);
    border-bottom: 1px solid var(--dt-border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 28px; height: 60px;
  }
  [data-dt-dark="true"] .dt-topbar { background: rgba(14,13,11,.88); }
  .dt-brand { display:flex;align-items:center;gap:12px;font-family:'Fraunces',serif;font-size:18px;font-weight:600;letter-spacing:-.01em;color:var(--dt-text);cursor:pointer;border:none;background:0;padding:0 }
  .dt-brand-mark { width:32px;height:32px;border-radius:8px;background:var(--dt-accent);color:var(--dt-bg);display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-style:italic;font-weight:600;font-size:16px }
  .dt-brand-sub { color:var(--dt-text-muted);font-family:'Inter',sans-serif;font-size:13px;font-weight:400;font-style:normal;margin-left:2px }
  .dt-topbar-actions { display:flex;align-items:center;gap:4px }
  .dt-icon-btn { display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;border:none;background:0;color:var(--dt-text-muted);cursor:pointer;transition:background .15s,color .15s }
  .dt-icon-btn:hover { background:var(--dt-surface);color:var(--dt-text) }
  .dt-back-btn { display:flex;gap:6px;font-size:13px;font-family:inherit;background:var(--dt-surface);color:var(--dt-text-muted);border:1px solid var(--dt-border);padding:5px 14px;border-radius:8px;cursor:pointer;transition:all .15s;align-items:center }
  .dt-back-btn:hover { background:var(--dt-surface-2);color:var(--dt-text) }
  /* ── Doc layout ── */
  .dt-doc { display:grid;grid-template-columns:280px 1fr 220px;max-width:1480px;margin:0 auto }
  .dt-sidebar { position:sticky;top:60px;height:calc(100vh - 60px);overflow-y:auto;border-right:1px solid var(--dt-border);padding:32px 0 32px 28px;background:var(--dt-bg) }
  .dt-sidebar::-webkit-scrollbar { width:6px }
  .dt-sidebar::-webkit-scrollbar-thumb { background:var(--dt-border-strong);border-radius:3px }
  .dt-sidebar-label { font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--dt-text-subtle);margin-bottom:16px;padding-right:28px }
  .dt-sidebar-nav { list-style:none;display:flex;flex-direction:column }
  .dt-sidebar-nav a { display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:baseline;padding:7px 28px 7px 0;color:var(--dt-text-muted);text-decoration:none;font-size:13.5px;line-height:1.4;transition:color .15s;position:relative }
  .dt-sidebar-nav a::before { content:'';position:absolute;left:-28px;top:0;bottom:0;width:2px;background:transparent;transition:background .15s }
  .dt-sidebar-nav a:hover { color:var(--dt-text) }
  .dt-sidebar-nav a.active { color:var(--dt-accent);font-weight:500 }
  .dt-sidebar-nav a.active::before { background:var(--dt-accent) }
  .dt-sidebar-nav a:focus { outline:none }
  .dt-sidebar-nav a:focus-visible { outline:2px solid var(--dt-accent);outline-offset:2px;border-radius:4px }
  .dt-sidebar-num { font-family:'Fraunces',serif;font-style:italic;font-size:13px;font-weight:500;color:var(--dt-text-subtle);text-align:right;white-space:nowrap }
  .dt-sidebar-nav a.active .dt-sidebar-num { color:var(--dt-accent) }
  .dt-main { padding:0 56px;min-width:0 }
  .dt-content { max-width:740px;margin:0 auto;padding:48px 0 120px }
  /* ── TOC ── */
  .dt-toc { position:sticky;top:60px;height:calc(100vh - 60px);overflow-y:auto;padding:48px 28px 32px 0 }
  .dt-toc::-webkit-scrollbar { width:6px }
  .dt-toc::-webkit-scrollbar-thumb { background:var(--dt-border-strong);border-radius:3px }
  .dt-toc-label { font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--dt-text-subtle);margin-bottom:14px }
  .dt-toc-list { list-style:none;display:flex;flex-direction:column;gap:2px;border-left:1px solid var(--dt-border) }
  .dt-toc-list a { display:block;padding:4px 0 4px 14px;font-size:12.5px;line-height:1.4;color:var(--dt-text-muted);text-decoration:none;border-left:2px solid transparent;margin-left:-1px;transition:color .15s,border-color .15s }
  .dt-toc-list a:hover { color:var(--dt-text) }
  .dt-toc-list a.active { color:var(--dt-accent);border-left-color:var(--dt-accent);font-weight:500 }
  /* ── Markdown body ── */
  .dt-md h1 { display:none }
  .dt-md h2 { font-family:'Fraunces',serif;font-size:clamp(28px,3.2vw,34px);font-weight:500;line-height:1.15;letter-spacing:-.015em;color:var(--dt-text);margin:80px 0 32px;padding-top:12px;scroll-margin-top:80px }
  .dt-md h3 { font-family:'Inter',sans-serif;font-size:20px;font-weight:600;line-height:1.3;letter-spacing:-.01em;color:var(--dt-text);margin:56px 0 16px;scroll-margin-top:80px }
  .dt-md h4 { font-size:15px;font-weight:600;color:var(--dt-text);margin:32px 0 12px }
  .dt-md h5,.dt-md h6 { font-size:14px;font-weight:600;color:var(--dt-text-muted);text-transform:uppercase;letter-spacing:.04em;margin:24px 0 10px }
  .dt-md p { margin:0 0 20px;color:var(--dt-text) }
  .dt-md strong { font-weight:600;color:var(--dt-text) }
  .dt-md a { color:var(--dt-accent);text-decoration:none;border-bottom:1px solid transparent;transition:border-color .15s }
  .dt-md a:hover { border-bottom-color:var(--dt-accent) }
  .dt-md ul,.dt-md ol { margin:0 0 20px;padding-left:24px }
  .dt-md li { margin:6px 0;color:var(--dt-text) }
  .dt-md ul li { list-style:none;position:relative }
  .dt-md ul li::before { content:'';position:absolute;left:-16px;top:12px;width:4px;height:4px;background:var(--dt-text-subtle);border-radius:50% }
  .dt-md ol li { list-style-type:decimal }
  .dt-md ol li::marker { color:var(--dt-text-subtle);font-weight:500 }
  .dt-md blockquote { margin:24px 0;padding:16px 24px;background:var(--dt-surface);border-left:3px solid var(--dt-accent);border-radius:0 8px 8px 0;color:var(--dt-text-muted);font-style:italic }
  .dt-md blockquote p:last-child { margin-bottom:0 }
  .dt-md hr { border:none;border-top:1px solid var(--dt-border);margin:48px 0 }
  .dt-md code { font-family:'JetBrains Mono',monospace;font-size:.875em;background:var(--dt-surface);padding:2px 6px;border-radius:4px;color:var(--dt-accent) }
  .dt-md pre { position:relative;margin:20px 0;background:var(--dt-code-bg);border:1px solid var(--dt-border);border-radius:10px;overflow:hidden }
  .dt-md pre code { display:block;padding:16px 20px;background:transparent;color:var(--dt-text);font-size:13px;line-height:1.65;overflow-x:auto;border-radius:0;font-size:12px }
  .dt-md-table-wrap { margin:24px 0;border-radius:10px;border:1px solid var(--dt-border);overflow:hidden;overflow-x:auto;background:var(--dt-bg) }
  .dt-md-table-wrap table { width:100%;border-collapse:collapse;font-size:14px }
  .dt-md th,.dt-md td { padding:11px 16px;text-align:left;border-bottom:1px solid var(--dt-border);vertical-align:middle;white-space:normal;word-break:break-word }
  .dt-md th { background:var(--dt-surface);font-weight:600;font-size:11.5px;color:var(--dt-text-muted);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--dt-border-strong);white-space:nowrap }
  .dt-md tbody tr:last-child td { border-bottom:none }
  .dt-md tbody tr:hover td { background:var(--dt-surface) }
  /* ── Diagrams ── */
  .dt-diagram { margin:28px 0;border:1px solid var(--dt-border);border-radius:12px;background:var(--dt-bg);overflow:hidden }
  .dt-diagram-title { padding:12px 20px;font-size:12px;font-weight:600;color:var(--dt-text-muted);letter-spacing:.04em;text-transform:uppercase;background:var(--dt-surface);border-bottom:1px solid var(--dt-border) }
  .dt-diagram svg { display:block;width:100%;height:auto;padding:20px 12px }
  /* ── Orbital hero ── */
  .dt-hero-wrap { width:100%;background:var(--dt-bg) }
  .dt-hero-top { max-width:680px;margin:0 auto;padding:64px 28px 0;text-align:center }
  .dt-hero-eyebrow { display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:500;letter-spacing:.04em;color:var(--dt-text-muted);margin-bottom:24px;padding:5px 14px;background:var(--dt-surface);border:1px solid var(--dt-border);border-radius:100px }
  .dt-hero-eyebrow-dot { width:6px;height:6px;border-radius:50%;background:var(--dt-accent);flex-shrink:0 }
  .dt-hero-title { font-family:'Fraunces',serif;font-size:clamp(38px,5.5vw,62px);font-weight:500;line-height:1.06;letter-spacing:-.025em;color:var(--dt-text);margin-bottom:20px }
  .dt-hero-desc { font-size:17px;line-height:1.65;color:var(--dt-text-muted);margin-bottom:32px;max-width:540px;margin-left:auto;margin-right:auto }
  .dt-hero-btn { display:inline-flex;align-items:center;gap:8px;background:var(--dt-accent);color:#fff;border:none;border-radius:10px;padding:12px 24px;font-family:'Inter',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s,transform .15s;text-decoration:none }
  .dt-hero-btn:hover { background:#a03325;transform:translateY(-1px) }
  /* Orbit scene */
  .dt-orbit-wrap { display:flex;justify-content:center;padding:16px 0 8px;overflow:hidden }
  .dt-orbit-scene { position:relative;width:560px;height:560px;flex-shrink:0 }
  .dt-orbit-center { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;text-align:center;pointer-events:none }
  .dt-orbit-logo { width:80px;height:80px;border-radius:18px;background:var(--dt-accent);color:var(--dt-bg);display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-style:italic;font-weight:600;font-size:34px;margin:0 auto 12px;box-shadow:0 0 0 1px rgba(180,58,43,.12),0 8px 28px rgba(180,58,43,.22) }
  .dt-orbit-name { font-family:'Fraunces',serif;font-size:22px;font-weight:600;letter-spacing:-.015em;color:var(--dt-text) }
  .dt-orbit-by { font-size:12px;color:var(--dt-text-subtle);margin-top:2px }
  .dt-orbit-ring { position:absolute;top:50%;left:50%;border-radius:50%;border:1px dashed var(--dt-border);transform:translate(-50%,-50%);opacity:.6;animation:spin linear infinite }
  @keyframes spin { from { transform:translate(-50%,-50%) rotate(0deg) } to { transform:translate(-50%,-50%) rotate(360deg) } }
  @keyframes spin-rev { from { transform:translate(-50%,-50%) rotate(0deg) } to { transform:translate(-50%,-50%) rotate(-360deg) } }
  .dt-orbit-node { position:absolute;cursor:pointer }
  .dt-orbit-node-inner { display:flex;flex-direction:column;align-items:center;gap:3px;transition:transform .18s }
  .dt-orbit-node:hover .dt-orbit-node-inner { transform:scale(1.15) }
  .dt-orbit-node-pip { width:30px;height:30px;border-radius:50%;background:var(--dt-bg);border:1.5px solid var(--dt-border);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(28,27,23,.08);transition:background .18s,border-color .18s }
  .dt-orbit-node:hover .dt-orbit-node-pip { background:var(--dt-accent-soft);border-color:var(--dt-accent) }
  .dt-orbit-node-pip svg { color:var(--dt-text-muted);transition:color .18s }
  .dt-orbit-node:hover .dt-orbit-node-pip svg { color:var(--dt-accent) }
  /* Section cards grid */
  .dt-sec-grid-wrap { max-width:1100px;margin:0 auto;padding:40px 28px 80px }
  .dt-sec-grid-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--dt-border) }
  .dt-sec-grid-label { font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--dt-text-subtle) }
  .dt-sec-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px }
  .dt-sec-card { display:flex;flex-direction:column;gap:10px;padding:20px 22px 18px;border:1px solid var(--dt-border);border-radius:12px;background:var(--dt-bg);cursor:pointer;transition:all .2s;position:relative;overflow:hidden;text-align:left }
  .dt-sec-card::before { content:'';position:absolute;inset:0;background:var(--dt-accent-soft);opacity:0;transition:opacity .2s }
  .dt-sec-card:hover { border-color:var(--dt-border-strong);box-shadow:0 4px 16px rgba(28,27,23,.07);transform:translateY(-2px) }
  .dt-sec-card:hover::before { opacity:.35 }
  .dt-sec-card-top { display:flex;align-items:flex-start;justify-content:space-between;position:relative }
  .dt-sec-card-icon { width:34px;height:34px;border-radius:8px;background:var(--dt-surface);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s }
  .dt-sec-card:hover .dt-sec-card-icon { background:var(--dt-accent-soft-2) }
  .dt-sec-card-num { font-family:'Fraunces',serif;font-style:italic;font-size:13px;color:var(--dt-text-subtle);transition:opacity .2s }
  .dt-sec-card:hover .dt-sec-card-num { opacity:0 }
  .dt-sec-card-title { font-size:14px;font-weight:600;color:var(--dt-text);line-height:1.35;position:relative }
  .dt-sec-card-desc { font-size:12.5px;line-height:1.5;color:var(--dt-text-muted);position:relative }
  .dt-sec-card-arrow { position:absolute;top:0;right:0;color:var(--dt-text-subtle);opacity:0;transform:translateX(-4px);transition:opacity .2s,transform .2s }
  .dt-sec-card:hover .dt-sec-card-arrow { opacity:1;transform:translateX(0) }
  /* ── Arch diagram ── */
  .dt-arch { margin:28px 0;border-radius:14px;border:1px solid var(--dt-border);overflow:hidden;background:var(--dt-bg) }
  .dt-arch-header { padding:12px 20px;font-size:12px;font-weight:600;color:var(--dt-text-muted);letter-spacing:.04em;text-transform:uppercase;background:var(--dt-surface);border-bottom:1px solid var(--dt-border) }
  .dt-arch-body { padding:32px }
  .dt-arch-layer { border-radius:12px;border:1px solid var(--dt-border);padding:20px;margin-bottom:12px;background:var(--dt-surface);position:relative }
  .dt-arch-layer-label { position:absolute;top:-10px;left:16px;background:var(--dt-bg);padding:0 8px;font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--dt-text-subtle);border:1px solid var(--dt-border);border-radius:20px }
  .dt-arch-row { display:flex;gap:10px;flex-wrap:wrap }
  .dt-arch-box { display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:9px;border:1px solid var(--dt-border);background:var(--dt-bg);padding:12px 16px;text-align:center;font-size:13px;font-weight:600;color:var(--dt-text);gap:4px;flex:1;min-width:100px }
  .dt-arch-box-sub { font-size:11px;font-weight:400;color:var(--dt-text-muted) }
  .dt-arch-box-accent { border-color:var(--dt-accent);background:var(--dt-accent-soft) }
  .dt-arch-arrow { display:flex;align-items:center;justify-content:center;padding:4px 0 }
  .dt-arch-connector { width:2px;height:20px;background:var(--dt-border-strong);margin:0 auto;position:relative }
  .dt-arch-connector::after { content:'';position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid var(--dt-border-strong) }
  .dt-arch-badge { display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.02em;background:var(--dt-surface-2);color:var(--dt-text-muted);border:1px solid var(--dt-border) }
  .dt-arch-schemas { display:flex;gap:8px;flex-wrap:wrap;margin-top:10px }
  .dt-arch-schema { padding:6px 12px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--dt-text-muted);background:var(--dt-surface-2);border:1px solid var(--dt-border) }
  .dt-arch-schema-primary { color:var(--dt-accent);border-color:var(--dt-accent-soft-2);background:var(--dt-accent-soft) }
  .dt-footer { margin-top:80px;padding:32px 0;border-top:1px solid var(--dt-border);color:var(--dt-text-subtle);font-size:13px;display:flex;justify-content:space-between;align-items:center }
  @media(max-width:1200px) { .dt-doc { grid-template-columns:260px 1fr } .dt-toc { display:none } .dt-main { padding:0 40px } }
  @media(max-width:860px) { .dt-doc { grid-template-columns:1fr } .dt-sidebar { display:none } .dt-main { padding:0 24px } .dt-orbit-scene { width:min(440px,90vw);height:min(440px,90vw) } }
  @media(max-width:640px) { .dt-orbit-scene { width:min(340px,92vw);height:min(340px,92vw) } .dt-hero-top { padding-top:44px } .dt-sec-grid { grid-template-columns:1fr 1fr } }
  @media(max-width:480px) { .dt-sec-grid { grid-template-columns:1fr } .dt-main { padding:0 18px } }
  @media(prefers-reduced-motion:reduce) { .dt-orbit-ring,.dt-orbit-node { animation:none !important } }
`;

// ─── Modified markdown content ────────────────────────────────────────────────
// Changes applied:
// 1. "Tech Lead — você" → "Tech Lead" (impersonal tone)
// 2. "vocês não têm" → "a equipe não enfrenta" (impersonal)
// 3. "Vocês têm dois tipos" → "A equipe lida com dois tipos" (impersonal)
// 4. Reduced junior dev learning focus (section 3 condensed)
// 5. Financial app reference corrected (Toca cálculo financeiro → Toca lógica de domínio crítico)
// 6. "domínio financeiro" in sec 3 → "domínio crítico do produto"
// 7. Sec 1.5 principle about junior dev softened
// 8. Sec 2.3 header softened; no WordPress detail

// SECTIONS_DATA is imported from ./sections-meta

// ─── SVG icons for section cards ─────────────────────────────────────────────
function SectionIcon({
  type,
  size = 18,
}: {
  type: string;
  size?: number;
}) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    width: size,
    height: size,
  };
  const icons: Record<string, React.ReactElement> = {
    briefcase: (
      <svg {...props}>
        <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    users: (
      <svg {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    graduation: (
      <svg {...props}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 7 3 10 0v-5" />
      </svg>
    ),
    layers: (
      <svg {...props}>
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
        <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
        <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
      </svg>
    ),
    code: (
      <svg {...props}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    grid: (
      <svg {...props}>
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
    wallet: (
      <svg {...props}>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
    server: (
      <svg {...props}>
        <rect width="20" height="8" x="2" y="2" rx="2" />
        <rect width="20" height="8" x="2" y="14" rx="2" />
        <line x1="6" x2="6.01" y1="6" y2="6" />
        <line x1="6" x2="6.01" y1="18" y2="18" />
      </svg>
    ),
    git: (
      <svg {...props}>
        <circle cx="18" cy="18" r="3" />
        <circle cx="6" cy="6" r="3" />
        <path d="M13 6h3a2 2 0 0 1 2 2v7" />
        <path d="M6 9v12" />
      </svg>
    ),
    rocket: (
      <svg {...props}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
    chart: (
      <svg {...props}>
        <rect width="6" height="14" x="3" y="5" rx="1" />
        <rect width="6" height="10" x="9" y="9" rx="1" />
        <rect width="6" height="16" x="15" y="3" rx="1" />
      </svg>
    ),
    chat: (
      <svg {...props}>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    ),
    ai: (
      <svg {...props}>
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      </svg>
    ),
    shield: (
      <svg {...props}>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      </svg>
    ),
    check: (
      <svg {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    calendar: (
      <svg {...props}>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    bar: (
      <svg {...props}>
        <line x1="18" x2="18" y1="20" y2="10" />
        <line x1="12" x2="12" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="14" />
      </svg>
    ),
    monitor: (
      <svg {...props}>
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <path d="m8 21 4-4 4 4" />
        <path d="M7 17h10" />
      </svg>
    ),
    file: (
      <svg {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    arrow: (
      <svg {...props}>
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    ),
  };
  return icons[type] || icons.file;
}

// ─── Orbital hero ─────────────────────────────────────────────────────────────
// 19 sections: rings of 6, 6, 7
const RINGS = [
  {
    r: 105,
    dur: 44,
    rev: false,
    sections: [1, 4, 7, 10, 13, 16],
  },
  {
    r: 178,
    dur: 70,
    rev: true,
    sections: [2, 5, 8, 11, 14, 17],
  },
  {
    r: 248,
    dur: 100,
    rev: false,
    sections: [3, 6, 9, 12, 15, 18, 19],
  },
];
const CENTER = 280; // scene is 560×560

function OrbitalHero({
  onSectionClick,
  sectionsData,
}: {
  onSectionClick: (num: string) => void;
  sectionsData: typeof SECTIONS_DATA;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const nodes = RINGS.flatMap(({ r, dur, rev, sections }) =>
    sections.map((num, i) => {
      const angle = (360 / sections.length) * i - 90;
      const rad = (angle * Math.PI) / 180;
      return {
        num,
        r,
        dur,
        rev,
        cx: CENTER + r * Math.cos(rad),
        cy: CENTER + r * Math.sin(rad),
      };
    }),
  );

  return (
    <div className="dt-hero-wrap">
      {/* ── Centered headline ── */}
      <div className="dt-hero-top">
        <div className="dt-hero-eyebrow">
          <span className="dt-hero-eyebrow-dot" />
          Referência interna · v1.2 · 21 seções
        </div>
        <h1 className="dt-hero-title">
          Processo de{" "}
          <em
            style={{
              fontStyle: "italic",
              fontWeight: 400,
              color: "var(--dt-accent)",
            }}
          >
            Desenvolvimento
          </em>
        </h1>
        <p className="dt-hero-desc">
          Estrutura completa do processo da Arphia para o
          desenvolvimento e operação da plataforma DamaTools —
          equipe, arquitetura, segurança e operação.
        </p>
        <button
          className="dt-hero-btn"
          onClick={() => onSectionClick("1")}
        >
          Explorar documento
          <SectionIcon type="arrow" size={15} />
        </button>
      </div>

      {/* ── Orbital animation ── */}
      <div className="dt-orbit-wrap">
        <div className="dt-orbit-scene">
          {/* Rings */}
          {RINGS.map(({ r, dur, rev }) => (
            <div
              key={r}
              className="dt-orbit-ring"
              style={{
                width: r * 2,
                height: r * 2,
                animationDuration: `${dur}s`,
                animationDirection: rev ? "reverse" : "normal",
              }}
            />
          ))}

          {/* Center hub */}
          <div className="dt-orbit-center">
            <div className="dt-orbit-logo">
              <img
                src="/SimboloPreto-v3.svg"
                alt="DamaTools"
                style={{ width: 46, height: 46, filter: "invert(1)", display: "block" }}
              />
            </div>
            <div className="dt-orbit-name">DamaTools</div>
            <div className="dt-orbit-by">by Arphia</div>
          </div>

          {/* Orbiting nodes — all 18 sections */}
          {nodes.map(({ num, r, dur, rev, cx, cy }) => {
            const animName = rev ? "spin-rev" : "spin";
            const counterAnim = rev ? "spin" : "spin-rev";
            const sec = sectionsData[num - 1];
            return (
              <div
                key={num}
                className="dt-orbit-node"
                style={{
                  left: cx,
                  top: cy,
                  transform: "translate(-50%,-50%)",
                  animation: `${animName} ${dur}s linear infinite`,
                  transformOrigin: `${CENTER - cx}px ${CENTER - cy}px`,
                  zIndex: hovered === num ? 20 : 5,
                }}
                onClick={() => onSectionClick(String(num))}
                onMouseEnter={() => setHovered(num)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className="dt-orbit-node-inner"
                  style={{ animation: `${counterAnim} ${dur}s linear infinite`, position: "relative" }}
                >
                  {/* Tooltip — lives inside the counter-rotating div, so it always appears directly above the node */}
                  {hovered === num && (
                    <div style={{
                      position: "absolute",
                      bottom: "calc(100% + 8px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--dt-text)",
                      color: "var(--dt-bg)",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "5px 10px",
                      borderRadius: 6,
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      zIndex: 30,
                      letterSpacing: ".01em",
                    }}>
                      {sec.title}
                    </div>
                  )}
                  <div className="dt-orbit-node-pip">
                    <SectionIcon type={sec.icon} size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section cards grid ── */}
      <div className="dt-sec-grid-wrap">
        <div className="dt-sec-grid-header">
          <span className="dt-sec-grid-label">
            Todas as seções
          </span>
          <span
            style={{
              fontSize: 12,
              color: "var(--dt-text-subtle)",
            }}
          >
            clique para navegar
          </span>
        </div>
        <div className="dt-sec-grid">
          {sectionsData.map((sec) => (
            <button
              key={sec.num}
              className="dt-sec-card"
              onClick={() => onSectionClick(sec.num)}
            >
              <div className="dt-sec-card-top">
                <div
                  className="dt-sec-card-icon"
                  style={{ color: "var(--dt-accent)" }}
                >
                  <SectionIcon type={sec.icon} size={16} />
                </div>
                <span className="dt-sec-card-num">
                  {sec.num}
                </span>
                <span className="dt-sec-card-arrow">
                  <SectionIcon type="arrow" size={14} />
                </span>
              </div>
              <div className="dt-sec-card-title">
                {sec.title}
              </div>
              <div className="dt-sec-card-desc">{sec.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Architecture diagram (6.2) ───────────────────────────────────────────────
function ArchDiagram() {
  return (
    <div className="dt-arch">
      <div className="dt-arch-header">
        6.2 · Visão geral da arquitetura
      </div>
      <div className="dt-arch-body">
        {/* Client */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div
            className="dt-arch-box"
            style={{
              display: "inline-flex",
              flexDirection: "row",
              gap: 10,
              padding: "10px 24px",
              minWidth: 0,
              flex: "unset",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              width={16}
              height={16}
              style={{
                color: "var(--dt-text-muted)",
                flexShrink: 0,
              }}
            >
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <path d="m8 21 4-4 4 4M7 17h10" />
            </svg>
            <span>Cliente (navegador)</span>
            <div className="dt-arch-box-sub">HTTPS</div>
          </div>
        </div>
        <div className="dt-arch-connector" />

        {/* DigitalOcean droplet */}
        <div className="dt-arch-layer">
          <div className="dt-arch-layer-label">
            Droplet DigitalOcean
          </div>

          {/* Nginx */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 8,
              marginTop: 8,
            }}
          >
            <div
              className="dt-arch-box"
              style={{
                display: "inline-flex",
                flexDirection: "column",
                flex: "unset",
                padding: "10px 28px",
              }}
            >
              <span>Nginx</span>
              <div className="dt-arch-box-sub">
                reverse proxy · SSL · rate limiting
              </div>
            </div>
          </div>
          <div className="dt-arch-connector" />

          {/* Next.js app */}
          <div
            className="dt-arch-layer"
            style={{
              background: "var(--dt-bg)",
              marginBottom: 0,
            }}
          >
            <div
              className="dt-arch-layer-label"
              style={{ background: "var(--dt-surface)" }}
            >
              Aplicação Next.js · PM2
            </div>
            <div
              className="dt-arch-row"
              style={{ marginTop: 16 }}
            >
              {[
                "AMCC",
                "Calculadora",
                "RAS",
                "Calendário",
                "FGC",
                "···",
              ].map((m, i) => (
                <div
                  key={m}
                  className={`dt-arch-box${i === 5 ? "" : " dt-arch-box-accent"}`}
                  style={{
                    minWidth: 80,
                    fontSize: 12,
                    padding: "10px 10px",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    width={14}
                    height={14}
                    style={{
                      color:
                        i === 5
                          ? "var(--dt-text-subtle)"
                          : "var(--dt-accent)",
                    }}
                  >
                    <rect
                      width="7"
                      height="7"
                      x="3"
                      y="3"
                      rx="1"
                    />
                    <rect
                      width="7"
                      height="7"
                      x="14"
                      y="3"
                      rx="1"
                    />
                    <rect
                      width="7"
                      height="7"
                      x="14"
                      y="14"
                      rx="1"
                    />
                    <rect
                      width="7"
                      height="7"
                      x="3"
                      y="14"
                      rx="1"
                    />
                  </svg>
                  <span>{m}</span>
                </div>
              ))}
            </div>
            <div
              className="dt-arch-connector"
              style={{ marginTop: 12 }}
            />
            <div
              style={{ textAlign: "center", marginBottom: 8 }}
            >
              <div
                className="dt-arch-box"
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  flex: "unset",
                  padding: "10px 24px",
                  borderStyle: "dashed",
                }}
              >
                <span>Camada compartilhada</span>
                <div className="dt-arch-box-sub">
                  auth · db client · utils · logger
                </div>
              </div>
            </div>
          </div>
          <div className="dt-arch-connector" />

          {/* PostgreSQL */}
          <div
            className="dt-arch-layer"
            style={{
              background: "var(--dt-bg)",
              marginBottom: 0,
            }}
          >
            <div
              className="dt-arch-layer-label"
              style={{ background: "var(--dt-surface)" }}
            >
              PostgreSQL · mesma VM
            </div>
            <div
              className="dt-arch-schemas"
              style={{ marginTop: 16 }}
            >
              {[
                { label: "shared", primary: true },
                { label: "amcc", primary: false },
                { label: "calculator", primary: false },
                { label: "ras", primary: false },
                { label: "calendar", primary: false },
                { label: "fgc", primary: false },
                { label: "···", primary: false },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`dt-arch-schema${s.primary ? " dt-arch-schema-primary" : ""}`}
                >
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dt-arch-connector" />

        {/* Spaces */}
        <div style={{ textAlign: "center" }}>
          <div
            className="dt-arch-box"
            style={{
              display: "inline-flex",
              flexDirection: "row",
              gap: 10,
              padding: "10px 24px",
              flex: "unset",
              minWidth: 0,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              width={16}
              height={16}
              style={{ color: "var(--dt-text-muted)" }}
            >
              <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
              <polyline points="14 2 14 8 20 8" />
              <path d="m2 15 3 3 3-3" />
              <path d="M5 12v6" />
            </svg>
            <span>DigitalOcean Spaces</span>
            <div className="dt-arch-box-sub">
              backups · arquivos de cliente
            </div>
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid var(--dt-border)",
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {[
            {
              color: "var(--dt-accent-soft)",
              border: "var(--dt-accent)",
              label: "Módulo de negócio",
            },
            {
              color: "var(--dt-surface)",
              border: "var(--dt-border)",
              label: "Infraestrutura compartilhada",
            },
            {
              color: "var(--dt-accent-soft)",
              border: "var(--dt-accent)",
              label: "Schema principal (shared)",
              schema: true,
            },
          ].map((l, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "var(--dt-text-muted)",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  background: l.color,
                  border: `1px solid ${l.border}`,
                }}
              />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Diagram: Git flow ────────────────────────────────────────────────────────
function DiagramGitflow() {
  /* Posições Y de cada branch — hierarquia vertical:
     feature (topo) → develop (meio) → main (base) */
  const Y = { feature: 36, develop: 100, main: 164 };

  return (
    <div className="dt-diagram">
      <div className="dt-diagram-title">Fluxo de branches e ambientes</div>
      <svg
        viewBox="0 0 720 210"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          padding: "20px 12px",
        }}
      >
        <defs>
          <marker
            id="arr-tier1"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path
              d="M0,0.5 L5,3 L0,5.5"
              fill="none"
              stroke="var(--dt-tier1)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </marker>
          <marker
            id="arr-tier2"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path
              d="M0,0.5 L5,3 L0,5.5"
              fill="none"
              stroke="var(--dt-tier2)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </marker>
        </defs>

        {/* ── Labels das branches (esquerda) ── */}
        <text
          x="72"
          y={Y.feature + 4}
          textAnchor="end"
          fill="var(--dt-tier3)"
          fontSize="11"
          fontWeight="600"
          fontFamily="'JetBrains Mono', monospace"
        >
          feature/*
        </text>
        <text
          x="72"
          y={Y.develop + 4}
          textAnchor="end"
          fill="var(--dt-tier2)"
          fontSize="11"
          fontWeight="600"
          fontFamily="'JetBrains Mono', monospace"
        >
          develop
        </text>
        <text
          x="72"
          y={Y.main + 4}
          textAnchor="end"
          fill="var(--dt-tier1)"
          fontSize="11"
          fontWeight="600"
          fontFamily="'JetBrains Mono', monospace"
        >
          main
        </text>

        {/* ── Branch main (linha contínua, mais grossa — tronco estável) ── */}
        <line
          x1="84"
          y1={Y.main}
          x2="540"
          y2={Y.main}
          stroke="var(--dt-tier1)"
          strokeWidth="3"
        />
        {[110, 240, 420, 520].map((x) => (
          <circle
            key={`m-${x}`}
            cx={x}
            cy={Y.main}
            r="5"
            fill="var(--dt-tier1)"
          />
        ))}

        {/* ── Branch develop (linha contínua) ── */}
        <line
          x1="84"
          y1={Y.develop}
          x2="460"
          y2={Y.develop}
          stroke="var(--dt-tier2)"
          strokeWidth="2.5"
        />
        {[110, 180, 300, 390, 440].map((x) => (
          <circle
            key={`d-${x}`}
            cx={x}
            cy={Y.develop}
            r="4.5"
            fill="var(--dt-tier2)"
          />
        ))}

        {/* ── Feature branch (tracejada — temporária) ── */}
        <line
          x1="190"
          y1={Y.feature}
          x2="360"
          y2={Y.feature}
          stroke="var(--dt-tier3)"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        {[220, 270, 325].map((x) => (
          <circle
            key={`f-${x}`}
            cx={x}
            cy={Y.feature}
            r="4"
            fill="var(--dt-tier3)"
          />
        ))}

        {/* ── Curva: develop → feature (branch nasce do develop) ── */}
        <path
          d={`M180,${Y.develop} C180,${Y.feature + 18} 190,${Y.feature} 200,${Y.feature}`}
          fill="none"
          stroke="var(--dt-tier3)"
          strokeWidth="1.5"
        />

        {/* ── Curva: feature → develop (merge via PR + review) ── */}
        <path
          d={`M345,${Y.feature} C365,${Y.feature} 380,${Y.develop - 18} 390,${Y.develop}`}
          fill="none"
          stroke="var(--dt-tier2)"
          strokeWidth="1.5"
          markerEnd="url(#arr-tier2)"
        />
        <text
          x="382"
          y={(Y.feature + Y.develop) / 2 - 2}
          fill="var(--dt-text-subtle)"
          fontSize="9"
          fontFamily="Inter, sans-serif"
          fontStyle="italic"
        >
          PR + review
        </text>

        {/* ── Curva: develop → main (merge via PR + aprovação) ── */}
        <path
          d={`M440,${Y.develop} C450,${Y.develop + 15} 415,${Y.main - 10} 420,${Y.main}`}
          fill="none"
          stroke="var(--dt-tier1)"
          strokeWidth="1.5"
          markerEnd="url(#arr-tier1)"
        />
        <text
          x="458"
          y={(Y.develop + Y.main) / 2 + 2}
          fill="var(--dt-text-subtle)"
          fontSize="9"
          fontFamily="Inter, sans-serif"
          fontStyle="italic"
        >
          PR + aprovação
        </text>

        {/* ── Hotfix (nasce da main, retorna para main E develop) ── */}
        {/* Curva saindo da main para cima */}
        <path
          d={`M240,${Y.main} C240,${Y.main - 18} 250,${Y.main - 28} 265,${Y.main - 28}`}
          fill="none"
          stroke="var(--dt-tier1)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.75"
        />
        {/* Linha horizontal do hotfix */}
        <line
          x1="265"
          y1={Y.main - 28}
          x2="365"
          y2={Y.main - 28}
          stroke="var(--dt-tier1)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.75"
        />
        {/* Commit do hotfix */}
        <circle
          cx="315"
          cy={Y.main - 28}
          r="3.5"
          fill="var(--dt-tier1)"
          opacity="0.75"
        />
        {/* Label hotfix */}
        <text
          x="315"
          y={Y.main - 40}
          fill="var(--dt-tier1)"
          fontSize="9.5"
          fontFamily="Inter, sans-serif"
          textAnchor="middle"
          fontStyle="italic"
          opacity="0.8"
        >
          hotfix/*
        </text>
        {/* Merge de volta na main */}
        <path
          d={`M365,${Y.main - 28} C380,${Y.main - 28} 415,${Y.main - 8} 420,${Y.main}`}
          fill="none"
          stroke="var(--dt-tier1)"
          strokeWidth="1.5"
          opacity="0.75"
          markerEnd="url(#arr-tier1)"
        />
        {/* Merge obrigatório no develop (tracejado ascendente) */}
        <path
          d={`M340,${Y.main - 28} C340,${Y.main - 40} 310,${Y.develop + 12} 300,${Y.develop}`}
          fill="none"
          stroke="var(--dt-tier2)"
          strokeWidth="1.2"
          strokeDasharray="3 2"
          opacity="0.6"
          markerEnd="url(#arr-tier2)"
        />
        <text
          x="286"
          y={Y.develop + 16}
          fill="var(--dt-text-subtle)"
          fontSize="8"
          fontFamily="Inter, sans-serif"
          fontStyle="italic"
          opacity="0.7"
        >
          merge obrigatório
        </text>

        {/* ── Indicadores de auto deploy ── */}
        <rect
          x="445"
          y={Y.develop - 28}
          rx="4"
          width="72"
          height="16"
          fill="var(--dt-tier2)"
          opacity="0.12"
          stroke="var(--dt-tier2)"
          strokeWidth="0.5"
        />
        <text
          x="481"
          y={Y.develop - 17}
          fill="var(--dt-tier2)"
          fontSize="8.5"
          fontFamily="Inter, sans-serif"
          fontWeight="500"
          textAnchor="middle"
        >
          auto deploy
        </text>

        <rect
          x="525"
          y={Y.main - 28}
          rx="4"
          width="72"
          height="16"
          fill="var(--dt-tier1)"
          opacity="0.12"
          stroke="var(--dt-tier1)"
          strokeWidth="0.5"
        />
        <text
          x="561"
          y={Y.main - 17}
          fill="var(--dt-tier1)"
          fontSize="8.5"
          fontFamily="Inter, sans-serif"
          fontWeight="500"
          textAnchor="middle"
        >
          auto deploy
        </text>

        {/* ── Ambientes (direita, conectados por linhas pontilhadas) ── */}
        {[
          {
            y: Y.feature,
            label: "Local",
            color: "var(--dt-tier3)",
            lineFrom: 370,
          },
          {
            y: Y.develop,
            label: "Staging",
            color: "var(--dt-tier2)",
            lineFrom: 520,
          },
          {
            y: Y.main,
            label: "Produção",
            color: "var(--dt-tier1)",
            lineFrom: 600,
          },
        ].map((e) => (
          <g key={e.label}>
            <line
              x1={e.lineFrom}
              y1={e.y}
              x2="622"
              y2={e.y}
              stroke="var(--dt-border)"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
            <rect
              x="625"
              y={e.y - 13}
              width="84"
              height="26"
              rx="6"
              fill="var(--dt-surface)"
              stroke={e.color}
              strokeWidth="0.8"
            />
            <text
              x="667"
              y={e.y + 4}
              fill={e.color}
              fontSize="11"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="500"
              textAnchor="middle"
            >
              {e.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Diagram: Tiers ───────────────────────────────────────────────────────────
function DiagramTiers() {
  return (
    <div className="dt-diagram">
      <div className="dt-diagram-title">
        Classificação de tarefas por Tier
      </div>
      <svg
        viewBox="0 0 720 210"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          padding: "20px 12px",
        }}
      >
        {[
          {
            x: 40,
            w: 200,
            color: "var(--dt-tier1)",
            bg: "var(--dt-tier1-bg)",
            label: "Tier 1 — Crítico",
            items: [
              "Lógica de domínio crítico",
              "Cálculos regulatórios",
              "Código de autenticação",
              "Migrations de schema",
            ],
            who: "Tech Lead",
          },
          {
            x: 260,
            w: 200,
            color: "var(--dt-tier2)",
            bg: "var(--dt-tier2-bg)",
            label: "Tier 2 — Padrão",
            items: [
              "Telas que consomem cálculos",
              "CRUDs com regras de negócio",
              "Integrações externas",
              "Queries complexas",
            ],
            who: "Dev (A: Tech Lead)",
          },
          {
            x: 480,
            w: 200,
            color: "var(--dt-tier3)",
            bg: "var(--dt-tier3-bg)",
            label: "Tier 3 — Baixo risco",
            items: [
              "CSS e estilo visual",
              "Componentes sem lógica",
              "Documentação",
              "Refatoração de nomenclatura",
            ],
            who: "Dev (autonomia)",
          },
        ].map((t) => (
          <g key={t.label}>
            <rect
              x={t.x}
              y={20}
              width={t.w}
              height={30}
              rx="8"
              fill={t.color}
            />
            <text
              x={t.x + t.w / 2}
              y={40}
              fill="white"
              fontSize={11}
              fontWeight={700}
              fontFamily="Inter,sans-serif"
              textAnchor="middle"
            >
              {t.label}
            </text>
            <rect
              x={t.x}
              y={56}
              width={t.w}
              height={110}
              rx="8"
              fill={t.bg}
              stroke={t.color}
              strokeWidth={1}
              opacity={0.7}
            />
            {t.items.map((item, i) => (
              <g key={item}>
                <circle
                  cx={t.x + 14}
                  cy={76 + i * 22}
                  r={3}
                  fill={t.color}
                />
                <text
                  x={t.x + 24}
                  y={80 + i * 22}
                  fill="var(--dt-text)"
                  fontSize={10.5}
                  fontFamily="Inter,sans-serif"
                >
                  {item}
                </text>
              </g>
            ))}
            <rect
              x={t.x}
              y={172}
              width={t.w}
              height={22}
              rx="6"
              fill="var(--dt-bg)"
              stroke={t.color}
              strokeWidth={1}
              opacity={0.6}
            />
            <text
              x={t.x + t.w / 2}
              y={186}
              fill={t.color}
              fontSize={10}
              fontWeight={600}
              fontFamily="Inter,sans-serif"
              textAnchor="middle"
            >
              {t.who}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Diagram: CI/CD ───────────────────────────────────────────────────────────
function DiagramCICD() {
  const steps = [
    { label: "Push / PR", icon: "↑" },
    { label: "Lint & Type", icon: "✓" },
    { label: "Testes", icon: "⚙" },
    { label: "Build", icon: "▶" },
    { label: "Deploy\nStaging", icon: "→" },
    { label: "Deploy\nProd", icon: "✦" },
  ];
  return (
    <div className="dt-diagram">
      <div className="dt-diagram-title">Pipeline de CI/CD</div>
      <svg
        viewBox="0 0 720 120"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          padding: "20px 12px",
        }}
      >
        {steps.map((s, i) => {
          const x = 60 + i * 105;
          return (
            <g key={s.label}>
              <rect
                x={x - 42}
                y={30}
                width={84}
                height={50}
                rx="10"
                fill="var(--dt-surface)"
                stroke="var(--dt-border)"
                strokeWidth={1}
              />
              <text
                x={x}
                y={52}
                fill="var(--dt-accent)"
                fontSize={14}
                fontFamily="JetBrains Mono,monospace"
                textAnchor="middle"
              >
                {s.icon}
              </text>
              <text
                x={x}
                y={70}
                fill="var(--dt-text-muted)"
                fontSize={10}
                fontFamily="Inter,sans-serif"
                textAnchor="middle"
              >
                {s.label.split("\n")[0]}
              </text>
              {s.label.includes("\n") && (
                <text
                  x={x}
                  y={82}
                  fill="var(--dt-text-muted)"
                  fontSize={10}
                  fontFamily="Inter,sans-serif"
                  textAnchor="middle"
                >
                  {s.label.split("\n")[1]}
                </text>
              )}
              {i < steps.length - 1 && (
                <line
                  x1={x + 42}
                  y1={55}
                  x2={x + 63}
                  y2={55}
                  stroke="var(--dt-border-strong)"
                  strokeWidth={1.5}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Diagram: Scrumban ────────────────────────────────────────────────────────
function DiagramScrumban() {
  const cols = [
    { label: "Backlog", color: "var(--dt-surface-2)", border: "var(--dt-border)", cards: [] as {text:string,tier:number}[] },
    { label: "A fazer", color: "var(--dt-surface)", border: "var(--dt-border)", cards: [
      { text: "Tier 1: Calculadora IOF", tier: 1 },
      { text: "Tier 3: Ajuste de CSS", tier: 3 },
    ]},
    { label: "Em andamento (WIP: 2)", color: "var(--dt-accent-soft)", border: "var(--dt-accent)", cards: [
      { text: "Tier 2: Tela de resultados", tier: 2 },
      { text: "Tier 1: Amortização SAC", tier: 1 },
    ]},
    { label: "Review", color: "var(--dt-tier2-bg)", border: "var(--dt-tier2)", cards: [
      { text: "Tier 3: Documentação API", tier: 3 },
    ]},
    { label: "Concluído", color: "var(--dt-tier3-bg)", border: "var(--dt-tier3)", cards: [
      { text: "Tier 3: Componente Header", tier: 3 },
      { text: "Tier 2: Formulário cadastro", tier: 2 },
    ]},
  ];

  const tierColors: Record<number,string> = {
    1: "var(--dt-tier1)",
    2: "var(--dt-tier2)",
    3: "var(--dt-tier3)",
  };
  const tierBgs: Record<number,string> = {
    1: "var(--dt-tier1-bg)",
    2: "var(--dt-tier2-bg)",
    3: "var(--dt-tier3-bg)",
  };

  const colW = 124, gap = 9, totalW = cols.length * colW + (cols.length - 1) * gap;
  const startX = (720 - totalW) / 2;

  return (
    <div className="dt-diagram">
      <div className="dt-diagram-title">Board Scrumban — exemplo de sprint</div>
      <svg viewBox="0 0 720 220" style={{ display: "block", width: "100%", height: "auto", padding: "12px 8px" }}>
        {cols.map((col, ci) => {
          const x = startX + ci * (colW + gap);
          return (
            <g key={col.label}>
              {/* Column header */}
              <rect x={x} y={10} width={colW} height={26} rx="7"
                fill={col.color} stroke={col.border} strokeWidth={1} />
              <text x={x + colW / 2} y={27} fill="var(--dt-text)" fontSize={10} fontWeight={600}
                fontFamily="Inter,sans-serif" textAnchor="middle">{col.label}</text>
              {/* Cards */}
              {col.cards.map((card, i) => (
                <g key={card.text}>
                  <rect x={x + 4} y={44 + i * 52} width={colW - 8} height={44} rx="6"
                    fill={tierBgs[card.tier]} stroke={tierColors[card.tier]} strokeWidth={1} />
                  {/* Tier badge */}
                  <rect x={x + 8} y={48 + i * 52} width={36} height={14} rx="3"
                    fill={tierColors[card.tier]} />
                  <text x={x + 26} y={59 + i * 52} fill="white" fontSize={8} fontWeight={700}
                    fontFamily="Inter,sans-serif" textAnchor="middle">{`Tier ${card.tier}`}</text>
                  {/* Card text */}
                  {card.text.length > 18 ? (
                    <>
                      <text x={x + 8} y={71 + i * 52} fill="var(--dt-text)" fontSize={9.5}
                        fontFamily="Inter,sans-serif">{card.text.slice(0, 18)}</text>
                      <text x={x + 8} y={82 + i * 52} fill="var(--dt-text)" fontSize={9.5}
                        fontFamily="Inter,sans-serif">{card.text.slice(18)}</text>
                    </>
                  ) : (
                    <text x={x + 8} y={77 + i * 52} fill="var(--dt-text)" fontSize={9.5}
                      fontFamily="Inter,sans-serif">{card.text}</text>
                  )}
                </g>
              ))}
            </g>
          );
        })}
        {/* Legend */}
        {[{t:1,l:"Tier 1 — Crítico"},{t:2,l:"Tier 2 — Padrão"},{t:3,l:"Tier 3 — Baixo risco"}].map((item,i) => (
          <g key={item.t}>
            <rect x={30 + i * 222} y={192} width={10} height={10} rx="2"
              fill={tierColors[item.t]} />
            <text x={44 + i * 222} y={201} fill="var(--dt-text-muted)" fontSize={10}
              fontFamily="Inter,sans-serif">{item.l}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Diagram: Security ────────────────────────────────────────────────────────
function DiagramSecurity() {
  const layers = [
    { label: "Rede & Nginx",     sub: "rate limiting · HTTPS/TLS · headers de segurança",  color: "#5B6EAE" },
    { label: "Autenticação",     sub: "Auth.js · argon2id · MFA · bloqueio por brute force", color: "#A66B14" },
    { label: "Autorização",      sub: "RBAC multi-tenant · IDOR prevention · middleware",   color: "#B43A2B" },
    { label: "Validação",        sub: "Zod · TypeScript · constraints no banco",            color: "#3B6E47" },
    { label: "Dados do cliente", sub: "criptografia · audit log · mascaramento",            color: "#8B5E3C" },
  ];

  const bH = 52, gap = 7, indent = 46;

  return (
    <div className="dt-diagram">
      <div className="dt-diagram-title">Defesa em profundidade — camadas de segurança</div>
      <svg viewBox="0 0 720 316" style={{ display: "block", width: "100%", height: "auto" }}>
        <defs>
          {layers.map((l, i) => (
            <linearGradient key={l.label} id={`sec-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={l.color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={l.color} stopOpacity="0.04" />
            </linearGradient>
          ))}
        </defs>

        {layers.map((l, i) => {
          const x = 4 + i * indent;
          const w = 712 - i * indent * 2;
          const y = i * (bH + gap);
          const isLast = i === layers.length - 1;
          return (
            <g key={l.label}>
              {/* Band background */}
              <rect x={x} y={y} width={w} height={bH} rx={10}
                fill={`url(#sec-grad-${i})`}
                stroke={l.color} strokeWidth={1.5} strokeOpacity={0.45} />
              {/* Left accent bar */}
              <rect x={x} y={y} width={7} height={bH} rx={5}
                fill={l.color} fillOpacity={0.75} />
              {/* Layer number badge */}
              <circle cx={x + 22} cy={y + bH / 2} r={11}
                fill={l.color} fillOpacity={0.15} stroke={l.color} strokeWidth={1.2} />
              <text x={x + 22} y={y + bH / 2 + 4} fill={l.color} fontSize={11} fontWeight={700}
                fontFamily="Inter,sans-serif" textAnchor="middle">{i + 1}</text>
              {/* Layer name */}
              <text x={x + 42} y={y + bH / 2 - 6} fill={l.color} fontSize={13} fontWeight={700}
                fontFamily="Inter,sans-serif" dominantBaseline="auto">{l.label}</text>
              {/* Sub label */}
              <text x={x + 42} y={y + bH / 2 + 12} fill="var(--dt-text-muted)" fontSize={10.5}
                fontFamily="Inter,sans-serif">{l.sub}</text>
              {/* Right shield marker for innermost */}
              {isLast && (
                <text x={x + w - 14} y={y + bH / 2 + 5} fill={l.color} fontSize={16}
                  fontFamily="Inter,sans-serif" textAnchor="middle">🔒</text>
              )}
            </g>
          );
        })}

        {/* Arrow pointing inward */}
        <text x={360} y={290} fill="var(--dt-text-subtle)" fontSize={11}
          fontFamily="Inter,sans-serif" textAnchor="middle" fontStyle="italic">
          ↑ cada camada é independente — se uma falha, as demais seguram
        </text>
      </svg>
    </div>
  );
}

// ─── RBAC multi-tenant diagram ────────────────────────────────────────────────
function DiagramRBAC() {
  const modules = [
    { label: "AMCC",        color: "#5B6EAE", bg: "#E8EBF7" },
    { label: "Calculadora", color: "#A66B14", bg: "#F5E8D0" },
    { label: "RAS",         color: "#3B6E47", bg: "#DCEAE0" },
    { label: "Calendário",  color: "#8B5E3C", bg: "#F5EDE4" },
  ];

  const roles = [
    { label: "owner",  color: "#B43A2B", bg: "#F5E3DE" },
    { label: "admin",  color: "#A66B14", bg: "#F5E8D0" },
    { label: "member", color: "#3B6E47", bg: "#DCEAE0" },
  ];

  // Module box positions (inside org container)
  const orgX = 44, orgY = 96, orgW = 632, orgH = 118;
  const modW = 130, modH = 52, modGap = 14;
  const totalModW = modules.length * modW + (modules.length - 1) * modGap;
  const modOffsetX = orgX + (orgW - totalModW) / 2;
  const modY = orgY + 32;

  return (
    <div className="dt-diagram">
      <div className="dt-diagram-title">Modelo RBAC multi-tenant</div>
      <svg viewBox="0 0 720 278" style={{ display: "block", width: "100%", height: "auto" }}>

        {/* ── User card ── */}
        <rect x={270} y={8} width={180} height={64} rx={12}
          fill="var(--dt-surface)" stroke="var(--dt-border)" strokeWidth={1.5} />
        {/* Person icon */}
        <circle cx={302} cy={32} r={10} fill="none" stroke="var(--dt-text-muted)" strokeWidth={1.5} />
        <path d="M286 64 Q286 52 302 52 Q318 52 318 64"
          fill="none" stroke="var(--dt-text-muted)" strokeWidth={1.5} strokeLinecap="round" />
        <text x={325} y={28} fill="var(--dt-text)" fontSize={13} fontWeight={700}
          fontFamily="Inter,sans-serif">Usuário</text>
        {/* Role pills */}
        {roles.map((r, i) => (
          <g key={r.label}>
            <rect x={325 + i * 50} y={36} width={44} height={18} rx={6}
              fill={r.bg} stroke={r.color} strokeWidth={1} />
            <text x={347 + i * 50} y={49} fill={r.color} fontSize={9.5} fontWeight={600}
              fontFamily="Inter,sans-serif" textAnchor="middle">{r.label}</text>
          </g>
        ))}

        {/* ── Arrow user → org ── */}
        <line x1={360} y1={72} x2={360} y2={94} stroke="var(--dt-border-strong)"
          strokeWidth={1.5} markerEnd="url(#arrow)" />
        <text x={368} y={86} fill="var(--dt-text-subtle)" fontSize={10}
          fontFamily="Inter,sans-serif">pertence a (com role)</text>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="var(--dt-border-strong)" />
          </marker>
          <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="var(--dt-border-strong)" />
          </marker>
        </defs>

        {/* ── Organization container ── */}
        <rect x={orgX} y={orgY} width={orgW} height={orgH} rx={14}
          fill="var(--dt-surface)" stroke="var(--dt-accent)" strokeWidth={1.5}
          strokeDasharray="6,4" />
        <text x={orgX + 16} y={orgY + 20} fill="var(--dt-accent)" fontSize={11} fontWeight={700}
          fontFamily="Inter,sans-serif" letterSpacing="0.06em">ORGANIZAÇÃO</text>
        {/* tenantId badge */}
        <rect x={orgX + orgW - 150} y={orgY + 8} width={138} height={20} rx={6}
          fill="var(--dt-accent-soft)" stroke="var(--dt-accent-soft-2)" />
        <text x={orgX + orgW - 81} y={orgY + 21} fill="var(--dt-accent)" fontSize={9.5}
          fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight={600}>
          tenantId isolado por schema
        </text>

        {/* ── Module boxes ── */}
        {modules.map((m, i) => {
          const mx = modOffsetX + i * (modW + modGap);
          return (
            <g key={m.label}>
              <rect x={mx} y={modY} width={modW} height={modH} rx={10}
                fill={m.bg} stroke={m.color} strokeWidth={1.5} />
              <text x={mx + modW / 2} y={modY + 22} fill={m.color} fontSize={12} fontWeight={700}
                fontFamily="Inter,sans-serif" textAnchor="middle">{m.label}</text>
              <text x={mx + modW / 2} y={modY + 38} fill="var(--dt-text-muted)" fontSize={9.5}
                fontFamily="Inter,sans-serif" textAnchor="middle">acesso por role</text>
            </g>
          );
        })}

        {/* ── Arrow org → db ── */}
        <line x1={360} y1={orgY + orgH} x2={360} y2={226} stroke="var(--dt-border-strong)"
          strokeWidth={1.5} markerEnd="url(#arrow2)" />
        <text x={368} y={221} fill="var(--dt-text-subtle)" fontSize={10}
          fontFamily="Inter,sans-serif">queries filtradas por organizationId</text>

        {/* ── Database ── */}
        <rect x={238} y={228} width={244} height={38} rx={8}
          fill="var(--dt-surface)" stroke="var(--dt-border-strong)" strokeWidth={1.5} />
        <text x={360} y={243} fill="var(--dt-text)" fontSize={11} fontWeight={700}
          fontFamily="Inter,sans-serif" textAnchor="middle">PostgreSQL</text>
        <text x={360} y={258} fill="var(--dt-text-muted)" fontSize={10}
          fontFamily="Inter,sans-serif" textAnchor="middle">schemas isolados · organizationId em toda query</text>

        {/* ── 3-layer verification note ── */}
        <text x={360} y={277} fill="var(--dt-text-subtle)" fontSize={10}
          fontFamily="Inter,sans-serif" textAnchor="middle" fontStyle="italic">
          Verificação em 3 camadas: Middleware → Lógica de aplicação → UI
        </text>
      </svg>
    </div>
  );
}

// ─── Monitoring diagram ────────────────────────────────────────────────────────
function DiagramMonitoring() {
  const pillars = [
    { label: "Erros",        sub: "Sentry",               color: "var(--dt-tier1)", bg: "var(--dt-tier1-bg)" },
    { label: "Disponibilidade", sub: "UptimeRobot",       color: "var(--dt-tier2)", bg: "var(--dt-tier2-bg)" },
    { label: "Performance",  sub: "Middleware + Logs",    color: "var(--dt-tier3)", bg: "var(--dt-tier3-bg)" },
    { label: "Logs",         sub: "Pino + logrotate",     color: "#5B6EAE",         bg: "#E8EBF7" },
    { label: "Infraestrutura", sub: "DO Monitoring + PM2", color: "#8B5E3C",       bg: "#F5EDE4" },
  ];
  const colW = 120, gap = 14, totalW = pillars.length * colW + (pillars.length - 1) * gap;
  const offsetX = (720 - totalW) / 2;

  return (
    <div className="dt-diagram">
      <div className="dt-diagram-title">Cinco pilares de monitoramento</div>
      <svg viewBox="0 0 720 200" style={{ display: "block", width: "100%", height: "auto", padding: "20px 12px" }}>
        {/* Central hub */}
        <rect x={310} y={84} width={100} height={32} rx="10" fill="var(--dt-surface)" stroke="var(--dt-border)" strokeWidth={1} />
        <text x={360} y={104} fill="var(--dt-text)" fontSize={11} fontWeight={700} fontFamily="Inter,sans-serif" textAnchor="middle">Slack #alertas</text>

        {pillars.map((p, i) => {
          const cx = offsetX + i * (colW + gap) + colW / 2;
          return (
            <g key={p.label}>
              {/* Pillar box */}
              <rect x={offsetX + i * (colW + gap)} y={14} width={colW} height={56} rx="10"
                fill={p.bg} stroke={p.color} strokeWidth={1.5} />
              <text x={cx} y={38} fill={p.color} fontSize={12} fontWeight={700}
                fontFamily="Inter,sans-serif" textAnchor="middle">{p.label}</text>
              <text x={cx} y={56} fill="var(--dt-text-muted)" fontSize={10}
                fontFamily="Inter,sans-serif" textAnchor="middle">{p.sub}</text>
              {/* Connector to hub */}
              <line x1={cx} y1={70} x2={360} y2={84} stroke={p.color}
                strokeWidth={1.2} strokeDasharray="4,3" opacity={0.6} />
            </g>
          );
        })}

        {/* Severity legend */}
        {[
          { label: "Crítica → DM + Slack", x: 60,  color: "var(--dt-tier1)" },
          { label: "Alta → #alertas",       x: 250, color: "var(--dt-tier2)" },
          { label: "Média → #alertas",      x: 420, color: "var(--dt-tier3)" },
          { label: "Baixa → #builds",       x: 580, color: "var(--dt-text-subtle)" },
        ].map(b => (
          <g key={b.label}>
            <rect x={b.x} y={148} width={130} height={26} rx="6"
              fill="var(--dt-surface)" stroke="var(--dt-border)" strokeWidth={1} />
            <circle cx={b.x + 12} cy={161} r={4} fill={b.color} />
            <text x={b.x + 22} y={165} fill="var(--dt-text-muted)" fontSize={10}
              fontFamily="Inter,sans-serif">{b.label}</text>
          </g>
        ))}
        <text x={360} y={196} fill="var(--dt-text-subtle)" fontSize={10}
          fontFamily="Inter,sans-serif" textAnchor="middle">Hierarquia de severidade de alertas</text>
      </svg>
    </div>
  );
}

// ─── Diagram: Dev Formation ───────────────────────────────────────────────────
function DiagramDevFormation() {
  const phases = [
    {
      num: "0",
      label: "Fundamentos",
      period: "Semanas 1–8",
      color: "var(--dt-text-subtle)",
      bg: "var(--dt-surface-2)",
      items: ["Lógica de programação", "Git e ambiente", "Leitura de código", "Sem entrega de produto"],
    },
    {
      num: "1",
      label: "Primeiro código",
      period: "Semanas 9–16",
      color: "var(--dt-tier3)",
      bg: "var(--dt-tier3-bg)",
      items: ["Exclusivamente Tier 3", "Alta supervisão", "PR diário ou a cada 50 linhas", "1h pair/dia"],
    },
    {
      num: "2",
      label: "Autonomia gradual",
      period: "Semanas 17–24",
      color: "var(--dt-tier2)",
      bg: "var(--dt-tier2-bg)",
      items: ["Tier 3 com autonomia", "Primeiros Tier 2", "WIP limit: 2", "Pair: 1x/semana"],
    },
    {
      num: "3",
      label: "Maturação",
      period: "A partir do 6º mês",
      color: "var(--dt-tier1)",
      bg: "var(--dt-tier1-bg)",
      items: ["Tier 2 pleno", "Tier 1 em pair", "Contribui à arquitetura", "Revisa Tier 3"],
    },
  ];

  const cardW = 150, gap = 20, connH = 40, totalW = phases.length * cardW + (phases.length - 1) * gap;
  const startX = (720 - totalW) / 2;
  const cardH = 145;

  return (
    <div className="dt-diagram">
      <div className="dt-diagram-title">Fases de integração do desenvolvedor</div>
      <svg viewBox="0 0 720 240" style={{ display: "block", width: "100%", height: "auto", padding: "16px 8px" }}>
        {/* Connecting spine */}
        <line
          x1={startX + cardW / 2} y1={connH + cardH / 2}
          x2={startX + (phases.length - 1) * (cardW + gap) + cardW / 2} y2={connH + cardH / 2}
          stroke="var(--dt-border-strong)" strokeWidth={2} strokeDasharray="5,3"
        />
        {phases.map((phase, i) => {
          const x = startX + i * (cardW + gap);
          return (
            <g key={phase.num}>
              {/* Card */}
              <rect x={x} y={connH} width={cardW} height={cardH} rx="10"
                fill={phase.bg} stroke={phase.color} strokeWidth={1.5} />
              {/* Phase number badge */}
              <circle cx={x + cardW / 2} cy={connH} r={16} fill={phase.color} />
              <text x={x + cardW / 2} y={connH + 5} fill="white" fontSize={13} fontWeight={700}
                fontFamily="'Fraunces',serif" textAnchor="middle" fontStyle="italic">{phase.num}</text>
              {/* Label */}
              <text x={x + cardW / 2} y={connH + 26} fill={phase.color} fontSize={11.5} fontWeight={700}
                fontFamily="Inter,sans-serif" textAnchor="middle">{phase.label}</text>
              {/* Period */}
              <text x={x + cardW / 2} y={connH + 40} fill="var(--dt-text-muted)" fontSize={9.5}
                fontFamily="Inter,sans-serif" textAnchor="middle" fontStyle="italic">{phase.period}</text>
              {/* Divider */}
              <line x1={x + 10} y1={connH + 48} x2={x + cardW - 10} y2={connH + 48}
                stroke={phase.color} strokeWidth={0.5} opacity={0.4} />
              {/* Items */}
              {phase.items.map((item, j) => (
                <g key={item}>
                  <circle cx={x + 14} cy={connH + 60 + j * 20} r={2.5} fill={phase.color} opacity={0.7} />
                  <text x={x + 22} y={connH + 64 + j * 20} fill="var(--dt-text)" fontSize={9.5}
                    fontFamily="Inter,sans-serif">{item}</text>
                </g>
              ))}
            </g>
          );
        })}
        {/* Arrows between phases */}
        {phases.slice(0, -1).map((_, i) => {
          const ax = startX + (i + 1) * (cardW + gap) - gap / 2;
          const ay = connH + cardH / 2;
          return (
            <g key={i}>
              <polygon points={`${ax - 5},${ay - 5} ${ax + 6},${ay} ${ax - 5},${ay + 5}`}
                fill="var(--dt-border-strong)" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Diagram: Roadmap ─────────────────────────────────────────────────────────
function DiagramRoadmap() {
  const phases = [
    { label: "Mês 1", sub: "Fundação", color: "var(--dt-tier3)", items: ["Infra + CI/CD", "Dev: estudo", "CLAUDE.md"] },
    { label: "Meses 2-3", sub: "Estabilização", color: "var(--dt-tier2)", items: ["AMCC beta", "Dev: Tier 3", "Primeiras features"] },
    { label: "Meses 4-6", sub: "Maturação", color: "var(--dt-tier1)", items: ["Calculadora v1", "Dev: Tier 2", "Clientes piloto"] },
    { label: "Mês 7+", sub: "Operação", color: "#5B6EAE", items: ["Roadmap Fase 1", "Dev pleno", "Avaliação trimestral"] },
  ];

  const colW = 154, gap = 12, totalW = phases.length * colW + (phases.length - 1) * gap;
  const startX = (720 - totalW) / 2;

  return (
    <div className="dt-diagram">
      <div className="dt-diagram-title">Roadmap de implantação</div>
      <svg viewBox="0 0 720 175" style={{ display: "block", width: "100%", height: "auto", padding: "16px 8px" }}>
        {/* Connecting spine */}
        <line x1={startX} y1={44} x2={startX + totalW} y2={44} stroke="var(--dt-border)" strokeWidth={1.5} />
        {phases.map((phase, i) => {
          const x = startX + i * (colW + gap);
          return (
            <g key={phase.label}>
              {/* Timeline dot */}
              <circle cx={x + colW / 2} cy={44} r={8} fill={phase.color} />
              {/* Month label above */}
              <text x={x + colW / 2} y={20} fill={phase.color} fontSize={12} fontWeight={700}
                fontFamily="Inter,sans-serif" textAnchor="middle">{phase.label}</text>
              <text x={x + colW / 2} y={34} fill="var(--dt-text-muted)" fontSize={9.5}
                fontFamily="Inter,sans-serif" textAnchor="middle">{phase.sub}</text>
              {/* Card below */}
              <rect x={x} y={58} width={colW} height={95} rx="8"
                fill="var(--dt-surface)" stroke={phase.color} strokeWidth={1} opacity={0.9} />
              {phase.items.map((item, j) => (
                <g key={item}>
                  <circle cx={x + 14} cy={76 + j * 26} r={3} fill={phase.color} />
                  <text x={x + 24} y={80 + j * 26} fill="var(--dt-text)" fontSize={10.5}
                    fontFamily="Inter,sans-serif">{item}</text>
                </g>
              ))}
              {/* Arrow */}
              {i < phases.length - 1 && (
                <polygon
                  points={`${x + colW + 4},${40} ${x + colW + gap - 4},${44} ${x + colW + 4},${48}`}
                  fill="var(--dt-border-strong)"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
const mdRenderer = new marked.Renderer();
// Wrap every table in a scroll container so layout stays intact
mdRenderer.table = function(token: any) {
  const defaultTable = marked.Renderer.prototype.table.call(this, token) as string;
  return `<div class="dt-md-table-wrap">${defaultTable}</div>`;
};
marked.setOptions({ gfm: true, breaks: false, renderer: mdRenderer } as any);

function renderMarkdownHTML(md: string): string {
  return marked.parse(md) as string;
}

// ─── Section heading extractor ────────────────────────────────────────────────
type SectionEntry = {
  num: string | null;
  title: string;
  slug: string;
};

function extractSections(md: string): SectionEntry[] {
  const sections: SectionEntry[] = [];
  const lines = md.split("\n");
  for (const line of lines) {
    if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      const numMatch = text.match(/^(\d+)\.\s+(.+)/);
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-");
      if (numMatch) {
        sections.push({
          num: numMatch[1],
          title: numMatch[2],
          slug,
        });
      } else {
        sections.push({ num: null, title: text, slug });
      }
    }
  }
  return sections;
}

// ─── Supabase section type ────────────────────────────────────────────────────
type DbSection = {
  num: string;
  title: string;
  icon: string;
  description: string;
  content: string;
  sort_order: number;
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [dark, setDark] = useState(false);
  const [view, setView] = useState<"landing" | "doc">(
    "landing",
  );
  const [activeSec, setActiveSec] = useState<string>("1");
  const [activeToc, setActiveToc] = useState<string>("");
  const [showLogin, setShowLogin] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Supabase doc content ──────────────────────────────────────────────────
  const [dbSections, setDbSections] = useState<DbSection[] | null>(null);

  useEffect(() => {
    supabase
      .from("doc_sections")
      .select("num,title,icon,description,content,sort_order")
      .order("sort_order")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setDbSections(data as DbSection[]);
        }
      });
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────
  // While dbSections is null (still loading), use SECTIONS_DATA for the cards
  // so the landing page renders immediately.
  const cardData = dbSections
    ? dbSections
        .filter((s) => s.num !== "0")
        .map((s) => ({ num: s.num, title: s.title, icon: s.icon, desc: s.description }))
    : SECTIONS_DATA;

  const md = (dbSections ?? []).map((s) => s.content).join("\n");

  const sections = extractSections(md);

  // Split markdown at every diagram placeholder, preserving insertion order
  const DIAGRAM_MARKERS = [
    "TIERS_DIAGRAM_PLACEHOLDER",
    "ARCH_DIAGRAM_PLACEHOLDER",
    "GITFLOW_DIAGRAM_PLACEHOLDER",
    "CICD_DIAGRAM_PLACEHOLDER",
    "SCRUMBAN_DIAGRAM_PLACEHOLDER",
    "SECURITY_DIAGRAM_PLACEHOLDER",
    "MONITORING_DIAGRAM_PLACEHOLDER",
    "DEVFORMATION_DIAGRAM_PLACEHOLDER",
    "ROADMAP_DIAGRAM_PLACEHOLDER",
    "RBAC_DIAGRAM_PLACEHOLDER",
  ] as const;
  type DiagramKey = typeof DIAGRAM_MARKERS[number];

  // Split the full markdown into alternating [text, marker, text, marker, …, text]
  const mdChunks = useMemo(() => {
    const allMarkers = DIAGRAM_MARKERS.join("|");
    const re = new RegExp(`(${allMarkers})`);
    return md.split(re);
  }, [md]);

  const renderedChunks = useMemo(
    () => mdChunks.map(chunk =>
      DIAGRAM_MARKERS.includes(chunk as DiagramKey)
        ? chunk                           // marker — pass through
        : renderMarkdownHTML(chunk)       // prose — render to HTML
    ),
    [mdChunks]
  );

  // Keep backwards-compat names used in the section-ID effect below
  const htmlBefore = renderedChunks[0];
  const htmlAfter  = renderedChunks.slice(2).filter(c => !DIAGRAM_MARKERS.includes(c as DiagramKey)).join("");

  // Inject section IDs after render
  useEffect(() => {
    if (view !== "doc" || !contentRef.current) return;
    const el = contentRef.current;
    el.querySelectorAll("h2").forEach((h2) => {
      const text = h2.textContent?.trim() || "";
      const numMatch = text.match(/^(\d+)\./);
      if (numMatch) {
        h2.id = `sec-${numMatch[1]}`;
        // Style the number
        const num = numMatch[1];
        const rest = text.replace(/^\d+\.\s*/, "");
        h2.innerHTML = `<span style="display:inline-block;font-family:'Fraunces',serif;font-style:italic;font-weight:400;font-size:.65em;color:var(--dt-accent);margin-right:16px;vertical-align:baseline">${num}<span style="margin-left:16px;color:var(--dt-text-subtle);font-style:normal">·</span></span>${rest}`;
      }
    });
    el.querySelectorAll("h3").forEach((h3) => {
      const text = h3.textContent?.trim() || "";
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-");
      h3.id = slug;
    });
  }, [view, htmlBefore, htmlAfter]);

  // Scroll spy
  useEffect(() => {
    if (view !== "doc") return;
    const onScroll = () => {
      if (!contentRef.current) return;
      const headers =
        contentRef.current.querySelectorAll("h2[id]");
      let cur = "1";
      headers.forEach((h) => {
        if (
          (h as HTMLElement).offsetTop - 100 <=
          window.scrollY
        ) {
          cur = h.id.replace("sec-", "");
        }
      });
      setActiveSec(cur);

      const h3s =
        contentRef.current?.querySelectorAll("h3[id]");
      let tocCur = "";
      h3s?.forEach((h) => {
        if (
          (h as HTMLElement).offsetTop - 100 <=
          window.scrollY
        ) {
          tocCur = "#" + h.id;
        }
      });
      setActiveToc(tocCur);
    };
    window.addEventListener("scroll", onScroll, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, [view]);

  const navigateToSection = useCallback((num: string) => {
    setView("doc");
    setActiveSec(num);
    requestAnimationFrame(() => {
      const el = document.getElementById(`sec-${num}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const goToSection = useCallback((num: string) => {
    if (!user) {
      setPendingSection(num);
      setShowLogin(true);
      return;
    }
    navigateToSection(num);
  }, [user, navigateToSection]);

  // Build TOC for active section
  const tocItems: { href: string; label: string }[] = [];
  if (contentRef.current && view === "doc") {
    const secEl = document.getElementById(`sec-${activeSec}`);
    if (secEl) {
      let next = secEl.nextElementSibling;
      while (next && next.tagName !== "H2") {
        if (next.tagName === "H3") {
          tocItems.push({
            href: "#" + next.id,
            label: next.textContent || "",
          });
        }
        next = next.nextElementSibling;
      }
    }
  }

  if (authLoading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="dt-root" data-dt-dark={String(dark)} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <svg style={{ animation: "spin .8s linear infinite" }} viewBox="0 0 24 24" fill="none" stroke="var(--dt-accent)" strokeWidth={2.5} width={28} height={28}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
          </svg>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      {showLogin && (
        <LoginModal
          onSuccess={() => {
            setShowLogin(false);
            if (pendingSection) {
              navigateToSection(pendingSection);
              setPendingSection(null);
            }
          }}
        />
      )}
      <div className="dt-root" data-dt-dark={String(dark)}>
        {/* Topbar */}
        <header className="dt-topbar">
          <button
            className="dt-brand"
            onClick={() => navigate("/")}
          >
            <span className="dt-brand-mark">A</span>
            Arphia
            <span className="dt-brand-sub">/ DamaTools</span>
          </button>
          <div className="dt-topbar-actions">
            {view === "doc" && (
              <button
                className="dt-back-btn"
                onClick={() => setView("landing")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  width={14}
                  height={14}
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Seções
              </button>
            )}
            {user ? (
              <button
                className="dt-back-btn"
                title={user.email ?? ""}
                onClick={async () => { await signOut(); setView("landing"); }}
                style={{ gap: 6 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} width={14} height={14}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sair
              </button>
            ) : (
              <button
                className="dt-back-btn"
                onClick={() => setShowLogin(true)}
              >
                Entrar
              </button>
            )}
            <button
              className="dt-icon-btn"
              onClick={() => setDark((d) => !d)}
              aria-label="Alternar tema"
            >
              {dark ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  width={18}
                  height={18}
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  width={18}
                  height={18}
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Landing */}
        {view === "landing" && (
          <OrbitalHero onSectionClick={goToSection} sectionsData={cardData} />
        )}

        {/* Doc view */}
        {view === "doc" && (
          <div className="dt-doc">
            {/* Sidebar */}
            <aside className="dt-sidebar">
              <div className="dt-sidebar-label">Seções</div>
              <ul className="dt-sidebar-nav">
                {sections
                  .filter((s) => s.num)
                  .map((s) => (
                    <li key={s.num}>
                      <a
                        href="#"
                        className={
                          activeSec === s.num ? "active" : ""
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          goToSection(s.num!);
                        }}
                      >
                        <span className="dt-sidebar-num">
                          {s.num}
                        </span>
                        <span>{s.title}</span>
                      </a>
                    </li>
                  ))}
              </ul>
            </aside>

            {/* Main */}
            <main className="dt-main">
              <div className="dt-content" ref={contentRef}>
                {renderedChunks.map((chunk, i) => {
                  if (chunk === "TIERS_DIAGRAM_PLACEHOLDER")    return <DiagramTiers    key={i} />;
                  if (chunk === "ARCH_DIAGRAM_PLACEHOLDER")     return <ArchDiagram     key={i} />;
                  if (chunk === "GITFLOW_DIAGRAM_PLACEHOLDER")  return <DiagramGitflow  key={i} />;
                  if (chunk === "CICD_DIAGRAM_PLACEHOLDER")     return <DiagramCICD     key={i} />;
                  if (chunk === "SCRUMBAN_DIAGRAM_PLACEHOLDER") return <DiagramScrumban key={i} />;
                  if (chunk === "SECURITY_DIAGRAM_PLACEHOLDER")    return <DiagramSecurity    key={i} />;
                  if (chunk === "MONITORING_DIAGRAM_PLACEHOLDER") return <DiagramMonitoring key={i} />;
                  if (chunk === "DEVFORMATION_DIAGRAM_PLACEHOLDER") return <DiagramDevFormation key={i} />;
                  if (chunk === "ROADMAP_DIAGRAM_PLACEHOLDER")      return <DiagramRoadmap      key={i} />;
                  if (chunk === "RBAC_DIAGRAM_PLACEHOLDER")        return <DiagramRBAC          key={i} />;
                  return chunk.trim()
                    ? <div key={i} className="dt-md" dangerouslySetInnerHTML={{ __html: chunk }} />
                    : null;
                })}

                <footer className="dt-footer">
                  <span>
                    Arphia / DamaTools — Documento de referência
                    interna
                  </span>
                  <span>v1.2 · Junho de 2026</span>
                </footer>
              </div>
            </main>

            {/* TOC */}
            <aside className="dt-toc">
              <div className="dt-toc-label">Nesta seção</div>
              <ul className="dt-toc-list">
                {tocItems.length === 0 ? (
                  <li
                    style={{
                      fontSize: 12,
                      color: "var(--dt-text-subtle)",
                      fontStyle: "italic",
                    }}
                  >
                    —
                  </li>
                ) : (
                  tocItems.map((t) => (
                    <li key={t.href}>
                      <a
                        href={t.href}
                        className={
                          activeToc === t.href ? "active" : ""
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          document
                            .querySelector(t.href)
                            ?.scrollIntoView({
                              behavior: "smooth",
                            });
                        }}
                      >
                        {t.label}
                      </a>
                    </li>
                  ))
                )}
              </ul>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Diagram injector — appends diagrams after relevant sections ──────────────
function _DiagramInjector({
  contentRef,
}: {
  contentRef: React.RefObject<HTMLDivElement>;
}) {
  const [positions, setPositions] = useState<
    { id: string; top: number }[]
  >([]);

  useEffect(() => {
    if (!contentRef.current) return;
    const pos: { id: string; top: number }[] = [];
    // Find section headings to anchor diagrams
    const h2s = contentRef.current.querySelectorAll("h2[id]");
    h2s.forEach((h) => {
      const id = h.id.replace("sec-", "");
      if (["4", "9", "10", "11", "14"].includes(id)) {
        // Find first p after h2
        let next = h.nextElementSibling;
        while (next && next.tagName !== "H2") {
          if (
            next.tagName === "P" ||
            next.tagName === "TABLE"
          ) {
            pos.push({
              id,
              top:
                (next as HTMLElement).offsetTop +
                (next as HTMLElement).offsetHeight,
            });
            break;
          }
          next = next.nextElementSibling;
        }
      }
    });
    setPositions(pos);
  }, [contentRef]);

  void positions;
  return null;
}