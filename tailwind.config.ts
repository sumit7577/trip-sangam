import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Token names kept stable — values are ultra-luxury / no red.
        // "crimson" is now muted loden green (the accent that replaces red)
        crimson: {
          DEFAULT: "#2C3D2E",
          50: "#F2F4F2",
          100: "#E2E7E2",
          500: "#2C3D2E",
          600: "#1F2B20",
          700: "#152018",
        },
        // "coral" is now warm putty / camel
        coral: {
          DEFAULT: "#9B8868",
          400: "#B0A186",
          500: "#9B8868",
          600: "#7E6D52",
        },
        // "magenta" is now near-black espresso (was used in gradient ends)
        magenta: {
          DEFAULT: "#1C1C1A",
          500: "#1C1C1A",
        },
        // Deep midnight navy — restrained, no royal blue energy
        mountain: {
          DEFAULT: "#1C2E3D",
          50: "#EEF1F4",
          500: "#1C2E3D",
          700: "#121E2A",
        },
        // Champagne brass — quiet gold leaf, no neon
        gold: {
          DEFAULT: "#C9A876",
          500: "#C9A876",
          600: "#A78858",
        },
        // Muted forest — for natural accents
        jade: {
          DEFAULT: "#3B5C4B",
          500: "#3B5C4B",
        },
        // Bone / oat — calmer than ivory
        sand: "#F2EEE6",
        // Espresso ink — primary text + primary buttons
        ink: "#1C1C1A",
        muted: "#7A7268",
        line: "#E2DBCB",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        // Restrained, monochrome — luxury = quiet, not glowing
        soft: "0 4px 24px -8px rgba(28, 28, 26, 0.06), 0 2px 6px -2px rgba(28, 28, 26, 0.04)",
        lift: "0 24px 56px -20px rgba(28, 28, 26, 0.16), 0 10px 22px -10px rgba(28, 28, 26, 0.08)",
        glow: "0 0 0 1px rgba(28, 28, 26, 0.08), 0 12px 32px -8px rgba(28, 28, 26, 0.18)",
        sunset: "0 28px 64px -22px rgba(28, 28, 26, 0.18), 0 10px 24px -10px rgba(155, 136, 104, 0.18)",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "ken-burns": "kenBurns 20s ease-in-out infinite alternate",
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        kenBurns: {
          "0%": { transform: "scale(1) translate(0,0)" },
          "100%": { transform: "scale(1.12) translate(-2%, -1%)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
