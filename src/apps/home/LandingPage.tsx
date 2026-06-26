import React, { useState } from "react";
import { useNavigate } from "react-router";

// ─── Design tokens (matches DamaTools system) ─────────────────────────────────
const LP_CSS = `
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
  }

  /* ── Base ── */
  .lp-root {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.65;
    color: var(--dt-text);
    background: var(--dt-bg);
    min-height: 100vh;
    font-feature-settings: 'ss01' on, 'cv11' on;
  }

  /* ── Topbar ── */
  .lp-topbar {
    position: sticky; top: 0; z-index: 50;
    background: rgba(252,252,250,.88);
    backdrop-filter: saturate(180%) blur(20px);
    border-bottom: 1px solid var(--dt-border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 28px; height: 60px;
  }
  [data-dt-dark="true"] .lp-topbar { background: rgba(14,13,11,.88); }
  .lp-brand {
    display: flex; align-items: center; gap: 12px;
    font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600;
    letter-spacing: -.01em; color: var(--dt-text);
    border: none; background: none; padding: 0; cursor: default;
  }
  .lp-brand-mark {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--dt-accent); color: var(--dt-bg);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif; font-style: italic;
    font-weight: 600; font-size: 16px;
  }
  .lp-brand-sub {
    color: var(--dt-text-muted); font-family: 'Inter', sans-serif;
    font-size: 13px; font-weight: 400;
  }
  .lp-topbar-actions { display: flex; align-items: center; gap: 4px; }
  .lp-icon-btn {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 8px;
    border: none; background: none; color: var(--dt-text-muted);
    cursor: pointer; transition: background .15s, color .15s;
  }
  .lp-icon-btn:hover { background: var(--dt-surface); color: var(--dt-text); }

  /* ── Hero ── */
  .lp-hero {
    max-width: 680px; margin: 0 auto;
    padding: 72px 28px 0; text-align: center;
  }
  .lp-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 12px; font-weight: 500; letter-spacing: .04em;
    color: var(--dt-text-muted); margin-bottom: 24px;
    padding: 5px 14px; background: var(--dt-surface);
    border: 1px solid var(--dt-border); border-radius: 100px;
  }
  .lp-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--dt-accent); flex-shrink: 0;
  }
  .lp-hero-title {
    font-family: 'Fraunces', serif;
    font-size: clamp(40px, 6vw, 64px);
    font-weight: 500; line-height: 1.04;
    letter-spacing: -.028em; color: var(--dt-text);
    margin-bottom: 22px;
  }
  .lp-hero-title em {
    font-style: italic; font-weight: 400; color: var(--dt-accent);
  }
  .lp-hero-desc {
    font-size: 17px; line-height: 1.65; color: var(--dt-text-muted);
    max-width: 520px; margin: 0 auto 36px;
  }

  /* ── Orbital scene ── */
  .lp-orbit-wrap {
    display: flex; justify-content: center;
    padding: 8px 0 0; overflow: hidden;
  }
  .lp-orbit-scene {
    position: relative; width: 520px; height: 520px; flex-shrink: 0;
  }
  .lp-orbit-ring {
    position: absolute; top: 50%; left: 50%;
    border-radius: 50%; border: 1px dashed var(--dt-border);
    transform: translate(-50%,-50%); opacity: .55;
    animation: lp-spin linear infinite;
  }
  @keyframes lp-spin {
    from { transform: translate(-50%,-50%) rotate(0deg); }
    to   { transform: translate(-50%,-50%) rotate(360deg); }
  }
  @keyframes lp-spin-rev {
    from { transform: translate(-50%,-50%) rotate(0deg); }
    to   { transform: translate(-50%,-50%) rotate(-360deg); }
  }

  /* Center hub */
  .lp-orbit-center {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    z-index: 10; text-align: center; pointer-events: none;
  }
  .lp-orbit-logo {
    width: 88px; height: 88px; border-radius: 20px;
    background: var(--dt-accent); color: var(--dt-bg);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif; font-style: italic;
    font-weight: 600; font-size: 38px;
    margin: 0 auto 14px;
    box-shadow:
      0 0 0 1px rgba(180,58,43,.12),
      0 0 0 12px rgba(180,58,43,.06),
      0 0 0 24px rgba(180,58,43,.03),
      0 12px 32px rgba(180,58,43,.24);
  }
  .lp-orbit-name {
    font-family: 'Fraunces', serif; font-size: 22px;
    font-weight: 600; letter-spacing: -.015em; color: var(--dt-text);
  }
  .lp-orbit-sub {
    font-size: 12px; color: var(--dt-text-subtle); margin-top: 3px;
    font-family: 'Inter', sans-serif;
  }

  /* Orbit nodes */
  .lp-orbit-node {
    position: absolute; cursor: pointer;
  }
  .lp-orbit-node--soon { cursor: default; }
  .lp-orbit-node-inner {
    display: flex; flex-direction: column;
    align-items: center; gap: 5px;
    transition: transform .18s;
  }
  .lp-orbit-node:not(.lp-orbit-node--soon):hover .lp-orbit-node-inner {
    transform: scale(1.18);
  }
  .lp-orbit-node-pip {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif; font-style: italic;
    font-weight: 600; font-size: 20px;
    box-shadow: 0 2px 8px rgba(28,27,23,.1);
    transition: box-shadow .18s, transform .18s;
    border: 1.5px solid transparent;
  }
  .lp-orbit-node-pip--active {
    background: var(--dt-accent); color: #fff;
    border-color: rgba(180,58,43,.3);
  }
  .lp-orbit-node:not(.lp-orbit-node--soon):hover .lp-orbit-node-pip--active {
    box-shadow: 0 6px 20px rgba(180,58,43,.35);
  }
  [data-dt-dark="true"] .lp-orbit-node:not(.lp-orbit-node--soon):hover .lp-orbit-node-pip--active {
    box-shadow: 0 6px 20px rgba(232,93,74,.35);
  }
  .lp-orbit-node-pip--soon {
    background: var(--dt-surface); color: var(--dt-text-subtle);
    border-color: var(--dt-border);
  }
  .lp-orbit-tooltip {
    position: absolute; bottom: calc(100% + 10px); left: 50%;
    transform: translateX(-50%);
    background: var(--dt-text); color: var(--dt-bg);
    font-size: 11px; font-weight: 600; font-family: 'Inter', sans-serif;
    padding: 5px 10px; border-radius: 6px;
    white-space: nowrap; pointer-events: none; z-index: 30;
    letter-spacing: .01em;
  }
  .lp-orbit-tooltip--soon { background: var(--dt-surface-2); color: var(--dt-text-muted); }

  /* ── Products section ── */
  .lp-products-wrap {
    max-width: 960px; margin: 0 auto; padding: 40px 28px 96px;
  }
  .lp-products-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; padding-bottom: 16px;
    border-bottom: 1px solid var(--dt-border);
  }
  .lp-products-label {
    font-size: 11px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; color: var(--dt-text-subtle);
  }
  .lp-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
  }

  /* Product cards */
  .lp-card {
    display: flex; flex-direction: column; gap: 14px;
    padding: 24px; border: 1px solid var(--dt-border);
    border-radius: 14px; background: var(--dt-bg);
    transition: all .2s; position: relative; overflow: hidden;
    text-align: left;
  }
  .lp-card--available {
    cursor: pointer;
  }
  .lp-card--available:hover {
    border-color: var(--dt-accent);
    box-shadow: 0 0 0 4px var(--dt-accent-soft), 0 8px 24px rgba(28,27,23,.07);
    transform: translateY(-2px);
  }
  .lp-card--soon {
    opacity: .55; cursor: default;
  }
  .lp-card-head { display: flex; align-items: flex-start; justify-content: space-between; }
  .lp-card-logo {
    width: 44px; height: 44px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif; font-style: italic;
    font-weight: 600; font-size: 20px; flex-shrink: 0;
  }
  .lp-card-logo--active {
    background: var(--dt-accent); color: #fff;
  }
  .lp-card-logo--soon {
    background: var(--dt-surface-2); color: var(--dt-text-subtle);
  }
  .lp-card-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; letter-spacing: .03em;
    padding: 3px 10px; border-radius: 20px;
  }
  .lp-card-badge--available {
    background: var(--dt-accent-soft); color: var(--dt-accent);
    border: 1px solid var(--dt-accent-soft-2);
  }
  .lp-card-badge--soon {
    background: var(--dt-surface-2); color: var(--dt-text-subtle);
    border: 1px solid var(--dt-border);
  }
  .lp-card-badge-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: currentColor; flex-shrink: 0;
  }
  .lp-card-name {
    font-family: 'Fraunces', serif; font-size: 20px;
    font-weight: 600; letter-spacing: -.015em; color: var(--dt-text);
    line-height: 1.2;
  }
  .lp-card-tagline {
    font-size: 12.5px; color: var(--dt-text-muted);
    margin-top: 1px; font-style: italic;
  }
  .lp-card-desc {
    font-size: 13.5px; line-height: 1.55; color: var(--dt-text-muted);
  }
  .lp-card-tags {
    display: flex; flex-wrap: wrap; gap: 6px;
  }
  .lp-card-tag {
    font-size: 11px; font-family: 'JetBrains Mono', monospace;
    padding: 2px 8px; border-radius: 4px;
    background: var(--dt-surface-2); color: var(--dt-text-muted);
    border: 1px solid var(--dt-border);
  }
  .lp-card-meta {
    font-size: 12px; color: var(--dt-text-subtle);
    display: flex; align-items: center; gap: 6px;
  }
  .lp-card-cta {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--dt-accent); color: #fff;
    border: none; border-radius: 9px;
    padding: 10px 20px; font-family: 'Inter', sans-serif;
    font-size: 13px; font-weight: 600; cursor: pointer;
    transition: background .15s, transform .15s; width: fit-content;
    margin-top: 2px;
  }
  .lp-card-cta:hover { background: #a03325; transform: translateY(-1px); }
  [data-dt-dark="true"] .lp-card-cta:hover { background: #c94d3a; }

  /* ── Footer ── */
  .lp-footer {
    border-top: 1px solid var(--dt-border);
    padding: 28px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12.5px; color: var(--dt-text-subtle);
    max-width: 960px; margin: 0 auto;
  }
  .lp-footer-brand {
    display: flex; align-items: center; gap: 8px;
    font-family: 'Fraunces', serif; font-size: 14px;
    font-weight: 600; color: var(--dt-text-muted);
  }
  .lp-footer-mark {
    width: 22px; height: 22px; border-radius: 5px;
    background: var(--dt-accent); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif; font-style: italic;
    font-weight: 600; font-size: 11px;
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .lp-orbit-scene { width: min(380px, 92vw); height: min(380px, 92vw); }
    .lp-hero { padding-top: 48px; }
    .lp-products-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .lp-products-wrap { padding: 32px 18px 72px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .lp-orbit-ring, .lp-orbit-node { animation: none !important; }
  }
`;

