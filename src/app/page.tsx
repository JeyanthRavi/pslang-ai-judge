"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function handleJudge() {
    if (!input.trim()) {
      setResult("Please provide an input to judge.");
      return;
    }

    // Temporary mock AI judge logic
    setResult(`Judgment received for: "${input}"`);
  }

  return (
    <main style={{ padding: "40px", fontSize: "20px", maxWidth: "800px" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
        VERBA AI — PSLang Judge
      </h1>

      <p style={{ marginBottom: "30px" }}>
        Voice → PSLang → AI Judge → Simulated Wallet
      </p>

      <textarea
        placeholder="Enter statement / testimony here"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: "100%",
          height: "120px",
          padding: "12px",
          fontSize: "16px",
          marginBottom: "20px",
        }}
      />

      <button
        onClick={handleJudge}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Submit for Judgment
      </button>

      {result && (
        <div style={{ marginTop: "30px", fontWeight: "bold" }}>
          {result}
        </div>
      )}
    </main>
  );
}

