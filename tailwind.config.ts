import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 8px spacing system - all spacing in multiples of 8
      spacing: {
        "0": "0",
        "1": "8px",
        "2": "16px",
        "3": "24px",
        "4": "32px",
        "5": "40px",
        "6": "48px",
        "8": "64px",
        "10": "80px",
        "12": "96px",
        "16": "128px",
        "20": "160px",
        "24": "192px",
      },
      // Glass utilities
      backdropBlur: {
        glass: "20px",
      },
      backgroundColor: {
        glass: "rgba(255, 255, 255, 0.05)",
        "glass-hover": "rgba(255, 255, 255, 0.08)",
      },
      borderColor: {
        glass: "rgba(255, 255, 255, 0.1)",
        "glass-hover": "rgba(255, 255, 255, 0.2)",
      },
      // Glow utilities
      boxShadow: {
        glow: "0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)",
        "glow-accent": "0 0 15px rgba(236, 72, 153, 0.3)",
        "glow-strong": "0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)",
      },
      // Gradient utilities
      backgroundImage: {
        "aurora-purple": "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(236, 72, 153, 0.12) 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
      },
      // Animation
      animation: {
        "aurora": "aurora 20s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        aurora: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -30px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      // Typography
      fontFamily: {
        hero: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      fontSize: {
        xs: ["10px", { lineHeight: "1.4" }],
        sm: ["11px", { lineHeight: "1.4" }],
        base: ["13px", { lineHeight: "1.6" }],
        lg: ["14px", { lineHeight: "1.6" }],
        xl: ["16px", { lineHeight: "1.6" }],
        "2xl": ["20px", { lineHeight: "1.4" }],
        "3xl": ["28px", { lineHeight: "1.3" }],
        "4xl": ["36px", { lineHeight: "1.2" }],
        hero: ["56px", { lineHeight: "1.1" }],
      },
    },
  },
  plugins: [],
};

export default config;