// ─── Products ─────────────────────────────────────────────────────────────────
type Product = {
  id: string;
  path: string | null;
  name: string;
  tagline: string;
  desc: string;
  icon: string;
  logo?: string;
  status: "available" | "soon";
  sections: number;
  tags: string[];
};

const PRODUCTS: Product[] = [
  {
    id: "damatools",
    path: "/damatools",
    name: "DamaTools",
    tagline: "Plataforma financeira modular",
    desc: "Gestão de clientes, calculadoras financeiras, calendário de operações e relatórios regulatórios — desenvolvido para instituições financeiras.",
    icon: "D",
    logo: `${import.meta.env.BASE_URL}SimboloPreto-v3.svg`,
    status: "available",
    sections: 21,
    tags: ["TypeScript", "Next.js", "PostgreSQL"],
  },
  {
    id: "soon-2",
    path: null,
    name: "Em desenvolvimento",
    tagline: "Próximo produto",
    desc: "Um novo produto está sendo desenvolvido para o ecossistema Arphia. Em breve.",
    icon: "+",
    status: "soon",
    sections: 0,
    tags: [],
  },
  {
    id: "soon-3",
    path: null,
    name: "Em desenvolvimento",
    tagline: "Próximo produto",
    desc: "Mais ferramentas e plataformas chegarão ao ecossistema Arphia em breve.",
    icon: "+",
    status: "soon",
    sections: 0,
    tags: [],
  },
];

