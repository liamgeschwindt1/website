import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        teal: "var(--teal)",
        gold: "var(--gold)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-lora)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
