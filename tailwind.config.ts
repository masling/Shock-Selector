import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#11191b",
        steel: "#51616a",
        mist: "#eef1ea",
        sand: "#f5f3eb",
        line: "#d4dacd",
        accent: {
          DEFAULT: "#1d8f62",
          dark: "#116345",
          soft: "#dcefe6",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Avenir Next", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "Avenir Next Condensed", "sans-serif"],
      },
      boxShadow: {
        panel: "0 24px 60px rgba(17, 25, 27, 0.14)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(81,97,106,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(81,97,106,0.15) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
