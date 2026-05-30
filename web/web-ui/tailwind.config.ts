import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        md: "900px",
        lg: "1100px",
      },
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          light: "var(--brand-light)",
          muted: "var(--brand-muted)",
        },
        background: "var(--background)",
        surface: "var(--surface)",
        foreground: "var(--foreground)",
        muted: "var(--muted-foreground)",
        subtle: "var(--subtle-foreground)",
        border: "var(--border)",
        destructive: "var(--destructive)",
        success: "var(--success)",
        info: "var(--info)",
      },
      borderRadius: {
        card: "var(--radius-card)",
      },
      boxShadow: {
        brand: "var(--shadow-brand)",
      },
      fontFamily: {
        sans: ["var(--font-noto)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-prompt)",
          "var(--font-noto)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
