"use client";

import IntegrationProofDrawer from "./IntegrationProofDrawer";

export default function TopBar() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: "60px",
      background: "var(--background)",
      borderBottom: "1px solid var(--border-dim)",
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
    }}>
      <div style={{
        fontSize: "14px",
        fontWeight: 600,
        color: "var(--foreground)",
      }}>
        VERBA AI — PSLang Judge
      </div>
      
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <a
          href="/integrations"
          style={{
            fontSize: "12px",
            color: "var(--text-dim)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Integrations
        </a>
        <IntegrationProofDrawer />
      </div>
    </div>
  );
}