// ─── Orbital configuration ────────────────────────────────────────────────────
// scene: 520×520, center at 260
const SCENE_CENTER = 260;

type OrbitNode = {
  productId: string;
  r: number;
  dur: number;
  rev: boolean;
  angle: number; // initial angle in degrees
};

const ORBIT_NODES: OrbitNode[] = [
  { productId: "damatools", r: 115, dur: 32, rev: false, angle: -90 },
  { productId: "soon-2",    r: 196, dur: 54, rev: true,  angle: -20 },
  { productId: "soon-3",    r: 196, dur: 54, rev: true,  angle: 160 },
];

// Unique rings (deduplicated by r)
const RINGS = Array.from(
  new Map(ORBIT_NODES.map((n) => [n.r, { r: n.r, dur: n.dur, rev: n.rev }])).values()
);

// ─── Orbital hero component ───────────────────────────────────────────────────
function ProductOrbital({ onProductClick }: { onProductClick: (id: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const nodes = ORBIT_NODES.map((node) => {
    const rad = (node.angle * Math.PI) / 180;
    return {
      ...node,
      cx: SCENE_CENTER + node.r * Math.cos(rad),
      cy: SCENE_CENTER + node.r * Math.sin(rad),
      product: PRODUCTS.find((p) => p.id === node.productId)!,
    };
  });

  return (
    <div className="lp-orbit-wrap">
      <div className="lp-orbit-scene">
        {/* Rings */}
        {RINGS.map(({ r, dur, rev }) => (
          <div
            key={r}
            className="lp-orbit-ring"
            style={{
              width: r * 2,
              height: r * 2,
              animationName: rev ? "lp-spin-rev" : "lp-spin",
              animationDuration: `${dur}s`,
            }}
          />
        ))}

        {/* Center hub */}
        <div className="lp-orbit-center">
          <div className="lp-orbit-logo">A</div>
          <div className="lp-orbit-name">Arphia</div>
          <div className="lp-orbit-sub">Documentação</div>
        </div>

        {/* Orbiting product nodes */}
        {nodes.map(({ productId, r, dur, rev, cx, cy, product }) => {
          const animName = rev ? "lp-spin-rev" : "lp-spin";
          const counterAnim = rev ? "lp-spin" : "lp-spin-rev";
          const isActive = product.status === "available";
          return (
            <div
              key={productId}
              className={`lp-orbit-node${isActive ? "" : " lp-orbit-node--soon"}`}
              style={{
                left: cx,
                top: cy,
                transform: "translate(-50%,-50%)",
                animation: `${animName} ${dur}s linear infinite`,
                transformOrigin: `${SCENE_CENTER - cx}px ${SCENE_CENTER - cy}px`,
                zIndex: hovered === productId ? 20 : 5,
              }}
              onClick={() => isActive && onProductClick(productId)}
              onMouseEnter={() => setHovered(productId)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="lp-orbit-node-inner"
                style={{ animation: `${counterAnim} ${dur}s linear infinite` }}
              >
                {hovered === productId && (
                  <div className={`lp-orbit-tooltip${isActive ? "" : " lp-orbit-tooltip--soon"}`}>
                    {isActive ? product.name : "Em breve"}
                  </div>
                )}
                <div className={`lp-orbit-node-pip lp-orbit-node-pip--${isActive ? "active" : "soon"}`}>
                  {isActive && product.logo ? (
                    <img
                      src={product.logo}
                      alt={product.name}
                      style={{ width: 22, height: 22, filter: "invert(1)", display: "block" }}
                    />
                  ) : isActive ? (
                    product.icon
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={18} height={18}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onNavigate }: { product: Product; onNavigate: (path: string) => void }) {
  const isAvailable = product.status === "available";
  return (
    <div
      className={`lp-card lp-card--${isAvailable ? "available" : "soon"}`}
      onClick={() => isAvailable && product.path && onNavigate(product.path)}
      role={isAvailable ? "button" : undefined}
      tabIndex={isAvailable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isAvailable && product.path && (e.key === "Enter" || e.key === " ")) {
          onNavigate(product.path);
        }
      }}
    >
      <div className="lp-card-head">
        <div className={`lp-card-logo lp-card-logo--${isAvailable ? "active" : "soon"}`}>
          {isAvailable && product.logo ? (
            <img
              src={product.logo}
              alt={product.name}
              style={{ width: 26, height: 26, filter: "invert(1)", display: "block" }}
            />
          ) : isAvailable ? (
            product.icon
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20}>
              <rect width="18" height="11" x="3" y="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <span className={`lp-card-badge lp-card-badge--${isAvailable ? "available" : "soon"}`}>
          <span className="lp-card-badge-dot" />
          {isAvailable ? "Disponível" : "Em breve"}
        </span>
      </div>

      <div>
        <div className="lp-card-name">{product.name}</div>
        <div className="lp-card-tagline">{product.tagline}</div>
      </div>

      <div className="lp-card-desc">{product.desc}</div>

      {product.tags.length > 0 && (
        <div className="lp-card-tags">
          {product.tags.map((tag) => (
            <span key={tag} className="lp-card-tag">{tag}</span>
          ))}
        </div>
      )}

      {isAvailable && (
        <div className="lp-card-meta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={13} height={13}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          {product.sections} seções de documentação
        </div>
      )}

      {isAvailable && product.path && (
        <button
          className="lp-card-cta"
          onClick={(e) => { e.stopPropagation(); onNavigate(product.path!); }}
          tabIndex={-1}
        >
          Ver documentação
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Landing Page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  const handleProductClick = (productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (product?.path) navigate(product.path);
  };

  return (
    <>
      <style>{LP_CSS}</style>
      <div className="lp-root" data-dt-dark={String(dark)}>
        {/* Topbar */}
        <header className="lp-topbar">
          <div className="lp-brand">
            <span className="lp-brand-mark">A</span>
            Arphia
            <span className="lp-brand-sub">/ Docs</span>
          </div>
          <div className="lp-topbar-actions">
            <button
              className="lp-icon-btn"
              onClick={() => setDark((d) => !d)}
              aria-label="Alternar tema"
            >
              {dark ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} width={18} height={18}>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} width={18} height={18}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Hero */}
        <section>
          <div className="lp-hero">
            <div className="lp-eyebrow">
              <span className="lp-eyebrow-dot" />
              Portal de Documentação · Arphia
            </div>
            <h1 className="lp-hero-title">
              Toda a documentação
              {" "}
              <em>técnica</em>
              ,{" "}
              em um lugar.
            </h1>
            <p className="lp-hero-desc">
              Central de referência das plataformas e ferramentas desenvolvidas pela Arphia.
              Explore processos, arquitetura e operação de cada produto do ecossistema.
            </p>
          </div>

          <ProductOrbital onProductClick={handleProductClick} />
        </section>

        {/* Products grid */}
        <div className="lp-products-wrap">
          <div className="lp-products-header">
            <span className="lp-products-label">Plataformas</span>
            <span style={{ fontSize: 12, color: "var(--dt-text-subtle)" }}>
              {PRODUCTS.filter((p) => p.status === "available").length} disponível · {PRODUCTS.filter((p) => p.status === "soon").length} em desenvolvimento
            </span>
          </div>
          <div className="lp-products-grid">
            {PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={(path) => navigate(path)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid var(--dt-border)", padding: "28px 28px" }}>
          <div className="lp-footer" style={{ borderTop: "none", padding: 0 }}>
            <div className="lp-footer-brand">
              <span className="lp-footer-mark">A</span>
              Arphia Docs
            </div>
            <span>Documentação interna · {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </>
  );
}
