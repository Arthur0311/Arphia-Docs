import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface Props {
  onSuccess: () => void;
}

export default function LoginModal({ onSuccess }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError("E-mail ou senha incorretos.");
      return;
    }
    onSuccess();
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 14px",
    background: "var(--dt-surface)",
    border: "1px solid var(--dt-border)",
    borderRadius: 10,
    outline: "none",
    fontSize: 14,
    color: "var(--dt-text)",
    fontFamily: "inherit",
    transition: "border-color .15s, box-shadow .15s",
  };

  return (
    <>
      <style>{`
        @keyframes dt-modal-in {
          from { opacity: 0; transform: scale(.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)  translateY(0); }
        }
        @keyframes dt-spin {
          to { transform: rotate(360deg); }
        }
        .dt-login-card { animation: dt-modal-in .24s cubic-bezier(.16,1,.3,1) both; }
        .dt-login-input:focus {
          border-color: var(--dt-accent) !important;
          box-shadow: 0 0 0 3px var(--dt-accent-soft) !important;
        }
        .dt-login-submit:hover:not(:disabled) { background: #a03325 !important; }
        .dt-login-eye:hover { color: var(--dt-text) !important; }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(18,17,14,.65)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
          opacity: visible ? 1 : 0,
          transition: "opacity .2s",
        }}
      >
        {/* Card */}
        <div
          className="dt-login-card"
          style={{
            background: "var(--dt-bg)",
            border: "1px solid var(--dt-border)",
            borderRadius: 20,
            boxShadow: "0 32px 80px rgba(0,0,0,.28), 0 8px 24px rgba(0,0,0,.14)",
            padding: "48px 44px 40px",
            width: "100%",
            maxWidth: 420,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: "var(--dt-accent)", color: "var(--dt-bg)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Fraunces', serif", fontStyle: "italic",
              fontWeight: 600, fontSize: 28, marginBottom: 22,
              boxShadow: "0 0 0 1px rgba(180,58,43,.15), 0 8px 28px rgba(180,58,43,.28)",
            }}>A</div>
            <h2 style={{
              fontFamily: "'Fraunces', serif", fontSize: 24,
              fontWeight: 500, letterSpacing: "-.015em",
              color: "var(--dt-text)", margin: "0 0 6px",
            }}>
              Acesso à Documentação
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--dt-text-muted)", margin: 0 }}>
              Arphia · DamaTools
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Email */}
            <div>
              <label style={{
                display: "block", fontSize: 12.5, fontWeight: 600,
                color: "var(--dt-text-muted)", marginBottom: 8, letterSpacing: ".02em",
              }}>
                E-mail
              </label>
              <input
                className="dt-login-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoFocus
                style={inputBase}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: "block", fontSize: 12.5, fontWeight: 600,
                color: "var(--dt-text-muted)", marginBottom: 8, letterSpacing: ".02em",
              }}>
                Senha
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="dt-login-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ ...inputBase, paddingRight: 44 }}
                />
                <button
                  type="button"
                  className="dt-login-eye"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--dt-text-subtle)", padding: 4,
                    display: "flex", alignItems: "center",
                    transition: "color .15s",
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                padding: "10px 14px",
                background: "var(--dt-accent-soft)",
                border: "1px solid var(--dt-accent-soft-2)",
                borderRadius: 8, fontSize: 13,
                color: "var(--dt-accent)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14} style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="dt-login-submit"
              disabled={loading}
              style={{
                marginTop: 2,
                padding: "13px",
                background: loading ? "var(--dt-border-strong)" : "var(--dt-accent)",
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background .15s",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
              }}
            >
              {loading ? (
                <>
                  <svg
                    style={{ animation: "dt-spin .8s linear infinite" }}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth={2.5} width={15} height={15}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
                  </svg>
                  Entrando…
                </>
              ) : "Entrar"}
            </button>
          </form>

          {/* Footer */}
          <p style={{
            textAlign: "center", fontSize: 12,
            color: "var(--dt-text-subtle)", margin: "28px 0 0",
          }}>
            Acesso restrito · Arphia
          </p>
        </div>
      </div>
    </>
  );
}
