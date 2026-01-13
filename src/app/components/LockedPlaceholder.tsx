"use client";

interface LockedPlaceholderProps {
  stepName: string;
  description: string;
}

export default function LockedPlaceholder({ stepName, description }: LockedPlaceholderProps) {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px",
        background: "var(--bg-dim)",
        border: "1px solid var(--border-dim)",
        borderRadius: "4px",
        textAlign: "center",
        opacity: 0.5,
      }}
    >
      <div style={{
        fontSize: "48px",
        marginBottom: "20px",
        opacity: 0.3,
      }}>
        🔒
      </div>
      <h3 style={{
        fontSize: "24px",
        fontWeight: 600,
        marginBottom: "12px",
        color: "var(--text-dim)",
      }}>
        {stepName}
      </h3>
      <p style={{
        fontSize: "14px",
        color: "var(--text-dim)",
      }}>
        {description}
      </p>
    </div>
  );
}

