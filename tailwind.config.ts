import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        diasmath: {
          blue: "#1D4ED8",
          green: "#16A34A",
          yellow: "#FACC15",
          dark: "#0F172A",
          soft: "#F8FAFC"
        }
      }
    }
  },
  plugins: []
};

export default config;
