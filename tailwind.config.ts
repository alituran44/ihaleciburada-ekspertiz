import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0F223D",
          deep: "#0B1E3B",
          darker: "#07111F",
          blue: "#0052FF",
          sky: "#0084B4",
          lightSky: "#E0F2FE",
          orange: "#FF5938",
          orangeHover: "#E04828",
        },
        surface: {
          bg: "#F4F6F9",
          card: "#FFFFFF",
          border: "#E2E8F0",
          darkBg: "#0B0F19",
          darkCard: "#111827",
          darkBorder: "#334155",
        }
      },
      fontFamily: {
        heading: ["Outfit", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 48, 87, 0.12), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'premium-hover': '0 20px 40px -15px rgba(0, 48, 87, 0.22), 0 0 0 1px rgba(0, 82, 255, 0.25)',
      }
    },
  },
  plugins: [],
};

export default config;
