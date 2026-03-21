import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // SHEIN-like primary brand colors (Black/White with strong Sale Red)
        black: "#222222",
        brandRed: "#f21c43", 
        brandPink: "#ff507a",
        'primary-light': '#ffffff',
        'surface-light': '#faf9f6',
        'text-light': '#222222',
        'text-muted': '#6b7280',
        'accent': '#f21c43',
      },
      fontFamily: {
        // SHEIN uses standard, clean, highly readable e-commerce sans-serif fonts
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
