import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "sans-serif"],
        space: ["var(--font-space)", "monospace"],
      },
      colors: {
        "sapphire-night": "var(--bg-primary)",
        "bg-deep": "var(--bg-deep)",
        "bg-surface": "var(--bg-surface)",
        opal: "var(--accent)",
        "opal-dim": "var(--accent-dim)",
        "opal-glow": "var(--accent-glow)",
        "text-primary": "var(--text-primary)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
        overlay: "var(--overlay)",
      },
    },
  },
  plugins: [],
};
export default config;
