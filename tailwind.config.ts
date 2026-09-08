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
        ink: "#12151C",
        paper: {
          DEFAULT: "#F5F3EE",
          raised: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#C8102E",
          hover: "#9C0B23",
          dim: "#FBE2E4",
        },
        slate: "#5B6472",
        line: "#DFDBD3",
        success: "#1F9D66",
        amber: "#B4690E",
        error: "#8C2F1B",
      },
      fontFamily: {
        display: ["var(--font-inter-tight)", "Inter", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "2px",
        none: "0px",
      },
      boxShadow: {
        none: "none",
      },
      spacing: {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "32px",
        "xl": "64px",
        "2xl": "96px",
      },
    },
  },
  plugins: [],
};

export default config;
