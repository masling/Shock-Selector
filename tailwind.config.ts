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
        ink: "#182c26",
        steel: "#4c6058",
        mist: "#edf3ef",
        sand: "#f7f9f8",
        line: "#d7e1dc",
        accent: {
          DEFAULT: "#176b4a",
          dark: "#104d37",
          soft: "#e0f0e7",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Avenir Next", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "Avenir Next Condensed", "sans-serif"],
      },
      boxShadow: {
        panel: "0 2px 8px rgba(17, 25, 27, 0.10)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(81,97,106,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(81,97,106,0.15) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
