import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { marked } from "marked";
import { useAuth } from "../../shared/contexts/AuthContext";
import LoginModal from "../../shared/components/auth/LoginModal";

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

const SECTIONS_DATA = [
  {
    num: "1",
    title: "Contexto e visão geral",
    icon: "briefcase",
    desc: "Sobre a Arphia, o DamaTools, roadmap modular e princípios norteadores",
  },
  {
    num: "2",
    title: "Equipe e responsabilidades",
    icon: "users",
    desc: "Papéis do sócio, tech lead e desenvolvedor, com matriz RACI completa",
  },
  {
    num: "3",
    title: "Plano de formação do desenvolvedor",
    icon: "graduation",
    desc: "Fases de integração, critérios de progressão e indicadores de maturidade",
  },
  {
    num: "4",
    title: "Sistema de Tiers de tarefas",
    icon: "layers",
    desc: "Classificação por risco: Tier 1 (crítico), Tier 2 (padrão) e Tier 3 (baixo risco)",
  },
  {
    num: "5",
    title: "Stack tecnológica",
    icon: "code",
    desc: "TypeScript, Next.js, PostgreSQL, Prisma, Tailwind e justificativas",
  },
  {
    num: "6",
    title: "Arquitetura modular",
    icon: "grid",
    desc: "Monolito modular: código, banco, comunicação entre módulos e infraestrutura",
  },
  {
    num: "7",
    title: "Plataformas e custos",
    icon: "wallet",
    desc: "GitHub Team, Slack, Cursor, Claude Pro e consolidado mensal",
  },
  {
    num: "8",
    title: "Ambientes",
    icon: "server",
    desc: "Local, staging e produção: URLs, bancos e separação de dados",
  },
  {
    num: "9",
    title: "Git flow e versionamento",
    icon: "git",
    desc: "Branches, Conventional Commits, templates de PR e branch protection",
  },
  {
    num: "10",
    title: "CI/CD",
    icon: "rocket",
    desc: "Pipelines de integração contínua e deploy automatizado via GitHub Actions",
  },
  {
    num: "11",
    title: "Processo de trabalho",
    icon: "chart",
    desc: "Scrumban adaptado: ciclo semanal, board, WIP limits e cerimônias",
  },
  {
    num: "12",
    title: "Comunicação",
    icon: "chat",
    desc: "Canais no Slack, integrações automáticas e regras de uso",
  },
  {
    num: "13",
    title: "Uso da Inteligência Artificial",
    icon: "ai",
    desc: "CLAUDE.md, Cursor, guardrails e ferramentas por papel",
  },
  {
    num: "14",
    title: "Spec Driven Development (SDD)",
    icon: "check",
    desc: "Especificação técnica antes do código: ciclo, templates de prompt e versionamento",
  },
  {
    num: "15",
    title: "Segurança da aplicação",
    icon: "shield",
    desc: "LGPD, autenticação, OWASP Top 10, auditoria e resposta a incidentes",
  },
  {
    num: "16",
    title: "Code Review e qualidade",
    icon: "layers",
    desc: "Checklists por Tier, testes obrigatórios e monitoramento em produção",
  },
  {
    num: "17",
    title: "Monitoramento e observabilidade",
    icon: "monitor",
    desc: "Sentry, UptimeRobot, logs estruturados, alertas e resposta a incidentes",
  },
  {
    num: "18",
    title: "Roadmap de implantação",
    icon: "calendar",
    desc: "Meses 1 a 7+: cronograma realista por papel e marcos de validação",
  },
  {
    num: "19",
    title: "Indicadores de saúde do processo",
    icon: "bar",
    desc: "Métricas de qualidade, velocidade e saúde da equipe",
  },
  {
    num: "20",
    title: "Gestão de dependências",
    icon: "code",
    desc: "Categorias, versionamento semver, Dependabot, npm audit e Prisma",
  },
  {
    num: "21",
    title: "Apêndices",
    icon: "file",
    desc: "Templates, checklists e referências complementares",
  },
];

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
}: {
  onSectionClick: (num: string) => void;
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
          Referência interna · v1.2 · 19 seções
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
            <div className="dt-orbit-logo">A</div>
            <div className="dt-orbit-name">DamaTools</div>
            <div className="dt-orbit-by">by Arphia</div>
          </div>

          {/* Orbiting nodes — all 18 sections */}
          {nodes.map(({ num, r, dur, rev, cx, cy }) => {
            const animName = rev ? "spin-rev" : "spin";
            const counterAnim = rev ? "spin" : "spin-rev";
            const sec = SECTIONS_DATA[num - 1];
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
          {SECTIONS_DATA.map((sec) => (
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

// ─── Markdown content (modified) ──────────────────────────────────────────────
function buildMarkdown(): string {
  return `# Processo de Desenvolvimento — Arphia / DamaTools

**Documento de referência interna**
Versão 1.2 · Junho de 2026

> **Arphia** é a empresa de tecnologia.
> **DamaTools** é a plataforma de software modular desenvolvida pela Arphia.

---

## Sumário

1. Contexto e visão geral
2. Equipe e responsabilidades
3. Plano de formação do desenvolvedor
4. Sistema de Tiers de tarefas
5. Stack tecnológica
6. Arquitetura modular
7. Plataformas e custos
8. Ambientes
9. Git flow e versionamento
10. CI/CD
11. Processo de trabalho (Scrumban adaptado)
12. Comunicação
13. Uso da Inteligência Artificial
14. Spec Driven Development (SDD)
15. Segurança da aplicação
16. Code Review e qualidade
17. Monitoramento e observabilidade
18. Roadmap de implantação
19. Indicadores de saúde do processo
20. Gestão de dependências
21. Apêndices

---

## 1. Contexto e visão geral

### 1.1 Sobre a Arphia

A Arphia é uma empresa de tecnologia voltada a instituições reguladas pelo Banco Central do Brasil. Atende um nicho onde decisões dependem de interpretação regulatória correta, cálculos precisos e disciplina operacional — contexto em que erros geram exposição regulatória e perda de confiança do cliente.

### 1.2 O produto — DamaTools

DamaTools é a plataforma de software desenvolvida pela Arphia. É um produto modular: cada módulo resolve uma necessidade operacional específica de instituições reguladas, e novos módulos são incorporados ao longo do tempo conforme o roadmap.

**Módulos em desenvolvimento atualmente:**

| Módulo | Função |
|---|---|
| AMCC | Geração e gestão dos mapas de composição de capital MCC |
| Calculadora | Conversão de taxas, simulação de IOF, simulação de parcelas (pré + pós) |

### 1.3 Roadmap modular do DamaTools

O roadmap do produto está estruturado em três fases plurianuais. Esta visão de longo prazo é a base do planejamento estratégico da Arphia e fundamenta o desenho do processo descrito neste documento.

**Fase 1 — entregas em 2027**

| Módulo | Descrição |
|---|---|
| Calculadora | Conversão de taxas, simulação IOF, simulação de parcelas (pré + pós) |
| RAS | Gestão dos indicadores da RAS |
| Calendário | Motor de eventos com calendários pré-cadastrados e personalizados |
| FGC | Cálculos relacionados ao FGC (contribuições e limites operacionais) |

**Fase 2 — entregas em 2028**

| Módulo | Descrição |
|---|---|
| Rentabilidade de Produtos | Projeções de DRE por contrato/produto para avaliação de viabilidade |
| Ferramenta de Classificação | Classificação de risco de crédito, PLD, etc. |

**Fase 3 — entregas em 2029**

| Módulo | Descrição |
|---|---|
| Fluxo de Caixa | Fluxo de caixa realizado e projetado (com testes de estresse) |
| Orçamento | Orçamento realizado e projetado para gestão de capital |

### 1.4 A equipe

A equipe é composta por três pessoas, cada uma com papel claramente distinto:

| Pessoa | Função | Capacidade técnica |
|---|---|---|
| Sócio de negócio | Product Owner | Não-técnico |
| Tech Lead | Arquitetura, domínio, código crítico | Sênior/Pleno |
| Desenvolvedor | Implementação | Em formação |

### 1.5 Princípios norteadores

Quatro princípios sustentam todas as decisões de processo descritas neste documento:

**Domínio acima de velocidade.** Errar uma fórmula de amortização ou interpretar mal uma resolução do CMN tem custo muito maior do que entregar uma feature uma semana depois. Toda decisão de processo prioriza correção sobre velocidade.

**O tech lead é recurso escasso a ser protegido.** Existe um único revisor sênior. Sem mecanismos explícitos de proteção desse tempo, ele rapidamente vira gargalo de tudo. O sistema de Tiers, a IA como filtro inicial e a revisão automatizada existem para isso.

**Qualidade de entrega sobre velocidade de produção.** O processo é estruturado para garantir que o código produzido esteja correto, testado e revisado antes de ir a produção — independentemente do nível de senioridade de quem o escreveu.

**A IA é ferramenta, não substituto.** A IA acelera escrita de código e funciona como assistente. Não substitui entendimento, não substitui revisão humana em código crítico e não substitui aprendizado real.

---

## 2. Equipe e responsabilidades

### 2.1 Sócio de negócio — Product Owner

**O que faz:**
- Define prioridades do produto e roadmap
- Valida se o que foi construído atende à necessidade de negócio
- Participa da Sprint Review (demonstração do que foi entregue)
- Atua como ponte entre regulação/cliente e a equipe técnica

**O que não faz:**
- Não escreve código
- Não revisa código tecnicamente

### 2.2 Tech Lead

**O que faz:**
- Define arquitetura, stack e padrões técnicos
- Escreve todo código classificado como Tier 1 (crítico de domínio)
- Revisa 100% dos Pull Requests que tocam código de produção
- Codifica conhecimento de domínio no arquivo \`CLAUDE.md\` do projeto
- Conduz pair programming semanal e revisões pedagógicas
- Decide quando o desenvolvedor está pronto para subir de Tier
- Configura CI/CD, ambientes, branch protection

**O que precisa proteger:**
- Tempo de revisão (orçamento mental diário: ~1h dedicada a PRs)
- Tempo de código profundo (Tier 1) — blocos de 2-3 horas sem interrupção
- Capacidade de estudar regulação e domínio do produto

### 2.3 Desenvolvedor

**O que faz (evolução em fases — ver seção 3):**
- **Fase 0 (semanas 1-8):** estudo de fundamentos, tarefas guiadas
- **Fase 1 (semanas 9-16):** Tier 3 com alta supervisão
- **Fase 2 (semanas 17-24):** Tier 3 com autonomia + primeiros Tier 2
- **Fase 3 (a partir do 6º mês):** Tier 2 com autonomia, Tier 1 em pair programming

**O que não faz, em nenhuma fase:**
- Merge direto em \`main\` ou \`develop\` (sempre via PR)
- Push em branch protegida
- Alterações em código Tier 1 de forma independente
- Decisões de arquitetura
- Uso acrítico de código gerado por IA

### 2.4 Matriz RACI simplificada

| Atividade | Sócio (PO) | Tech Lead | Dev |
|---|---|---|---|
| Priorização do backlog | R | C | I |
| Decisão de stack/arquitetura | I | R | I |
| Escrita de código Tier 1 | I | R | C |
| Escrita de código Tier 2 | I | A | R |
| Escrita de código Tier 3 | — | A | R |
| Code review de PRs | — | R | C |
| Configuração de ambientes/CI | I | R | C |
| Sprint Review (demo) | A | R | C |

---

## 3. Plano de formação do desenvolvedor

DEVFORMATION_DIAGRAM_PLACEHOLDER

O processo de integração do desenvolvedor é estruturado em fases progressivas. O objetivo é garantir que contribuições ao codebase aumentem gradualmente em escopo e criticidade, em paralelo com a evolução da compreensão técnica e de domínio.

### 3.1 Fases de integração

| Fase | Período | Escopo de atuação |
|---|---|---|
| Fase 0 — Fundamentos | Semanas 1–8 | Estudo, ambiente, leitura de código, tarefas guiadas sem entrega |
| Fase 1 — Primeiro código | Semanas 9–16 | Exclusivamente Tier 3, alta supervisão |
| Fase 2 — Autonomia gradual | Semanas 17–24 | Tier 3 com autonomia, início de Tier 2 com supervisão |
| Fase 3 — Maturação | A partir do 6º mês | Tier 2 com autonomia, Tier 1 somente em pair programming |

**Fase 0** não contempla entrega de produto. A tentativa de extrair produtividade nessa fase é o erro mais recorrente e mais custoso no processo de integração.

### 3.2 Critérios de progressão

A transição entre fases é decidida pelo _tech lead_ com base em evidências objetivas:

- **Fase 0 → 1:** leitura autônoma do código; commits e PRs corretos; uso de Git/IDE sem ajuda
- **Fase 1 → 2:** PRs de Tier 3 com consistência; tempo de revisão decrescente; compreensão de conceitos básicos do domínio
- **Fase 2 → 3:** Tier 2 entregue sem retrabalho significativo; pair programming produtivo; capacidade de navegar o codebase de forma independente

### 3.3 Indicadores de maturidade

Quatro sinais a observar ao longo do processo:

1. **Tempo médio de PR** — diminuindo (PRs mais focados e bem escopo)
2. **Idas e voltas em revisão** — diminuindo (código melhora antes de submeter)
3. **Perguntas antecipadas** — aumentando (questiona antes de assumir)
4. **Leitura do codebase** — aumentando (navega sem ajuda)

Esses indicadores são discutidos na retrospectiva quinzenal.

### 3.4 Sinais de alerta

Sinais de que algo está errado na formação:

- Dev copia e cola código de IA sem conseguir explicar o que faz
- PRs ficam estagnados por dias sem resposta às dúvidas
- Mesmo tipo de erro aparece repetidamente
- Dev evita perguntar (medo de demonstrar não saber)
- Bugs em produção em código que ele escreveu

Qualquer um desses sinais demanda intervenção rápida — geralmente recuar uma fase e reforçar fundamentos.

---

## 4. Sistema de Tiers de tarefas

O sistema de Tiers é o mecanismo central de gestão de risco do processo. Toda tarefa é classificada antes de ser atribuída, determinando quem pode executá-la e qual nível de revisão é exigido.

TIERS_DIAGRAM_PLACEHOLDER

### 4.1 Definição dos Tiers

**Tier 1 — Crítico**

Código com impacto direto sobre a correção de domínio ou a segurança da plataforma. Erros nessa categoria têm consequências regulatórias ou de integridade de dados.

Critérios de classificação:
- Toca lógica de domínio crítico (cálculos regulatórios, validações de compliance)
- Acessa diretamente dados sensíveis de múltiplos clientes
- Altera schema do banco (migrations)
- Mexe em autenticação, autorização ou sessão
- Modifica integração com sistema regulatório externo

Responsável: **Tech Lead exclusivamente**.

**Tier 2 — Padrão**

Código de produto que consome lógica já validada. Requer entendimento de negócio mas não toca domínio crítico diretamente.

Critérios de classificação:
- Telas que consomem cálculos já implementados e testados
- CRUDs com regras de negócio não críticas
- Integrações com APIs já especificadas
- Relatórios baseados em dados já estruturados
- Queries de leitura com joins complexos

Responsável: **Desenvolvedor, aprovação do Tech Lead**.

**Tier 3 — Baixo risco**

Código com impacto limitado e reversível. Pode ser feito com autonomia pelo desenvolvedor após a Fase 1.

Critérios de classificação:
- Ajustes de CSS e estilo visual
- Componentes de UI sem lógica de negócio
- Documentação de código existente
- Correção de bugs visuais
- Refatoração de nomenclatura

Responsável: **Desenvolvedor com autonomia, revisão do Tech Lead**.

### 4.2 Processo de classificação

A classificação ocorre durante o refinamento da tarefa, antes de entrar no sprint. Em caso de dúvida sobre o Tier, a tarefa é classificada no nível mais alto (mais restritivo).

Nenhuma tarefa entra em desenvolvimento sem Tier definido.

---

## 5. Stack tecnológica

### 5.1 Decisões principais

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Linguagem | TypeScript | Type safety obrigatório em domínio crítico |
| Framework | Next.js 14 (App Router) | Full-stack, SSR, maturidade do ecossistema |
| Banco de dados | PostgreSQL | Confiabilidade, suporte a múltiplos schemas |
| ORM | Prisma | Type safety no acesso a dados, migrations gerenciadas |
| Estilo | Tailwind CSS | Padronização, sem CSS global descontrolado |
| Validação | Zod | Runtime validation + inferência de tipos |
| Testes | Vitest + Playwright | Unitários e E2E |

### 5.2 Bibliotecas de domínio

| Biblioteca | Uso |
|---|---|
| \`decimal.js\` | Aritmética de precisão em cálculos de taxas e simulações |
| \`date-fns\` | Manipulação de datas (sem mutação, compatível com TS) |
| \`zod\` | Validação de entradas em APIs e formulários |

### 5.3 Justificativa das escolhas

TypeScript é não-negociável: em domínio onde um tipo errado pode gerar um cálculo errado, o compilador é a primeira linha de defesa. PostgreSQL foi escolhido por sua capacidade de múltiplos schemas — mecanismo usado para isolar dados de módulos distintos no mesmo banco. Prisma garante que o acesso ao banco passe sempre por tipagem estática.

Next.js concentra frontend e backend no mesmo repositório e deploy, reduzindo a complexidade operacional para uma equipe pequena.

---

## 6. Arquitetura modular

### 6.1 Princípio: monolito modular, não microsserviços

A natureza modular do DamaTools levanta naturalmente a pergunta: cada módulo deveria ser um serviço independente? A resposta, para o estágio atual da Arphia, é **não**.

A arquitetura escolhida é a de **monolito modular**: uma única aplicação, um único deploy, um único banco de dados — mas internamente estruturada como se fossem múltiplos módulos isolados. Cada módulo tem seu próprio código, seu próprio schema no banco, suas próprias regras, e o acoplamento entre eles é explícito e controlado.

**Por que não microsserviços agora:**

| Critério | Realidade da Arphia | Implicação |
|---|---|---|
| Orçamento de infraestrutura | Limitado (~R$ 200/mês para infra) | Múltiplos serviços = múltiplas VMs = custo multiplicado |
| Tamanho da equipe | 1 tech lead + 1 dev | Microsserviços demandam DevOps maduro |
| Complexidade operacional | Equipe pequena sem experiência em sistemas distribuídos | Falhas de rede, eventual consistency, distributed tracing são overhead elevado |
| Estágio do produto | Primeiros módulos sendo construídos | Domínios ainda não completamente estáveis |

Microsserviços resolvem problemas que a equipe não enfrenta: escala massiva, times grandes que precisam evoluir independentemente, sistemas com requisitos de disponibilidade extremos. Para o estágio atual, introduziriam complexidade sem benefício real.

**Por que monolito modular e não monolito tradicional:**

O monolito tradicional (sem fronteiras internas) tende ao "big ball of mud" — código que ninguém entende, onde mudar uma coisa quebra outra inesperadamente. O monolito modular evita isso impondo disciplina interna: módulos são tratados como se fossem serviços separados em termos de organização e isolamento, mesmo rodando no mesmo processo.

O benefício colateral mais importante: se um dia for necessário separar um módulo em serviço próprio, a migração é factível porque as fronteiras já existem.

### 6.2 Visão geral da arquitetura

ARCH_DIAGRAM_PLACEHOLDER

Componentes principais:
- **Nginx**: terminação SSL, reverse proxy, rate limiting, basic auth para staging
- **Aplicação Next.js**: monolito com módulos isolados, gerenciada pelo PM2 para restart automático
- **PostgreSQL**: banco único com múltiplos schemas, um por módulo
- **DigitalOcean Spaces**: armazenamento de objetos (backups, arquivos de upload do cliente)

### 6.3 Organização do código

A estrutura de pastas é o primeiro mecanismo de isolamento. Cada módulo vive em sua própria pasta sob \`/src/modules/\`:

\`\`\`
arphia-damatools/
├── src/
│   ├── app/                          # Rotas Next.js (App Router)
│   │   └── (modules)/
│   │       ├── calculator/
│   │       ├── amcc/
│   │       └── ras/
│   ├── modules/
│   │   ├── calculator/
│   │   │   ├── domain/               # Cálculos de domínio
│   │   │   ├── repositories/         # Acesso ao banco
│   │   │   ├── services/             # Lógica de aplicação
│   │   │   ├── ui/                   # Componentes do módulo
│   │   │   └── index.ts              # Interface pública
│   │   ├── amcc/
│   │   └── ras/
│   └── shared/
│       ├── auth/
│       ├── db/
│       ├── ui/
│       └── utils/
├── tests/
└── migrations/
    ├── shared/
    ├── calculator/
    └── amcc/
\`\`\`

**Regras de import (enforçadas via ESLint):**

1. **Módulos não importam de outros módulos.** Dependências entre módulos devem passar por \`/shared\`.
2. **Módulos podem importar de \`/shared\`.** Tudo em \`/shared\` é código transversal estável.
3. **Exports externos somente via \`index.ts\`.** A interface pública de cada módulo é declarada explicitamente.
4. **\`/shared\` não importa de módulos.** A direção de dependência é unidirecional.

### 6.4 Organização do banco de dados

**Duas instâncias PostgreSQL distintas:**

| Ambiente | Conteúdo | Acesso |
|---|---|---|
| Produção | Dados reais de clientes | Apenas aplicação em produção |
| Staging/Dev | Dados sintéticos | Dev + CI/CD |

**Schemas por módulo:**

\`\`\`sql
-- Schema compartilhado (auth, usuários, tenants)
CREATE SCHEMA shared;

-- Schema por módulo
CREATE SCHEMA calculator;
CREATE SCHEMA amcc;
CREATE SCHEMA ras;
\`\`\`

Cada módulo só acessa seu próprio schema. Queries cross-schema são proibidas e detectadas por lint.

### 6.5 Comunicação entre módulos

A regra padrão é: **módulos não se comunicam**. Cada módulo processa suas próprias requisições, lê e escreve no próprio schema e renderiza suas próprias telas.

Quando a regra precisa ser quebrada, há três padrões aceitos, em ordem de preferência:

**Padrão 1: o dado está em \`shared\`**

Se o dado é genuinamente transversal (usuário, organização, log de auditoria), ele vive em \`/shared\` e ambos os módulos leem dali.

**Padrão 2: serviço de aplicação na camada compartilhada**

Quando há uma operação que envolve múltiplos módulos (ex: relatório consolidado), o código que orquestra essa operação vive em \`/src/services/\` ou em uma route handler, não dentro de um módulo específico.

**Padrão 3: eventos de domínio (in-process)**

Quando uma ação em um módulo deve gerar efeitos em outro de forma desacoplada:

\`\`\`typescript
// Módulo Calculator emite evento
events.emit('simulation.created', { userId, simulationId });

// /shared/audit escuta
events.on('simulation.created', async (payload) => {
  await auditLogger.record(payload);
});
\`\`\`

Esse padrão tem vantagem estratégica: se o módulo for separado em microsserviço no futuro, o mesmo padrão vira mensageria (RabbitMQ, Kafka) com mudança mínima de código.

### 6.6 Autenticação e autorização

Centralizadas em \`/shared/auth\`. Cada módulo não implementa seu próprio login.

**Modelo de dados:**

\`\`\`
shared.users
  id, email, hashed_password, name, created_at

shared.organizations
  id, name, cnpj, plan

shared.user_organizations
  user_id, organization_id, role
    role ∈ {owner, admin, member}

shared.module_permissions
  organization_id, module, enabled
    module ∈ {calculator, amcc, ras, calendar, fgc, ...}
\`\`\`

Esse modelo suporta:
- Multi-tenancy (uma instituição financeira = uma organization)
- Múltiplos usuários por organização com papéis distintos
- Controle granular de qual organização tem acesso a qual módulo

**Middleware de autorização:**

Toda rota protegida passa por um middleware compartilhado que:
1. Valida a sessão do usuário
2. Identifica a organização ativa
3. Verifica se aquela organização tem permissão no módulo daquela rota
4. Verifica se o usuário tem o papel necessário para a ação

### 6.7 Configuração e feature flags

Variáveis de ambiente seguem convenção de prefixo por módulo:

\`\`\`bash
# Compartilhadas
DATABASE_URL=postgres://...
SESSION_SECRET=...
APP_URL=https://damatools.com.br

# Módulo Calculator
CALCULATOR_ENABLED=true
CALCULATOR_MAX_INSTALLMENTS=600

# Módulo AMCC
AMCC_ENABLED=true
AMCC_BCB_API_URL=https://...

# Módulo RAS (ainda não implementado)
RAS_ENABLED=false
\`\`\`

A flag \`{MODULE}_ENABLED\` é o **feature flag de módulo**: permite desabilitar um módulo inteiro sem precisar removê-lo do código. Útil para lançar módulos progressivamente, desabilitar em produção em caso de bug crítico, ou manter código em desenvolvimento ativo no repositório.

### 6.8 Testes em arquitetura modular

\`\`\`
/tests
  /modules
    /calculator
      /domain        # testes unitários de cálculos (críticos)
      /services
      /integration   # testes que tocam o schema 'calculator' do banco
    /amcc
  /shared            # testes de auth, decimal helpers, validators
  /e2e               # testes end-to-end (poucos, mas existem)
\`\`\`

| Tipo | Cobertura ideal | Quando rodam |
|---|---|---|
| Unitário (domain/) | > 90% no Tier 1 | A cada save (watch mode) |
| Integração (acesso a banco) | Fluxos principais | A cada PR (CI) |
| End-to-end | Cenários críticos | Diariamente + antes de release |

### 6.9 Quando reconsiderar a arquitetura

| Sinal | O que pode ser separado |
|---|---|
| Um módulo consome desproporcionalmente mais CPU/RAM | Aquele módulo vira serviço próprio |
| Um módulo precisa de SLA diferente (alta disponibilidade) | Idem |
| Equipe cresce e times se dedicam a módulos diferentes | Separação ajuda autonomia |
| Volume de dados de um módulo justifica banco próprio | Banco daquele módulo migra primeiro |

O ponto importante: com o monolito modular bem construído, essa migração é cirúrgica. As fronteiras já existem no código, o schema já está separado, a comunicação entre módulos já passa por eventos. Migrar um módulo para serviço próprio passa a ser principalmente um exercício de infraestrutura, não uma reescrita arquitetural.

---

## 7. Plataformas e custos

### 7.1 Stack de ferramentas

| Ferramenta | Plano | Custo mensal | Uso |
|---|---|---|---|
| GitHub | Team | ~R$ 50 | Repositório, Actions, branch protection |
| DigitalOcean | Droplet básico | ~R$ 80–120 | Hospedagem da aplicação |
| DigitalOcean Spaces | S3-compatible | ~R$ 15 | Armazenamento de arquivos |
| Slack | Free/Pro | ~R$ 0-70 | Comunicação da equipe |
| Cursor | Pro | ~R$ 100/dev | IDE com IA integrada |
| Claude Pro | Individual | ~R$ 100/dev | Assistência de código e domínio |

**Custo mensal estimado: ~R$ 450–550**

### 7.2 Critério de adoção de ferramenta

Toda nova ferramenta deve responder:
1. Resolve um problema real que a equipe enfrenta hoje?
2. O custo é proporcional ao problema que resolve?
3. Existe alternativa gratuita suficientemente boa?

Ferramentas de IA são priorizadas por seu impacto direto na qualidade e velocidade de revisão.

---

## 8. Ambientes

### 8.1 Três ambientes

| Ambiente | Branch | URL | Banco | Propósito |
|---|---|---|---|---|
| Local | feature/* | localhost:3000 | DB local (Docker) | Desenvolvimento |
| Staging | develop | staging.damatools.com | DB de staging | QA e validação |
| Produção | main | app.damatools.com | DB de produção | Clientes reais |

### 8.2 Regras de ambiente

- **Nunca usar dados de produção em desenvolvimento ou staging.** Os bancos são fisicamente separados.
- **Staging deve ser idêntico a produção em configuração** (mesma versão do Node, mesma versão do PostgreSQL).
- **Variáveis de ambiente** são gerenciadas por arquivo \`.env\` local (não versionado) e por secrets do GitHub Actions para CI/CD.
- **Acesso ao banco de produção** requer VPN ou autenticação de dois fatores via psql direto — nunca exposição pública.

### 8.3 Banco de dados por ambiente

| Ambiente | Banco PostgreSQL | Conteúdo | Backup |
|---|---|---|---|
| Local (cada dev) | Container Docker local | Dados fictícios, descartáveis | Não há |
| Staging | \`arphia-db-dev\` (DO) | Dados de teste e homologação | Diário, retenção 7 dias |
| Produção | \`arphia-db-prod\` (DO) | Dados reais de clientes | Diário, retenção 30 dias + snapshots semanais |

**Princípio inegociável:** credenciais de \`arphia-db-prod\` nunca aparecem em ambiente de desenvolvimento, nunca são compartilhadas em chat ou e-mail, e o acesso direto ao banco de produção é feito apenas pelo tech lead, em momentos pontuais e auditados.

### 8.4 DNS

| Tipo | Nome | Destino |
|---|---|---|
| A | @ (raiz) | IP do servidor |
| A | www | IP do servidor |
| A | staging | IP do servidor |

Ambos os subdomínios apontam para o mesmo servidor; o nginx diferencia por domínio.

---

## 9. Git flow e versionamento

### 9.1 Estrutura de branches

| Branch | Proteção | Origem | Destino |
|---|---|---|---|
| \`main\` | Sim (PR + 1 aprovação + CI verde) | \`develop\`, \`hotfix/*\` | — |
| \`develop\` | Sim (PR obrigatório + CI verde) | \`feature/*\`, \`fix/*\`, \`refactor/*\`, \`hotfix/*\` | \`main\` |
| \`feature/*\` | Não | \`develop\` | \`develop\` |
| \`fix/*\` | Não | \`develop\` | \`develop\` |
| \`refactor/*\` | Não | \`develop\` | \`develop\` |
| \`hotfix/*\` | Não | \`main\` | \`main\` + \`develop\` |

GITFLOW_DIAGRAM_PLACEHOLDER

### 9.2 Conventional Commits

Formato obrigatório: \`<tipo>(<escopo>): <descrição>\`

| Tipo | Quando usar |
|---|---|
| \`feat\` | Nova funcionalidade |
| \`fix\` | Correção de bug |
| \`refactor\` | Refatoração sem mudança de comportamento |
| \`test\` | Adição ou modificação de testes |
| \`docs\` | Documentação |
| \`chore\` | Tarefas de manutenção (deps, config) |
| \`perf\` | Melhoria de performance |

Exemplo: \`feat(calculator): adiciona simulação de IOF regressivo\`

### 9.3 Regras de PR

- PRs devem ser atômicos: uma mudança de comportamento por PR
- Tamanho máximo recomendado: 400 linhas de código (excluindo testes e migrations)
- PRs de Tier 1 requerem 2 revisões (mesmo que a segunda seja o autor em pair programming)
- CI deve estar verde antes de solicitar revisão

---

## 10. CI/CD

CICD_DIAGRAM_PLACEHOLDER

### 10.1 Pipeline de CI (todo PR)

\`\`\`yaml
# Executado em todo PR para develop e main
jobs:
  quality:
    - Lint (ESLint + Prettier)
    - Type check (tsc --noEmit)
    - Testes unitários (Vitest)
    - Build de produção
  integration:
    - Testes de integração (banco de staging)
  e2e:
    - Playwright (ambiente de staging)
\`\`\`

### 10.2 Deploy automatizado

| Branch | Trigger | Deploy para |
|---|---|---|
| \`develop\` | Push (CI verde) | Staging |
| \`main\` | Push (CI verde + aprovação) | Produção |

Deploy de produção requer aprovação manual via GitHub Environments, mesmo com CI verde.

### 10.3 Rollback

Em caso de incidente em produção:
1. Reverter o merge para \`main\` (git revert)
2. CI roda automaticamente
3. Deploy do estado anterior ocorre em ~3 minutos
4. Investigação do problema com banco de produção em read-only

---

## 11. Processo de trabalho (Scrumban adaptado)

### 11.1 Por que Scrumban

A equipe lida com dois tipos de trabalho competindo pela mesma capacidade: desenvolvimento de produto (DamaTools) e demandas de consultoria regulatória pontuais. Scrum puro assume um único fluxo planejável; Scrumban admite os dois coexistindo com WIP limit como mecanismo de proteção.

SCRUMBAN_DIAGRAM_PLACEHOLDER

### 11.2 Cerimônias

| Cerimônia | Frequência | Duração | Participantes |
|---|---|---|---|
| Sprint Planning | Semanal (segunda) | 45 min | Tech Lead + Dev |
| Sprint Review | Quinzenal | 30 min | Todos |
| Retrospectiva | Quinzenal | 30 min | Tech Lead + Dev |
| Pair programming | Semanal | 1h | Tech Lead + Dev |

### 11.3 Board e WIP limits

O board tem cinco colunas: Backlog → Sprint → Em andamento → Review → Done.

WIP limits:
- **Em andamento:** máximo 2 itens simultâneos (1 por pessoa)
- **Review:** máximo 3 itens (evita gargalo de revisão)

Quando o limite de Review é atingido, o dev para de iniciar novas tarefas e auxilia na revisão das pendentes.

### 11.4 Estimativa e prioridade

Estimativas usam story points (1, 2, 3, 5, 8). Tarefas acima de 8 pontos são quebradas antes de entrar no sprint.

Prioridade é definida pelo sócio de negócio em colaboração com o tech lead, considerando:
1. Comprometimento com cliente
2. Risco técnico (Tier)
3. Valor de negócio

### 11.5 Como tarefas são criadas

Tarefas nascem em três caminhos:

1. **Backlog estratégico** — sócio de negócio identifica necessidade do produto e cria issue
2. **Bug ou melhoria técnica** — tech lead ou dev identificam e criam issue
3. **Demanda de cliente** — sócio de negócio recebe e cria issue com prioridade elevada

Toda issue criada precisa ter, antes de entrar no board:
- Título descritivo
- Descrição do que é e por quê
- **Tier (label)**
- Critério de aceite (como saber que está pronto)
- Estimativa de esforço (P/M/G)

---

## 12. Comunicação

### 12.1 Canais no Slack

| Canal | Propósito | Quem participa |
|---|---|---|
| \`#geral\` | Conversas, alinhamentos, decisões | Todos |
| \`#daily\` | Status assíncrono diário | Tech lead e dev |
| \`#notificacoes-dev\` | PRs abertos, reviews | Tech lead e dev |
| \`#builds-e-deploys\` | CI, deploys, falhas de pipeline | Tech lead e dev |
| \`#alertas-producao\` | Sentry, monitoramento, erros | Todos |
| \`#dev-aprendizado\` | Dúvidas do dev, links de estudo | Tech lead e dev |
| \`#negocio-cliente\` | Demandas de cliente, regulatório | Sócio de negócio e tech lead |

### 12.2 Integrações automáticas

- GitHub → Slack: notificação em PRs abertos, CI falho, deploys
- Sentry → Slack: erros em produção (canal \`#alertas-producao\`)
- Uptime Robot → Slack: downtime de staging ou produção

### 12.3 Regras de uso

**Code review acontece no GitHub, não no Slack.** Slack avisa que o PR existe, mas a revisão fica no PR para ficar registrada.

**Decisões importantes vão para documentação.** Conversas no Slack se perdem. Se uma decisão técnica for tomada via Slack, alguém precisa registrá-la em uma issue ou no \`CLAUDE.md\`.

**Urgência tem canal próprio.** Se algo é realmente urgente (produção quebrada), é no \`#alertas-producao\` + mensagem direta. Caso contrário, mensagem assíncrona.

**Respeitar foco profundo.** Tech lead em bloco de Tier 1 não responde Slack na hora.

---

## 13. Uso da Inteligência Artificial

### 13.1 Ferramentas por papel

| Ferramenta | Quem usa | Como usa |
|---|---|---|
| Cursor | Dev + Tech Lead | IDE com autocompletar e geração de código assistida |
| Claude Pro | Dev + Tech Lead | Explicações de domínio, geração de testes, code review |

### 13.2 CLAUDE.md

Cada módulo mantém um arquivo \`CLAUDE.md\` que documenta:
- Regras de domínio do módulo (ex: "taxa nominal sempre arredondada em 4 casas")
- Padrões de código específicos do módulo
- Armadilhas conhecidas e como evitá-las
- Exemplos de uso correto das funções de domínio

O \`CLAUDE.md\` é a memória do projeto para a IA. Ele é mantido pelo tech lead e atualizado sempre que uma nova regra de domínio é descoberta ou consolidada.

### 13.3 Guardrails de uso de IA

**O que a IA pode fazer:**
- Gerar boilerplate e código de infraestrutura
- Sugerir testes para código já validado
- Explicar conceitos de linguagem e framework
- Rascunhar documentação

**O que a IA não pode substituir:**
- Revisão humana de código Tier 1
- Decisões de arquitetura
- Validação de regras regulatórias
- Julgamento sobre correção de domínio

Todo código gerado por IA que vai para produção passa pela mesma pipeline de revisão do código escrito manualmente. Não há atalho de revisão para código gerado.

### 13.4 O que nunca compartilhar com IA

- Conteúdo de arquivos \`.env\`
- Credenciais, API keys, tokens
- Dados reais de clientes (CPF, CNPJ, saldos, transações)
- Documentos confidenciais de clientes (instituições financeiras)

**O que é seguro compartilhar:**
- Código de domínio sem dados reais
- Schemas de banco (estrutura, não conteúdo)
- Documentos públicos (resoluções, normativos)
- Código com dados fictícios em testes

---

## 14. Spec Driven Development (SDD)

Spec Driven Development (SDD) é a prática de produzir uma especificação técnica formal antes de qualquer linha de código ser escrita. A especificação — documento estruturado que define comportamento esperado, entradas, saídas, regras de domínio e critérios de aceite verificáveis — serve simultaneamente como instrução ao desenvolvedor, contrato com o Product Owner e referência de verificação após a implementação.

No contexto da Arphia, o SDD responde a dois riscos concretos: execução de tarefas em domínio financeiro regulado por um desenvolvedor em formação (onde especificação ambígua produz código tecnicamente compilável e financeiramente incorreto), e dependência de IA generativa para escrita de código (modelos geram código de maior qualidade quando recebem especificações precisas).

### 14.1 Conceito e objetivo

A especificação tem três funções simultâneas:

- **Instrução:** define o que o desenvolvedor deve implementar, sem margem para interpretação
- **Contrato:** registra o acordo entre PO e time técnico sobre o que será entregue
- **Verificação:** serve de referência objetiva para o code review e os testes automatizados

### 14.2 Quando aplicar o SDD

A obrigatoriedade de spec é determinada pelo Tier da tarefa (Seção 4):

| Tier | Spec obrigatória? | Profundidade mínima |
|---|---|---|
| Tier 1 | Sim, obrigatória | Spec completa: regras de domínio exaustivas, casos extremos e critérios de aceite testáveis |
| Tier 2 | Sim, obrigatória | Spec padrão: entradas, saídas, comportamento e critérios de aceite |
| Tier 3 | Recomendada | Spec simplificada ou apenas critério de aceite descrito no card do board |

A spec deve estar com status \`Aprovada\` pelo tech lead antes da criação do branch de desenvolvimento. Submeter Pull Request sem spec aprovada para tarefas Tier 1 ou Tier 2 constitui motivo de recusa imediata.

### 14.3 O ciclo SDD no processo

O SDD se insere entre o planejamento (Seção 11) e o início do desenvolvimento (Seção 9):

\`\`\`
Backlog
  ↓
Planejamento semanal (priorização pelo PO)
  ↓
[SPEC EM ANDAMENTO]  ← tech lead ou dev produz com apoio de IA
  ↓
[SPEC EM REVISÃO]    ← tech lead valida regras de domínio
  ↓
[SPEC APROVADA]
  ↓
Abertura do branch (feature/*, fix/*, etc.)
  ↓
Implementação guiada pela spec
  ↓
Verificação contra a spec (antes de abrir PR)
  ↓
Pull Request → Code Review → Deploy
\`\`\`

**Responsabilidade por Tier:**

| Tier | Quem produz a spec | Quem revisa |
|---|---|---|
| Tier 1 | Tech lead, com auxílio de IA | Tech lead (auto-revisão rigorosa) |
| Tier 2 | Dev produz rascunho com IA; tech lead revisa | Tech lead |
| Tier 3 | Dev produz spec simplificada | Tech lead (revisão leve) |

**Armazenamento:** specs são documentos Markdown versionados no repositório, em \`docs/specs/[modulo]/[nome-da-spec].md\`. O link para a spec é incluído obrigatoriamente na descrição do PR.

### 14.4 Estrutura padrão de uma especificação

Toda spec do DamaTools segue a estrutura abaixo. Campos marcados com \`*\` são obrigatórios para Tier 1 e Tier 2.

\`\`\`markdown
# SPEC: [Título descritivo da funcionalidade]

## Metadados
- **Módulo:** [nome do módulo — calculator, amcc, ras, etc.]
- **Tier:** [1 / 2 / 3]
- **Status:** [Rascunho | Em revisão | Aprovada | Implementada]
- **Autor:** [quem redigiu]
- **Revisor:** [tech lead]
- **Data:** [yyyy-mm-dd]
- **Issue:** [link para o card no GitHub Projects]

## Objetivo *
[Uma frase: o sistema deve [ação] para que [usuário] possa [objetivo de negócio]]

## Contexto *
[Por que esta funcionalidade existe. Qual problema resolve para a IF.
Referências normativas quando aplicável.]

## Escopo *
### Inclui
- [Comportamentos cobertos por esta spec]

### Exclui (fora de escopo)
- [O que explicitamente não faz parte desta entrega]

## Regras de domínio *
[Seção crítica para Tier 1. Cada regra financeira ou regulatória
listada com fórmula, exceções e casos extremos quando aplicável.]

## Entradas *
| Campo | Tipo | Obrigatório | Validação | Exemplo |

## Saídas *
| Campo | Tipo | Formato | Exemplo |

## Comportamento esperado *
[Cenários no formato: "Dado X, quando Y, então Z"]

## Casos extremos *
[Limites e situações degeneradas que precisam de tratamento explícito]

## Critérios de aceite *
- [ ] [Condição testável verificável por teste automatizado]

## Dependências
[Módulos, APIs externas, tabelas do banco envolvidas]

## Considerações de segurança
[Validações de entrada, dados sensíveis, regras de autorização]

## Notas de implementação
[Orientações técnicas específicas — sem prescrever a solução]
\`\`\`

### 14.5 Templates de prompt padronizados

O processo SDD usa 5 prompts oficiais. Devem ser copiados integralmente e preenchidos nos campos indicados antes de cada execução.

**Prompt 1 — Discovery**

Quando usar: ao receber um requisito ainda informal do PO, antes de redigir a spec. Objetivo: estruturar o requisito bruto, identificar ambiguidades e mapear regras de domínio implícitas.

Retorna: reformulação objetiva, ambiguidades identificadas, regras de domínio implícitas, escopo sugerido e perguntas para o PO (máximo 5, em ordem de prioridade).

---

**Prompt 2 — Geração de spec Tier 1**

Quando usar: após ambiguidades do Prompt 1 resolvidas, para tarefas que envolvem cálculos financeiros, regras regulatórias ou geração de arquivos para o BCB. Gera spec completa seguindo o template padrão DamaTools, com ênfase em: regras de domínio exaustivas com fórmulas, cenários Gherkin (Dado/Quando/Então), critérios de aceite com ao menos um caso numérico concreto calculado manualmente.

---

**Prompt 3 — Geração de spec Tier 2**

Quando usar: para tarefas de lógica de negócio padrão — telas, formulários, integrações de API, fluxos de navegação. Ênfase em: entradas e validações, comportamento de UI (estados vazios/loading/erro/sucesso), regras de autorização por role e operações no banco.

Onde houver dúvida sobre uma regra de negócio, sinaliza com: \`> ⚠️ VERIFICAR COM TECH LEAD: [descrever a dúvida]\`

---

**Prompt 4 — Plano de implementação**

Quando usar: após a spec estar aprovada, para decompô-la em tasks sequenciais executáveis pelo desenvolvedor em formação.

Regras de geração: tasks sequenciais (cada uma tem a anterior como pré-requisito), granularidade máxima de 2h por task, instrução clara (dev não deduz o que fazer), teste junto com a task (nunca depois), pontos de revisão obrigatórios após tasks de lógica de domínio ou autorização.

Formato de cada task:
\`\`\`
### Task N — [título objetivo]
- **O que fazer:** [instrução direta — verbo no imperativo]
- **Onde:** [caminho exato do arquivo]
- **Como verificar:** [critério objetivo de conclusão]
- **Teste a escrever:** [o que o teste deve verificar]
- **⚠️ Ponto de revisão do tech lead:** Sim / Não
\`\`\`

Sinalização de risco: 🔴 lógica financeira (Tier 1) · 🟡 autorização/banco/integração · 🟢 UI/estrutura/scaffolding

**Task Final obrigatória** em todo plano: atualizar \`CONTEXT.md\` do módulo movendo o item de "Backlog" para "Funcionalidades implementadas" e registrando novos tipos e funções exportados.

---

**Prompt 5 — Verificação pré-PR**

Quando usar: com a implementação concluída, antes de abrir o Pull Request. Quem executa: o próprio desenvolvedor, como auto-verificação obrigatória.

Retorna seis seções: cobertura de critérios de aceite (✅/⚠️/❌ por item), conformidade com regras de domínio, cobertura de casos extremos, violações de padrão DamaTools (float nativo, dados sensíveis em logs, ausência de Zod, query sem organizationId, secret em código), qualidade dos testes, veredicto (PRONTO PARA PR ou BLOQUEADO).

### 14.6 Exemplo prático — SAC no módulo Calculadora

**Requisito original do PO:** "Precisamos que o usuário consiga simular um financiamento pelo SAC, com o valor das parcelas diminuindo ao longo do tempo."

**Etapa 1 — Discovery (Prompt 1):** Tech lead executa e obtém a reformulação objetiva, as ambiguidades (taxa nominal ou efetiva? IOF incluso? Carência?) e as regras implícitas: \`A = PV ÷ n\`, \`J_k = SD_{k-1} × i\`, \`PMT_k = A + J_k\`, arredondamento ABNT NBR 5891.

**Etapa 2 — Spec aprovada (Prompt 2):** Spec gerada com Tier 1, referência Circular BCB 3.957/2019. Regras de domínio chave: amortização constante \`A = PV ÷ n\`; saldo devedor \`SD_k = PV - (k × A)\`; juros \`J_k = SD_{k-1} × i\`; arredondamento somente no resultado final (decimal.js, nunca float nativo); última parcela absorve diferenças acumuladas. Critério de aceite: PV=120.000, n=12, i=1% → parcela[1]=11.200,00; parcela[12]=10.100,00; SUM(amortizacao)=120.000,00 exatamente.

**Etapa 3 — Plano (Prompt 4):** 5 tasks geradas: 🟢 criar estrutura de arquivos, 🔴 implementar calculateSAC() (ponto de revisão obrigatório), 🟡 criar schema Prisma e migration (ponto de revisão), 🟡 criar API route POST /api/calculator/sac, 🟢 criar componente SACResultTable + Task Final de atualizar CONTEXT.md.

**Etapa 4 — Implementação:** Dev executa tasks em sequência, parando nos pontos de revisão antes de continuar.

**Etapa 5 — Verificação (Prompt 5):** Antes de abrir o PR, dev executa o Prompt 5 com spec e código. Qualquer item ❌ ou ⚠️ é corrigido antes da submissão. Link para \`docs/specs/calculator/sac-amortizacao.md\` incluído na descrição do PR.

### 14.7 Armazenamento e versionamento

O repositório mantém dois tipos distintos de artefatos do SDD:

**Specs** são permanentes e imutáveis após aprovação. Documentam *o que* foi construído.

**Planos de implementação** são efêmeros. Documentam *como* construir; ficam obsoletos após o merge e não precisam ser mantidos indefinidamente.

\`\`\`
docs/
├── specs/                          ← permanente; imutável após aprovação
│   ├── _template.md                ← template em branco para copiar
│   ├── calculator/
│   │   ├── CONTEXT.md              ← contexto do módulo para agentes de IA
│   │   ├── sac-amortizacao.md
│   │   └── price-amortizacao.md
│   ├── amcc/
│   │   ├── CONTEXT.md
│   │   └── xml-generation.md
│   └── ras/
│       ├── CONTEXT.md
│       └── indicadores-dashboard.md
└── plans/                          ← efêmero; arquivado após merge do PR
    ├── calculator/
    │   └── sac-amortizacao.md
    └── amcc/
\`\`\`

| Artefato | Localização | Criado quando | Ciclo de vida |
|---|---|---|---|
| Spec | \`docs/specs/[modulo]/[nome].md\` | Antes do branch | Permanente; imutável após aprovação |
| Plano | \`docs/plans/[modulo]/[nome].md\` | Após spec aprovada | Arquivado após merge do PR |
| CONTEXT.md | \`docs/specs/[modulo]/CONTEXT.md\` | Na primeira spec do módulo | Atualizado a cada nova spec |

Mudanças de requisito durante a implementação resultam em nova spec ou adendo versionado — nunca na edição do documento original aprovado.

### 14.8 Critérios de aprovação de uma spec

O tech lead aprova uma spec quando todos os critérios abaixo são atendidos:

- **Objetivo testável:** cada critério de aceite pode ser verificado por teste automatizado sem interpretação subjetiva
- **Regras de domínio completas:** nenhuma regra financeira foi deixada implícita; o desenvolvedor não precisa consultar fontes externas
- **Casos extremos mapeados:** os limites do sistema estão definidos explicitamente
- **Escopo delimitado:** o que não está descrito na spec não entra no PR — a spec é o contrato
- **Sem ambiguidade executável:** o desenvolvedor em formação consegue implementar sem precisar interpretar o que fazer em qualquer situação coberta

Specs reprovadas retornam ao autor com comentários objetivos por seção. O desenvolvimento não se inicia enquanto o status não estiver em \`Aprovada\`.

### 14.9 Integração com o board Scrumban

No GitHub Projects, o ciclo de uma tarefa com SDD segue a progressão:

\`\`\`
Backlog
  → A fazer
      → Em progresso [label: spec:em-andamento]
      → Em progresso [label: spec:em-revisão]
      → Em progresso [label: spec:aprovada]  ← branch aberto aqui
  → Em review (PR aberto)
  → Concluído
\`\`\`

A label \`spec:aprovada\` no card sinaliza para toda a equipe que o desenvolvimento pode ser iniciado. PRs de tarefas Tier 1 ou Tier 2 sem essa label são recusados na revisão.

### 14.10 Arquivo CONTEXT.md por módulo

O \`CONTEXT.md\` é um arquivo de referência rápida mantido na pasta de specs de cada módulo. Seu propósito principal é fornecer ao agente de IA o estado atual do módulo antes da geração de novas specs ou planos — sem ele, o agente desconhece o que já foi construído e gera artefatos redundantes ou contraditórios.

\`\`\`markdown
# Contexto do módulo — [Nome do Módulo]

## Propósito
[Uma ou duas frases: o que este módulo resolve para a IF]

## Funcionalidades implementadas
| Spec | Status | Descrição |
| [sac-amortizacao.md](sac-amortizacao.md) | Implementada | Cronograma SAC completo |

## Interfaces públicas (index.ts)
[Funções e tipos exportados — atualizar a cada spec implementada]

## Regras de domínio transversais ao módulo
[Regras que se aplicam a todas as specs]

## Padrões de código estabelecidos
- [Ex: funções de domain/ são puras, sem efeitos colaterais]

## Dependências externas consumidas
[APIs, tabelas de banco, módulos shared utilizados]

## Backlog do módulo (não iniciadas)
[Specs planejadas mas ainda não escritas — evita duplicação]
\`\`\`

**Manutenção:** o tech lead atualiza o \`CONTEXT.md\` ao aprovar cada nova spec. A seção "Funcionalidades implementadas" cresce incrementalmente, tornando-se um índice vivo de tudo que o módulo entrega.

### 14.11 Contexto obrigatório para agentes de IA

A qualidade da spec ou plano gerado é diretamente proporcional à profundidade do contexto fornecido.

| Sem este contexto | Risco concreto |
|---|---|
| \`CLAUDE.md\` | Agente usa \`Number\` em vez de \`decimal.js\`; loga dados sensíveis; ignora padrões de commit e arquitetura |
| \`CONTEXT.md\` do módulo | Agente reimplementa função já existente; gera spec para algo já implementado |
| Código \`domain/\` do módulo | Agente propõe estrutura divergente; desconhece tipos já definidos |
| Specs existentes do módulo | Agente cria spec que contradiz comportamento já especificado |

**Hierarquia de contexto por Tier:**

| Arquivo de contexto | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| \`CLAUDE.md\` | Obrigatório | Obrigatório | Recomendado |
| \`docs/specs/[modulo]/CONTEXT.md\` | Obrigatório | Obrigatório | Recomendado |
| \`src/modules/[modulo]/domain/\` | Obrigatório | Recomendado | Não necessário |
| \`src/modules/[modulo]/index.ts\` | Recomendado | Recomendado | Não necessário |
| Specs existentes do módulo | Recomendado | Opcional | Não necessário |

**No Cursor (via \`@\`):**
\`\`\`
@CLAUDE.md
@docs/specs/calculator/CONTEXT.md
@src/modules/calculator/domain/
[Prompt de spec preenchido]
\`\`\`

**No Claude Code (CLI):**
\`\`\`bash
claude \\
  --context CLAUDE.md \\
  --context docs/specs/calculator/CONTEXT.md \\
  --context src/modules/calculator/domain/ \\
  "$(cat docs/plans/prompts/sdd-spec-tier1.md)"
\`\`\`

### 14.12 Atualização do CONTEXT.md pelo agente de IA

O agente que executa o plano de implementação é o artefato com maior contexto sobre o que foi construído: conhece a spec que seguiu, o código que escreveu, os tipos que exportou e os padrões que aplicou. Atribuir a ele a responsabilidade de atualizar o \`CONTEXT.md\` ao final da execução é mais preciso do que depender de o tech lead lembrar de fazê-lo manualmente.

Essa atualização está codificada como **Task Final obrigatória** em todo plano gerado pelo Prompt 4. Ela faz parte do PR como qualquer outro arquivo modificado, e o diff é revisado pelo tech lead no code review.

| Seção do CONTEXT.md | Ação |
|---|---|
| Funcionalidades implementadas | Mover o item de "Backlog" para esta seção com status \`Implementada\` |
| Interfaces públicas (index.ts) | Adicionar os novos tipos e funções exportados |
| Padrões de código estabelecidos | Registrar apenas padrões genuinamente novos |
| Backlog do módulo | Remover o item recém-implementado |

**O que o agente não deve fazer:** alterar ou remover registros de specs anteriores, reescrever o propósito do módulo, adicionar informações sobre outras specs além da que acabou de implementar.

A cada spec implementada, o \`CONTEXT.md\` cresce com uma entrada precisa, validada pelo agente e revisada pelo tech lead. Após seis meses de desenvolvimento, o arquivo contém um índice fiel de tudo que o módulo entrega — sem esforço de manutenção adicional além do que já está incorporado ao fluxo de code review.

---

## 15. Segurança da aplicação

Esta seção é particularmente crítica para a Arphia: os clientes são instituições financeiras reguladas pelo Banco Central, com obrigações legais sobre proteção de dados e cibersegurança. Falhas de segurança não são apenas problemas técnicos — geram exposição regulatória, perda de confiança e potencialmente exclusão do mercado.

A abordagem de segurança aqui é **defesa em profundidade**: múltiplas camadas independentes de proteção, partindo do princípio de que qualquer camada individual pode falhar.

SECURITY_DIAGRAM_PLACEHOLDER

### 14.1 Contexto regulatório

Dois corpos regulatórios principais incidem sobre o DamaTools:

**LGPD (Lei Geral de Proteção de Dados Pessoais — Lei 13.709/2018):**

Toda informação pessoal de cidadãos brasileiros (CPF, e-mail, dados financeiros pessoais) está sob escopo da LGPD. As implicações concretas para o produto:

- Coleta de dados apenas com finalidade explícita
- Direito do titular de acessar, corrigir e excluir seus dados
- Notificação obrigatória de incidentes de segurança à ANPD
- Designação de encarregado de dados (DPO) quando aplicável
- Bases legais documentadas para cada tratamento (consentimento, execução de contrato, obrigação legal)

**Resoluções do Banco Central sobre cibersegurança:**

A Resolução CMN nº 4.893/2021 (e atualizações posteriores, incluindo a Resolução CMN nº 5.274) estabelece requisitos de política de cibersegurança para instituições financeiras. Embora a Arphia não seja uma IF, ao **prestar serviços a IFs** torna-se parte da cadeia de fornecedores que essas instituições precisam avaliar. Clientes farão due diligence de segurança antes de contratar — ter esta documentação robusta é tanto questão de segurança quanto de viabilidade comercial.

### 14.2 Princípios norteadores

Cinco princípios que devem orientar toda decisão de segurança no projeto:

**Defesa em profundidade.** Nenhuma camada de segurança é confiável sozinha. Autenticação forte + autorização granular + criptografia + logs + monitoramento. Se uma falha, as outras seguram.

**Princípio do menor privilégio.** Todo usuário, processo e serviço tem acesso ao mínimo necessário para sua função, e nada além. Dev em formação não tem acesso ao banco de produção. Aplicação não roda como root no servidor. Conexão de banco usa usuário com permissões limitadas, não superuser.

**Negar por padrão.** Em qualquer decisão de acesso (rota protegida, ação em recurso, leitura de dado), a postura inicial é negar; permissão deve ser explicitamente concedida. Bug em código de autorização que falha tem que falhar para o lado seguro.

**Falhar de forma segura.** Erros e exceções não devem vazar informação (stack traces em produção, mensagens detalhadas de erro de banco). Em situação de incerteza, a aplicação fecha as portas em vez de abri-las.

**Segredos nunca no código.** Senhas, chaves de API, tokens, strings de conexão — tudo via variáveis de ambiente ou secrets manager. Commitar segredo no Git é incidente de segurança mesmo que o repositório seja privado.

### 14.3 Autenticação e gestão de sessões

**Hash de senhas:** \`argon2id\` (ou \`bcrypt\` com cost factor >= 12 como alternativa). Nunca armazenar senha em texto, nunca usar MD5 ou SHA-1. Biblioteca recomendada: \`argon2\` para Node.js.

**Política de senha** (seguindo recomendações modernas do NIST SP 800-63B):
- Mínimo de 12 caracteres
- Sem exigência arbitrária de "1 maiúscula + 1 número + 1 especial" (causa senhas previsíveis)
- Verificação contra lista de senhas comprometidas (HaveIBeenPwned API)
- Sem expiração compulsória (forçar troca periódica gera senhas piores)

**Cookies de sessão:**

\`\`\`
Set-Cookie: sessionId=...; HttpOnly; Secure; SameSite=Strict; Path=/
\`\`\`

- \`HttpOnly\`: impede acesso via JavaScript (mitiga XSS exfiltrando sessão)
- \`Secure\`: cookie enviado apenas via HTTPS
- \`SameSite=Strict\`: protege contra CSRF

**MFA:** Recomendado desde o início para usuários com papel admin. TOTP via apps como Authy ou Google Authenticator. Para usuários comuns, MFA é opcional inicialmente, mas a infraestrutura deve estar pronta.

**Proteção contra brute force:**
- Rate limiting em endpoints de login (5 tentativas por 15 minutos por IP + por usuário)
- Lock de conta após 10 tentativas falhas (com notificação por e-mail)
- CAPTCHA após 3 tentativas falhas em sequência

**Biblioteca recomendada:** Auth.js (NextAuth) — testada, ativamente mantida, integra bem com Next.js e Prisma.

### 14.4 Autorização e controle de acesso

Modelo baseado em **RBAC multi-tenant**, conforme definido em 6.6:

RBAC_DIAGRAM_PLACEHOLDER

**Verificação em três camadas:**

1. **Middleware de rota** (servidor) — bloqueia acesso a rotas sem permissão antes mesmo do handler executar
2. **Lógica de aplicação** — cada operação verifica novamente (defesa em profundidade)
3. **UI** — esconde botões/links de ações sem permissão (UX, não segurança real)

**Prevenção de IDOR (Insecure Direct Object Reference):**

Toda query que busca um recurso por ID deve incluir o owner ou organização na cláusula WHERE, nunca apenas o ID:

\`\`\`typescript
// ❌ Errado — usuário pode requisitar qualquer simulação
const sim = await prisma.simulation.findUnique({ where: { id } });

// ✅ Correto — só retorna se pertencer à organização do usuário
const sim = await prisma.simulation.findFirst({
  where: { id, organizationId: session.organizationId }
});
\`\`\`

Esta regra é absoluta e deve estar no \`CLAUDE.md\`.

### 14.5 Proteção de dados

**Em trânsito (TLS):**
- HTTPS obrigatório em todas as rotas, sem exceção
- TLS 1.2 mínimo, preferência por 1.3
- HSTS (\`Strict-Transport-Security\`) com \`max-age\` longo após estabilização
- Certificados via Let's Encrypt com renovação automática (Certbot)
- Redirecionamento automático de HTTP para HTTPS no nginx

**Em repouso:**
- PostgreSQL com encryption at rest no nível do disco (LUKS na VM ou padrão do DO Managed Database)
- Backups criptografados antes de upload para Spaces (\`gpg\` ou \`openssl enc\`)

**Em uso:**
- Dados sensíveis não trafegam em logs (CPF, valores de transação)
- Mascaramento em telas administrativas (CPF aparece como \`***.***.***-12\`)
- APIs retornam apenas os campos necessários para a tela
- Variáveis em memória de dados sensíveis são zeradas quando não usadas mais

### 14.6 Mitigação contra OWASP Top 10

| Ameaça | Mitigação aplicada |
|---|---|
| Broken Access Control | Verificação em três camadas (14.4); IDOR prevention obrigatório |
| Cryptographic Failures | TLS 1.2+; argon2 para senhas; campos sensíveis criptografados |
| Injection (SQL, etc.) | Prisma parametriza queries automaticamente; \`$queryRaw\` apenas com revisão obrigatória do tech lead |
| Insecure Design | Arquitetura modular com fronteiras explícitas; threat modeling antes de features sensíveis |
| Security Misconfiguration | Headers de segurança configurados (14.8); ambientes endurecidos; sem defaults perigosos |
| Vulnerable Components | Dependabot ativo; \`npm audit\` no CI; revisão antes de novas dependências |
| Auth Failures | Auth.js; MFA para admin; rate limiting; políticas modernas de senha |
| Software & Data Integrity | Lockfiles versionados; CI verifica integridade; assinaturas em releases |
| Logging & Monitoring Failures | Logs estruturados; Sentry; alertas de padrões suspeitos (14.10) |
| SSRF | Validação de URLs em qualquer integração externa; whitelist de hosts |

### 14.7 Gestão de secrets e variáveis de ambiente

| Local | O quê | Acesso |
|---|---|---|
| \`.env.local\` | Credenciais de desenvolvimento local (banco local, chaves de sandbox) | Apenas na máquina do dev |
| GitHub Actions Secrets | Credenciais para deploy (SSH, banco staging) | Apenas via CI/CD |
| \`.env\` no servidor staging | Credenciais de \`arphia-db-dev\`, APIs externas (sandbox) | Servidor, leitura via PM2 |
| \`.env\` no servidor produção | Credenciais de \`arphia-db-prod\`, APIs externas (prod) | Servidor, leitura via PM2, **acesso restrito ao tech lead** |

**Regras:**
- \`.env*\` no \`.gitignore\` (apenas \`.env.example\` versionado)
- Pre-commit hook (\`husky\` + \`gitleaks\`) escaneia commits em busca de padrões de secrets
- Rotação de credenciais a cada 6 meses ou em qualquer suspeita de comprometimento
- Credenciais novas são providas via canal seguro (não Slack/email — gerenciador de senhas compartilhado)

### 14.8 Headers de segurança

Configurados no nginx (afetam todas as respostas):

\`\`\`nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
\`\`\`

Verificar periodicamente com Mozilla Observatory e Security Headers para validar score.

### 14.9 Validação de entrada e sanitização

**Validação em três camadas:**

1. **TypeScript em tempo de compilação** — tipos protegem boa parte dos casos
2. **Zod schemas em runtime** — toda entrada de API valida contra schema explícito
3. **Constraints de banco** — última linha de defesa (NOT NULL, CHECK, UNIQUE)

**Exemplo de uso de Zod:**

\`\`\`typescript
import { z } from "zod";

const createSimulationSchema = z.object({
  amount: z.number().positive().max(100_000_000),
  installments: z.number().int().min(1).max(600),
  interestRate: z.number().min(0).max(1000),
  type: z.enum(["PRICE", "SAC", "SAA", "SAM"]),
});

const result = createSimulationSchema.safeParse(request.body);
if (!result.success) {
  return Response.json({ error: "Invalid input" }, { status: 400 });
}
\`\`\`

Nunca confiar em validação de cliente. UI valida para UX, servidor valida para segurança.

### 14.10 Auditoria e logs

**Tabela \`shared.audit_log\`:** registra eventos sensíveis para fins regulatórios e investigativos.

| Coluna | Conteúdo |
|---|---|
| \`user_id\` | Quem |
| \`organization_id\` | Em qual organização |
| \`action\` | O quê (ex: \`simulation.created\`, \`user.login\`, \`permission.changed\`) |
| \`target_type\` / \`target_id\` | Recurso afetado |
| \`metadata\` | JSON com contexto adicional (sem dados sensíveis) |
| \`ip_address\` | De onde |
| \`created_at\` | Quando |

**Eventos que devem ser auditados:** login (sucesso e falha), mudança de senha ou MFA, mudança de permissão, geração de arquivos regulatórios (AMCC), exportação de dados em massa, acesso a relatórios financeiros, mudanças em configuração da organização.

**Alertas automáticos (via Sentry/Slack):**
- 5+ logins falhos em sequência para mesmo usuário
- Login a partir de IP nunca usado antes
- Acesso fora de horário comercial (configurável por organização)
- Exportação de dados de volume incomum

### 14.11 Backups e continuidade

- **Criptografia antes de upload:** backups passam por \`gpg\` antes de irem para Spaces
- **Teste mensal de restore:** uma vez por mês, restaurar backup em ambiente isolado e verificar integridade
- **RPO (Recovery Point Objective):** máximo 24h de perda aceitável (backups diários)
- **RTO (Recovery Time Objective):** máximo 4h para restaurar serviço em caso de incidente catastrófico
- **Documento de DR:** procedimento passo a passo, mantido atualizado, para que qualquer membro do time consiga executar em emergência

### 14.12 Dependências e supply chain

- \`npm audit\` rodando no CI (falha o build em vulnerabilidades high/critical)
- Dependabot configurado para PRs automáticos de updates de segurança
- \`package-lock.json\` sempre commitado (reprodutibilidade)
- Em produção, \`npm ci --omit=dev\` para garantir lockfile exato

**Antes de adicionar nova dependência:** verificar manutenção ativa, número de mantenedores, vulnerabilidades conhecidas, tamanho do bundle e licença compatível com uso comercial.

### 14.13 Cultura, treinamento e resposta a incidentes

**PRs com impacto de segurança** recebem label \`security-impact\` e exigem checklist específico:
- [ ] Autorização verificada em todas as queries
- [ ] Entrada validada com Zod
- [ ] Sem dados sensíveis em logs
- [ ] Erros não vazam informação interna
- [ ] Headers de segurança preservados

**Plano de resposta a incidentes:**

1. **Detecção** — quem percebeu, como, quando
2. **Contenção** — ações imediatas (revogar credenciais, isolar VM, bloquear IP)
3. **Erradicação** — remover a causa raiz
4. **Recuperação** — restaurar operação normal
5. **Comunicação** — quem informar (ANPD em até 72h se dados pessoais; clientes afetados; autoridades regulatórias se aplicável)
6. **Lições aprendidas** — post-mortem sem culpa, ações para prevenir recorrência

Pessoa de contato principal em incidentes: tech lead. Em ausência, sócio de negócio acionado.

---

## 16. Code Review e qualidade

### 15.1 Checklist por Tier

**Tier 1 — checklist rigoroso:**
- [ ] Existem testes cobrindo o caso feliz
- [ ] Existem testes cobrindo casos extremos (zeros, negativos, valores máximos)
- [ ] Cálculo usa \`decimal.js\` (zero uso de float nativo)
- [ ] Resultado bate com cálculo manual em pelo menos 2 exemplos
- [ ] Validação de entrada cobre formatos inválidos
- [ ] Logs não vazam dados sensíveis
- [ ] Arquivo \`CLAUDE.md\` foi atualizado se regra nova foi introduzida

**Tier 2 — checklist padrão:**
- [ ] Existem testes para o fluxo principal
- [ ] Tratamento de erro está presente (não só caminho feliz)
- [ ] Estados de loading e erro são exibidos ao usuário
- [ ] Não há dados sensíveis em logs ou URLs
- [ ] Performance aceitável em datasets realistas

**Tier 3 — checklist leve:**
- [ ] CodeRabbit aprovou
- [ ] Build passou
- [ ] Visual confere com o esperado (screenshots no PR se UI)

### 15.2 Testes obrigatórios por camada

| Camada | Tipo de teste | Cobertura mínima |
|---|---|---|
| Domain (Tier 1) | Unitário | 100% das funções públicas |
| Services (Tier 2) | Integração | Fluxos principais |
| UI (Tier 3) | E2E (Playwright) | Happy path |

## 17. Monitoramento e observabilidade

### 16.1 Objetivo e escopo

O monitoramento constitui a última camada operacional do processo de desenvolvimento da Arphia. Sem visibilidade contínua sobre o estado da aplicação, erros passam despercebidos, degradações de performance acumulam-se silenciosamente e incidentes são descobertos apenas quando o cliente reporta — cenário inaceitável para uma plataforma que atende instituições financeiras reguladas.

Esta seção define os requisitos, as ferramentas, as responsabilidades e o processo de resposta a incidentes de monitoramento do DamaTools em ambiente de produção e, secundariamente, em staging.

### 16.2 Requisitos fundamentais

O sistema de monitoramento deve atender a cinco requisitos inegociáveis:

**Visibilidade total de erros.** Toda exceção não tratada, falha de requisição ou erro de servidor deve ser capturada, classificada e notificada automaticamente. Nenhum erro em produção deve passar despercebido por mais de 15 minutos.

**Disponibilidade contínua.** A aplicação deve ser monitorada externamente a cada 5 minutos. Qualquer indisponibilidade superior a 5 minutos deve gerar alerta imediato para a equipe.

**Rastreabilidade de performance.** Tempos de resposta de endpoints críticos (cálculos financeiros, geração de arquivos regulatórios) devem ser mensurados continuamente, com alertas em caso de degradação acima de limiares definidos.

**Logs estruturados e auditáveis.** Os logs da aplicação devem seguir formato estruturado (JSON), ser persistidos com rotação automática e estar disponíveis para consulta retrospectiva por pelo menos 30 dias.

**Independência de notificação.** Os alertas devem chegar à equipe por um canal externo à aplicação monitorada — se a aplicação está fora do ar, o alerta não pode depender dela para ser entregue.

MONITORING_DIAGRAM_PLACEHOLDER

### 16.3 Pilares do monitoramento

O monitoramento do DamaTools se organiza em cinco pilares, cada um com ferramenta, métrica e alerta próprios:

#### 16.3.1 Monitoramento de erros — Sentry

O Sentry constitui a ferramenta central de captura de erros. Deve ser integrado tanto no backend (Node.js/Next.js) quanto no frontend (React), cobrindo:

**Configuração obrigatória:**

- Integração via SDK oficial (\`@sentry/nextjs\`) inicializada no bootstrap da aplicação
- Source maps enviados a cada deploy para stack traces legíveis
- Configuração de \`environment\` (staging, production) em cada inicialização
- Captura automática de exceções não tratadas e rejeições de Promises
- Breadcrumbs habilitados para rastrear sequência de eventos antes do erro

**Informações a capturar em cada evento:**

| Campo | Fonte | Obrigatório |
|---|---|---|
| Stack trace completo | Automático (SDK) | Sim |
| Usuário (ID, organização) | Contexto de sessão | Sim |
| Módulo afetado (calculator, amcc, etc.) | Tag customizada | Sim |
| Ambiente (staging/production) | Variável de ambiente | Sim |
| URL e método HTTP | Automático | Sim |
| Body da requisição | Não — dado sensível | Não |

**Regras de alerta no Sentry:**

| Condição | Ação |
|---|---|
| Erro novo (nunca visto antes) | Notificação imediata no Slack \`#alertas-producao\` |
| Erro existente reaparecendo após resolução | Notificação imediata |
| Volume de erros > 10 em 5 minutos | Alerta crítico (Slack + mensagem direta ao tech lead) |
| Erro em módulo Tier 1 (calculator, amcc) | Alerta crítico independente do volume |

**O que não capturar:** dados pessoais (CPF, CNPJ), valores monetários de operações, conteúdo de bodies de requisição e tokens de autenticação. O \`beforeSend\` do Sentry deve ser configurado para sanitizar esses campos antes do envio.

#### 16.3.2 Monitoramento de disponibilidade — UptimeRobot

O UptimeRobot (plano gratuito) realiza verificações externas de disponibilidade, independentes da infraestrutura da Arphia:

**Monitors configurados:**

| Monitor | URL | Intervalo | Tipo |
|---|---|---|---|
| Produção — principal | \`https://damatools.com.br\` | 5 min | HTTPS |
| Produção — API health | \`https://damatools.com.br/api/health\` | 5 min | Keyword (espera \`"ok"\`) |
| Staging | \`https://staging.damatools.com.br\` | 15 min | HTTPS |

**Endpoint \`/api/health\`:**

Implementar um endpoint dedicado que verifica a saúde real da aplicação, não apenas se o processo está respondendo:

\`\`\`typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || 'unknown',
  };

  try {
    await prisma.$queryRaw\`SELECT 1\`;
    checks.database = true;
  } catch (e) {
    // Banco inacessível
  }

  const healthy = checks.database;
  return Response.json(
    { status: healthy ? 'ok' : 'degraded', checks },
    { status: healthy ? 200 : 503 }
  );
}
\`\`\`

O UptimeRobot deve verificar a presença da keyword \`"ok"\` na resposta. Se o banco estiver inacessível, o endpoint retorna \`503\` e o UptimeRobot detecta a falha mesmo com o processo Node.js ainda ativo.

**Alertas de disponibilidade:**

- Queda detectada → notificação no Slack \`#alertas-producao\` + e-mail para o tech lead
- Recuperação → notificação de recovery no mesmo canal
- Status page pública (opcional, via UptimeRobot) disponível para consulta

#### 16.3.3 Monitoramento de performance

Na fase inicial (equipe de 3 pessoas, volume baixo), a abordagem de performance deve ser pragmática — evitar a complexidade de ferramentas de APM completas (Datadog, New Relic) e adotar mecanismos leves que forneçam os sinais essenciais.

**Middleware de métricas de tempo de resposta:**

\`\`\`typescript
// src/shared/middleware/metrics.ts
export function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6; // ms
    const route = req.route?.path || req.url;
    const method = req.method;
    const status = res.statusCode;

    // Log estruturado com tempo de resposta
    logger.info({
      type: 'http_request',
      method,
      route,
      status,
      duration_ms: Math.round(duration),
      module: extractModule(route), // 'calculator', 'amcc', etc.
    });

    // Alerta se tempo de resposta exceder limiares
    if (duration > 5000) {
      logger.warn({
        type: 'slow_request',
        method,
        route,
        duration_ms: Math.round(duration),
      });
    }
  });

  next();
}
\`\`\`

**Limiares de tempo de resposta:**

| Tipo de operação | Aceitável | Alerta (warning) | Crítico |
|---|---|---|---|
| Páginas e consultas simples | < 500ms | 500ms – 2s | > 2s |
| Cálculos financeiros (PRICE, SAC, CET) | < 2s | 2s – 5s | > 5s |
| Geração de arquivos (AMCC XML) | < 10s | 10s – 30s | > 30s |
| Health check | < 200ms | 200ms – 1s | > 1s |

**Evolução futura:** quando o volume de requisições justificar, considerar a adoção de Grafana Cloud (tier gratuito) ou Prometheus para dashboards de performance histórica. Essa migração não exige mudanças na aplicação se os logs já estiverem estruturados conforme descrito.

#### 16.3.4 Logs estruturados

Os logs constituem o registro histórico de tudo que acontece na aplicação. Devem seguir formato estruturado (JSON) para possibilitar consulta, filtragem e análise automatizada.

**Biblioteca recomendada:** \`pino\` — logger de alta performance para Node.js, com output JSON nativo.

**Configuração base:**

\`\`\`typescript
// src/shared/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  serializers: {
    // Sanitizar dados sensíveis automaticamente
    req: (req) => ({
      method: req.method,
      url: req.url,
      // NÃO incluir headers (podem conter tokens) ou body (dados sensíveis)
    }),
  },
  redact: {
    paths: ['cpf', 'cnpj', 'password', 'token', 'authorization', '*.cpf', '*.cnpj'],
    censor: '[REDACTED]',
  },
});
\`\`\`

**Níveis de log e quando utilizar cada um:**

| Nível | Uso | Exemplo |
|---|---|---|
| \`fatal\` | Aplicação não consegue continuar | Falha na conexão com banco ao iniciar |
| \`error\` | Erro que afeta uma requisição ou operação | Exceção em cálculo, falha de API externa |
| \`warn\` | Situação anormal que não bloqueia | Requisição lenta, retry bem-sucedido |
| \`info\` | Eventos operacionais normais | Requisição HTTP, deploy concluído, login |
| \`debug\` | Detalhes para diagnóstico | Valores intermediários de cálculo, queries SQL |

**Regra:** \`debug\` nunca ativo em produção (volume excessivo, risco de vazamento de dados). Em staging, ativar via variável de ambiente quando necessário para investigação.

**Persistência e rotação:**

| Aspecto | Configuração |
|---|---|
| Destino dos logs | Arquivo em \`/var/log/arphia/damatools-prod.log\` |
| Rotação | \`logrotate\` diário, compressão gzip |
| Retenção | 30 dias em disco, 90 dias em backup (Spaces) |
| Tamanho máximo por arquivo | 100MB antes de rotacionar |

**Formato de cada entrada:**

\`\`\`json
{
  "level": "info",
  "time": "2027-03-15T14:32:01.234Z",
  "type": "http_request",
  "method": "POST",
  "route": "/api/calculator/simulate",
  "status": 200,
  "duration_ms": 142,
  "module": "calculator",
  "userId": "usr_abc123",
  "organizationId": "org_xyz789",
  "requestId": "req_8f3a2b"
}
\`\`\`

O campo \`requestId\` (gerado no início de cada requisição via middleware) permite rastrear toda a cadeia de eventos de uma única operação nos logs.

#### 16.3.5 Métricas de infraestrutura

O servidor (Droplet DigitalOcean) deve ser monitorado quanto ao consumo de recursos do sistema operacional:

**Métricas coletadas pelo DigitalOcean Monitoring (nativo, gratuito):**

| Métrica | Limiar de alerta |
|---|---|
| CPU | > 80% por 10 minutos consecutivos |
| Memória RAM | > 85% utilizada |
| Disco | > 80% ocupado |
| Banda de rede | Pico anormal (> 3x a média) |

**Configuração:**

Ativar o DigitalOcean Monitoring Agent na VM (instalação via \`apt install do-agent\`). Os alertas são configurados no painel do DigitalOcean e enviam e-mail automaticamente. Para integrar com Slack, utilizar o webhook do DigitalOcean ou criar um monitor adicional no UptimeRobot.

**Monitoramento do PM2:**

O PM2 (gerenciador de processos) oferece métricas nativas do processo Node.js:

\`\`\`bash
# Status em tempo real
pm2 monit

# Métricas acumuladas
pm2 info prod

# Itens a observar:
# - Restarts (se > 0, algo está causando crash)
# - Heap usage (tendência de crescimento = memory leak)
# - Event loop latency (> 100ms indica sobrecarga)
\`\`\`

Configurar o PM2 para reiniciar automaticamente se o consumo de memória exceder o limite:

\`\`\`javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'prod',
    script: 'node_modules/.bin/next',
    args: 'start',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
\`\`\`

### 16.4 Canais de notificação

As notificações de monitoramento seguem uma hierarquia de severidade que determina o canal e a urgência:

| Severidade | Exemplo | Canal | Tempo de resposta esperado |
|---|---|---|---|
| Crítica | Aplicação fora do ar; erro em cálculo Tier 1 | Slack \`#alertas-producao\` + DM ao tech lead + e-mail | Imediato (< 15 min) |
| Alta | Volume anormal de erros; performance degradada | Slack \`#alertas-producao\` | Até 1 hora |
| Média | Erro novo em módulo Tier 2/3; warning de infra | Slack \`#alertas-producao\` | Até 4 horas (horário comercial) |
| Baixa | Dependência com update de segurança; aviso de disco | Slack \`#builds-e-deploys\` | Próximo dia útil |

**Regra de silenciamento:** alertas de staging são encaminhados apenas para o canal \`#builds-e-deploys\`, nunca para \`#alertas-producao\`, exceto em preparação para release. Alertas de produção nunca são silenciados.

### 16.5 Processo de resposta a incidentes de monitoramento

Quando um alerta de severidade crítica ou alta é disparado, o seguinte processo deve ser seguido:

**Etapa 1 — Reconhecimento (< 15 minutos)**

O tech lead (ou, na sua ausência, o sócio de negócio) deve confirmar o recebimento do alerta no canal Slack com uma reação ou mensagem breve indicando que está investigando. O objetivo é sinalizar ao restante da equipe que o incidente foi percebido.

**Etapa 2 — Diagnóstico (< 30 minutos)**

Sequência recomendada de investigação:

1. Verificar o endpoint \`/api/health\` manualmente
2. Consultar o dashboard do Sentry para o erro específico
3. Verificar os logs da aplicação via SSH (\`tail -f /var/log/arphia/damatools-prod.log | jq\`)
4. Verificar métricas de infra no painel do DigitalOcean (CPU, memória, disco)
5. Verificar se houve deploy recente (\`pm2 logs --lines 50\`)

**Etapa 3 — Mitigação**

Dependendo do diagnóstico, aplicar a ação mais rápida para restaurar o serviço:

| Diagnóstico | Ação de mitigação |
|---|---|
| Erro introduzido por deploy recente | Rollback para versão anterior (\`git reset --hard <tag>\` + \`pm2 restart\`) |
| Processo Node.js travado | \`pm2 restart prod\` |
| Banco de dados inacessível | Verificar status do PostgreSQL (\`systemctl status postgresql\`) e reiniciar se necessário |
| Disco cheio | Rotacionar logs manualmente (\`logrotate -f\`) e limpar arquivos temporários |
| Ataque ou tráfego anormal | Ativar rate limiting adicional no nginx; bloquear IPs suspeitos |

**Etapa 4 — Comunicação**

Após mitigação, registrar no canal Slack:

- O que aconteceu (causa raiz identificada ou hipótese)
- O que foi feito para resolver
- Se há risco de recorrência
- Se clientes foram afetados

Se clientes foram impactados.

**Etapa 5 — Post-mortem (até 48h após o incidente)**

Para incidentes de severidade crítica, redigir um post-mortem breve documentando:

- Timeline do incidente (quando começou, quando foi detectado, quando foi resolvido)
- Causa raiz
- Impacto (número de usuários afetados, duração)
- Ações preventivas para evitar recorrência

O post-mortem deve ser armazenado em \`docs/post-mortems/\` no repositório e referenciado na retrospectiva semanal mais próxima.

### 16.6 Dashboard operacional

Embora ferramentas avançadas de dashboard (Grafana, Datadog) estejam fora de escopo na fase inicial, é necessário manter uma visão consolidada do estado da plataforma. A seguinte composição cumpre esse papel com custo zero:

| Componente | Ferramenta | Acesso |
|---|---|---|
| Status de uptime e histórico | UptimeRobot status page | URL pública (compartilhável com clientes) |
| Erros recentes e tendência | Dashboard do Sentry | Login do Sentry |
| Métricas de infraestrutura | Painel do DigitalOcean | Login do DigitalOcean |
| Processos e restarts | PM2 via SSH | Terminal no servidor |

A consolidação em um dashboard único (Grafana ou similar) deve ser considerada quando o volume de requisições tornar a consulta manual insuficiente, ou quando clientes exigirem SLA com relatórios de disponibilidade formalizados.

### 16.7 Monitoramento por módulo

A natureza modular do DamaTools exige atenção diferenciada por módulo, proporcional ao risco de cada um:

| Módulo | Nível de monitoramento | Justificativa |
|---|---|---|
| Calculadora Financeira | Máximo | Cálculos incorretos geram prejuízo financeiro direto |
| AMCC | Máximo | Arquivos regulatórios com erro podem causar sanções do BCB |
| RAS | Alto | Indicadores prudenciais alimentam decisões de gestão |
| Calendário | Médio | Eventos perdidos geram atraso, não erro financeiro |
| FGC | Máximo | Contribuições e limites impactam diretamente a operação |
| Rentabilidade / Classificação | Alto | Projeções incorretas comprometem decisões de negócio |
| Fluxo de Caixa / Orçamento | Máximo | Testes de estresse alimentam gestão de capital |

Na prática, o nível de monitoramento se traduz em granularidade de alertas no Sentry: módulos com nível "Máximo" disparam alerta em qualquer erro, enquanto módulos de nível "Médio" seguem as regras padrão de volume.

Para implementar essa diferenciação, adicionar a tag \`module\` em todo erro reportado ao Sentry e configurar regras de alerta separadas por tag.

### 16.8 Etapas de implantação do monitoramento

A implantação do monitoramento segue o ritmo do roadmap geral (Seção 17) e não deve ser tratada como atividade à parte — cada ambiente e ferramenta é configurado junto com a infraestrutura correspondente.

**Mês 1 — Fundação (junto com setup de infra)**

- [ ] Criar conta no Sentry e integrar SDK ao projeto
- [ ] Criar conta no UptimeRobot e configurar monitors de produção e staging
- [ ] Implementar endpoint \`/api/health\` com verificação de banco
- [ ] Configurar \`pino\` como logger com sanitização de dados sensíveis
- [ ] Instalar DigitalOcean Monitoring Agent na VM
- [ ] Configurar canal \`#alertas-producao\` no Slack com integrações

**Mês 2 — Estabilização**

- [ ] Configurar regras de alerta no Sentry por módulo (tag \`module\`)
- [ ] Implementar middleware de métricas de tempo de resposta
- [ ] Configurar \`logrotate\` e backup de logs para Spaces
- [ ] Configurar PM2 com \`max_memory_restart\`
- [ ] Validar que alertas de todos os pilares estão chegando no Slack

**Mês 3+ — Maturação**

- [ ] Definir e documentar limiares de performance por tipo de operação
- [ ] Criar status page pública (UptimeRobot) para comunicação com clientes
- [ ] Realizar primeiro teste de incidente simulado (derrubar staging propositalmente e medir tempo de resposta da equipe)
- [ ] Avaliar necessidade de Grafana Cloud para dashboards de tendência

### 16.9 Custos

| Ferramenta | Plano | Custo |
|---|---|---|
| Sentry | Developer (gratuito) | $0 |
| UptimeRobot | Free (50 monitors, 5 min) | $0 |
| DigitalOcean Monitoring | Nativo (incluso na VM) | $0 |
| PM2 | Open source | $0 |
| Pino | Open source | $0 |
| **Total monitoramento** | | **$0/mês** |

O custo zero na fase inicial é viável porque as ferramentas escolhidas oferecem tiers gratuitos suficientes para o volume atual. Conforme o número de clientes e o volume de requisições crescerem, os upgrades mais prováveis são Sentry Team (~$26/mês) e UptimeRobot Pro (~$7/mês) — investimento marginal comparado ao custo de um incidente não detectado em produção.

---

---

## 18. Roadmap de implantação

ROADMAP_DIAGRAM_PLACEHOLDER

Implantar todo o processo de uma vez é receita para nada funcionar. O roadmap abaixo escalona a complexidade de forma realista, ajustada ao período de formação do dev.

### 17.1 Mês 1 — Fundação

**Foco:** infraestrutura pronta, dev iniciando estudos.

| Semana | Tech Lead | Dev | Sócio |
|---|---|---|---|
| 1 | Cria GitHub Org, configura repo, branch protection | Inicia estudos (lógica de programação) | Define backlog inicial do produto |
| 2 | Configura ambientes (local, staging), DNS, SSL | Continua estudos + Git básico | Valida requisitos com possíveis clientes |
| 3 | Implementa primeiro módulo Tier 1 | Pratica HTML/CSS, lê código existente | Refina roadmap |
| 4 | Configura CI/CD, Slack, integrações | Faz primeiro PR (tarefa Tier 3 simples) | Acompanha demos |

**Marcos do mês:**
- Repositório com branch protection ativa
- Ambientes staging e produção no ar
- CLAUDE.md inicial escrito
- Dev fez pelo menos 1 PR

### 17.2 Meses 2-3 — Estabilização

**Foco:** processos rodando, dev começando a contribuir.

- Cerimônias Scrumban acontecendo semanalmente
- Tech lead em ritmo de Tier 1
- Dev em ritmo de Tier 3 com 1h/dia de pair programming
- CodeRabbit configurado e ativo
- Primeiras features de produto em produção

**Marcos:**
- Mínimo de 3 PRs por semana do dev (todos Tier 3)
- Zero bugs de Tier 1 em produção
- Retrospectiva semanal acontecendo regularmente

### 17.3 Meses 4-6 — Maturação

**Foco:** dev migra para Tier 2, processo ganha consistência.

- Dev começa Tier 2 com supervisão
- Pair programming cai para 1x por semana
- Métricas de processo começam a ser observadas
- Primeiros clientes-piloto utilizando o produto

**Marcos:**
- Dev completou primeira tarefa Tier 2 em produção
- Cobertura de testes em Tier 1 > 90%
- SLA básico definido para o produto (ex: 99% uptime)

### 17.4 A partir do mês 7 — Operação

Processo estabilizado, equipe em ritmo. A partir daqui, avaliações trimestrais:

- A equipe atual ainda atende a demanda? Precisa contratar?
- Stack continua adequada?
- Métricas de qualidade estão saudáveis?
- Há clientes pagantes em volume suficiente?

---

## 19. Indicadores de saúde do processo

### 18.1 Métricas de qualidade

| Indicador | Medição | Meta |
|---|---|---|
| Bugs em produção | Sentry (por semana) | < 2 por semana |
| Cobertura de testes Tier 1 | Relatório de CI | 100% |
| PRs com retrabalho | GitHub (> 2 review cycles) | < 20% |
| Tempo de deploy | GitHub Actions | < 8 minutos |

### 18.2 Métricas de processo

| Indicador | Medição | Meta |
|---|---|---|
| WIP médio | Board (weekly snapshot) | ≤ 2 |
| Tempo de PR aberto para merge | GitHub | < 2 dias úteis |
| Bloqueios não resolvidos em 24h | Board | 0 |

### 18.3 Revisão periódica

O processo descrito neste documento é revisado na retrospectiva quinzenal. Mudanças são propostas pelo tech lead e validadas pelo sócio de negócio antes de serem aplicadas.

---

## 20. Gestão de dependências

Toda dependência do projeto é classificada em uma das três categorias abaixo. A classificação determina o rigor na avaliação inicial, a estratégia de versionamento e a prioridade de atualização em caso de vulnerabilidade.

### 20.1 Categorias de dependência

| Categoria | Exemplos no DamaTools | Critério de classificação |
|---|---|---|
| **Crítica de domínio** | \`decimal.js\`, \`prisma\`, \`@prisma/client\`, \`zod\` | Falha ou comportamento incorreto impacta diretamente a correção dos cálculos financeiros ou a integridade dos dados |
| **Infraestrutura** | \`next\`, \`react\`, \`tailwindcss\`, \`pino\`, \`argon2\` | Sustentam a aplicação mas não determinam o resultado de operações financeiras |
| **Desenvolvimento** | \`typescript\`, \`eslint\`, \`jest\`, \`@testing-library/*\` | Presentes apenas no ambiente de desenvolvimento; não chegam ao bundle de produção |

### 20.2 Avaliação antes de adicionar uma dependência

A primeira pergunta é sempre: **a funcionalidade pode ser implementada internamente sem a dependência?** Para lógicas simples (formatação de data, truncamento de string, cálculo pontual), implementar internamente é preferível a introduzir um pacote externo.

Quando a dependência for necessária, aplicar o seguinte checklist antes de instalar:

\`\`\`
□ Última publicação no npm: há menos de 12 meses?
□ Issues abertas sem resposta do mantenedor: ausentes ou poucas?
□ npm audit não reporta vulnerabilidades conhecidas?
□ Licença compatível com uso comercial: MIT, Apache-2.0 ou ISC?
□ Governança: mantida por organização (não por único contribuidor)?
□ Para deps de frontend: bundle size aceitável (< 20 kB gzip para utils)?
□ Para deps críticas de domínio: aprovação explícita do tech lead?
\`\`\`

Qualquer item reprovado deve ser discutido com o tech lead antes de prosseguir. Dependências que envolvam parsing de dados financeiros, geração de arquivos regulatórios ou criptografia exigem aprovação do tech lead independentemente do resultado do checklist.

### 20.3 Semver e estratégia de versionamento

\`\`\`jsonc
{
  "dependencies": {
    // Críticas de domínio — pin versão exata
    // Motivo: atualização não planejada não deve alterar
    // comportamento de cálculo ou schema de banco silenciosamente
    "decimal.js": "10.4.3",
    "prisma": "5.10.2",
    "@prisma/client": "5.10.2",  // sempre igual à versão do prisma

    // Infraestrutura — range minor compatível
    "next": "^14.2.0",
    "react": "^18.3.0",
    "pino": "^9.1.0",

    // zod — exceção: pin exato apesar de ser "infraestrutura"
    // Motivo: mudanças em tipos de validação podem quebrar
    // schemas de spec silenciosamente
    "zod": "3.22.4"
  },
  "devDependencies": {
    // Dev — range minor é suficiente
    "typescript": "^5.4.0",
    "jest": "^29.7.0"
  }
}
\`\`\`

\`^MAJOR.MINOR.PATCH\` aceita atualizações de minor e patch, nunca de major. Pin exato (sem prefixo) não permite nenhuma atualização automática.

### 20.4 Lock file — package-lock.json

O \`package-lock.json\` registra a versão exata de cada pacote instalado, incluindo dependências transitivas. Garante que \`npm ci\` instale exatamente os mesmos pacotes em todas as máquinas e no CI.

**Regras:**
- O \`package-lock.json\` é sempre commitado no repositório. Nunca adicionado ao \`.gitignore\`.
- \`npm ci\` (usado no CI) instala a partir do lock file sem modificá-lo. \`npm install\` (usado localmente) pode atualizá-lo.
- Em conflitos de lock file durante merge:

\`\`\`bash
# 1. Aceitar a versão do branch de destino como base
git checkout develop -- package-lock.json

# 2. Reinstalar respeitando o package.json resultante do merge
npm install

# 3. Commitar o lock file atualizado
git add package-lock.json
git commit -m "chore: resolve package-lock conflict"
\`\`\`

### 20.5 Workflow do Dependabot

O Dependabot verifica automaticamente dependências desatualizadas e abre PRs com as atualizações.

| Tipo | Exemplo | Ação |
|---|---|---|
| **Patch** (\`x.y.3\` → \`x.y.4\`) | Correção de bug | Mergear após CI verde, sem revisão manual |
| **Minor** (\`x.2.z\` → \`x.3.z\`) | Feature retrocompatível | Mergear após CI verde; inspecionar changelog para deps críticas |
| **Major** (\`1.x.z\` → \`2.x.z\`) | Possíveis breaking changes | Revisão manual obrigatória; testar localmente; um major por vez |
| **Security** (qualquer nível) | Vulnerabilidade conhecida | Tratar como hotfix — prioridade sobre features em andamento |

\`\`\`yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
      day: monday
    groups:
      dev-dependencies:
        dependency-type: development
      prisma:
        patterns:
          - "prisma"
          - "@prisma/*"
    ignore:
      # Atualizações major de deps críticas só via revisão manual
      - dependency-name: "decimal.js"
        update-types: ["version-update:semver-major"]
      - dependency-name: "prisma"
        update-types: ["version-update:semver-major"]
\`\`\`

### 20.6 npm audit — pipeline de segurança

O \`npm audit\` compara as dependências instaladas contra o banco de vulnerabilidades do npm por nível de severidade: \`info\`, \`low\`, \`moderate\`, \`high\` e \`critical\`.

**No CI (step obrigatório antes do build):**
\`\`\`yaml
- name: Verificar vulnerabilidades
  run: npm audit --audit-level=high
  # Falha o build se houver vulnerabilidades high ou critical
  # Moderate e abaixo não bloqueiam — tratadas no ciclo semanal
\`\`\`

**Localmente (rodar antes de abrir PR):**
\`\`\`bash
npm audit                          # relatório completo
npm audit --audit-level=moderate   # filtrar moderate+
npm audit fix                      # aplica correções automáticas seguras
\`\`\`

\`npm audit fix --force\` aplica correções que podem introduzir breaking changes — usar somente com conhecimento do impacto e nunca em deps críticas de domínio sem revisão do tech lead.

Quando o audit fix automático não resolve (vulnerabilidade em dependência transitiva sem versão corrigida), usar \`overrides\` no \`package.json\`. Todo \`override\` deve ser documentado no PR com: qual vulnerabilidade resolve, por que o fix automático não funcionou e quando pode ser removido.

### 20.7 Processo de resposta a vulnerabilidades

| Severidade | Prazo | Tratamento |
|---|---|---|
| **Critical** | < 4 horas | Hotfix — fluxo \`hotfix/*\` da Seção 9 |
| **High** | < 24 horas | Hotfix ou PR urgente no develop |
| **Moderate** | Próximo ciclo semanal | PR normal com label \`security\` |
| **Low / Info** | Próxima janela de manutenção | Agrupa com atualizações regulares |

O canal \`#alertas-producao\` no Slack recebe notificações automáticas de vulnerabilidades high e critical via integração GitHub → canal (configurada no Dependabot ou GitHub Security Advisories).

### 20.8 Prisma — gestão específica

O Prisma tem ciclo de gestão próprio por ser responsável pelas migrations do banco de dados.

**Regra de versão:** \`prisma\` e \`@prisma/client\` devem sempre ter a mesma versão exata. Um mismatch causa erros em runtime.

**Após qualquer mudança no \`schema.prisma\`:**
\`\`\`bash
npx prisma generate        # regenera o client TypeScript
npx prisma migrate dev     # cria e aplica migration no banco de dev
\`\`\`

**No CI:**
\`\`\`yaml
- name: Gerar Prisma Client
  run: npx prisma generate

- name: Verificar migrations pendentes
  run: npx prisma migrate status
  # Falha se houver migration não aplicada no banco de CI
\`\`\`

Atualizações major do Prisma podem requerer alterações no \`schema.prisma\` e nos arquivos de migration. Executar a atualização em branch isolada, com revisão das release notes antes de qualquer migração em staging.

### 20.9 Dependências internas entre módulos

No monolito modular do DamaTools, as dependências internas (imports entre arquivos do próprio projeto) seguem regras tão estritas quanto as dependências externas — verificadas via ESLint.

\`\`\`
Permitido:
  módulo → /shared              ✓  (qualquer módulo pode importar de shared)
  /shared → /shared             ✓  (com atenção a circularidades)

Proibido:
  módulo A → módulo B           ✗  (viola isolamento do módulo)
  /shared → qualquer módulo     ✗  (inverte a hierarquia)
  import fora da index.ts       ✗  (viola a interface pública do módulo)
\`\`\`

Configuração via \`eslint-plugin-boundaries\`: cada módulo tem apenas acesso a \`shared\`. Qualquer import cruzando uma fronteira proibida gera erro de lint e bloqueia o PR no CI.

Detecção de dependências circulares em \`/shared\`: \`npx madge --circular src/shared/\`. Adicionar como step no CI — falha se encontrar circularidade.

### 20.10 Referência rápida

| Situação | Ação |
|---|---|
| Quer instalar dependência nova | Executar checklist da Seção 20.2 antes |
| Dep crítica de domínio | Approval do tech lead obrigatória |
| Dependabot abre PR de patch/minor | Mergear após CI verde |
| Dependabot abre PR de major | Revisar changelog, testar localmente, um major por vez |
| \`npm audit\` reporta critical/high | Tratar como hotfix — fluxo \`hotfix/*\` |
| Conflito no package-lock.json | \`git checkout develop -- package-lock.json && npm install\` |
| Mudança no schema.prisma | \`npx prisma generate && npx prisma migrate dev\` |
| Import de módulo A para módulo B | Não é permitido — mover para \`/shared\` ou usar evento de domínio |
| Circularidade em /shared detectada | Refatorar imediatamente — não mergear com circularidade |

---

## 21. Apêndices

### 19.1 Template de PR

\`\`\`markdown
## O que este PR faz
[Descrição objetiva da mudança]

## Tier
[ ] Tier 1 — Crítico  [ ] Tier 2 — Padrão  [ ] Tier 3 — Baixo risco

## Checklist
- [ ] Lint e type check passando
- [ ] Testes adicionados/atualizados
- [ ] CLAUDE.md atualizado (se nova regra de domínio)
- [ ] Sem dados sensíveis em logs ou comentários

## Como testar
[Passos para validar manualmente]
\`\`\`

### 19.2 CLAUDE.md exemplo

Arquivo \`CLAUDE.md\` na raiz do projeto:

\`\`\`markdown
# Contexto do projeto — DamaTools (Arphia)

## Sobre o produto
DamaTools é a plataforma modular da Arphia para instituições financeiras
reguladas pelo Banco Central do Brasil. Erros em cálculos ou interpretação
regulatória geram prejuízo real ao cliente.

## Stack
- TypeScript + Next.js (App Router)
- PostgreSQL com schemas por módulo
- Tailwind CSS + Zod + Jest

## ⚠️ Regras de domínio — OBRIGATÓRIO

### Transversais a todos os módulos

- SEMPRE \`decimal.js\`, NUNCA \`Number\` ou \`Math.round()\` para valores monetários
- CPF: validar com algoritmo oficial (não regex apenas)
- CNPJ: idem
- Datas: sempre em UTC no banco, fuso local apenas na apresentação

### Prevenção de IDOR (obrigatório)
Toda query por ID deve incluir \`organizationId\` no WHERE:
\`const sim = await prisma.simulation.findFirst({ where: { id, organizationId: session.organizationId } });\`

### Em caso de dúvida sobre regra de negócio
PARE e pergunte. Não infira regras financeiras ou regulatórias.

## Proibições
- Nunca logar CPF, CNPJ, valores de operações
- Nunca expor stack trace em respostas de API em produção
- Nunca commitar \`.env*\`
\`\`\`

### 19.3 Checklist de onboarding do dev

**Semana 1:**
- [ ] Acesso ao GitHub Org concedido
- [ ] Acesso ao Slack e ao Claude Pro
- [ ] Repositório clonado localmente
- [ ] Ambiente local rodando
- [ ] Primeiro commit feito (mesmo que trivial)
- [ ] Leitura do \`CLAUDE.md\` completa
- [ ] Trilha de estudo iniciada

### 19.4 Trilha de estudos

**Fase 0 (semanas 1-8):**
1. Curso em Vídeo (Gustavo Guanabara) — Lógica de Programação
2. Rocketseat Explorer — fundamentos web
3. MDN Web Docs — HTML/CSS/JS
4. OWASP Top 10 em vídeo gratuito (~4h) — módulo introdutório de segurança web

**Fase 1 (semanas 9-16):**
5. Documentação oficial do React
6. Curso de Next.js (Rocketseat ou similar)
7. Documentação do Prisma

**Contínuo:**
- Leitura de PRs do tech lead (ver código real do projeto)
- Sessões de pair programming semanais
- Documentação MDN para qualquer dúvida web

### 19.5 Template de post-mortem

\`\`\`markdown
## Incidente [DATA] — [TÍTULO BREVE]

**Duração:** [início] → [fim] ([X] minutos)
**Impacto:** [quem foi afetado e como]
**Causa raiz:** [o que causou o problema]
**Detecção:** [como foi detectado]
**Resolução:** [o que foi feito para resolver]

## Linha do tempo
- HH:MM — evento

## Ações corretivas
- [ ] Ação 1 — responsável — prazo
\`\`\`

### 19.6 Checklist de deploy para produção

- [ ] CI verde na branch \`main\`
- [ ] Migrations testadas em staging
- [ ] Rollback plan documentado
- [ ] Tech lead disponível nas próximas 2h
- [ ] Monitoramento ativo (Sentry + Uptime Robot)
- [ ] Comunicação para cliente (se mudança visível)

### 19.7 Referências

- [Conventional Commits](https://www.conventionalcommits.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev)
`;
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

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
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
  const md = buildMarkdown();
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
            onClick={() => setView("landing")}
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
          <OrbitalHero onSectionClick={goToSection} />
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