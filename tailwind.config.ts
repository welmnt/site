import type { Config } from "tailwindcss";

// Welmnt brand — recovered from the 2024 landing-website build + TECHNICAL_BRANDING.md.
// Every colour is a CSS variable so the dark scheme swaps tokens, not class names.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "var(--ground)",
        surface: "var(--surface)",
        band: "var(--band)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-faint": "var(--ink-faint)",
        ember: "var(--ember)",
        "ember-ink": "var(--ember-ink)",
        plum: "var(--plum)",
        amber: "var(--amber)",
        line: "var(--line)",
        "line-soft": "var(--line-soft)",
        // the five assessment constructs — also the structural scale
        k1: "var(--k1)", k2: "var(--k2)", k3: "var(--k3)", k4: "var(--k4)", k5: "var(--k5)",
      },
      fontFamily: {
        ui: ["Readex Pro", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Literata", "ui-serif", "Georgia", "serif"],
      },
      maxWidth: { measure: "1180px" },
      boxShadow: {
        card: "0 1px 2px rgba(34,28,46,.05), 0 22px 50px -30px rgba(34,28,46,.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
