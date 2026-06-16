/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        // Primary Brand Colors (Professional Indigo)
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3",
          800: "#312e81",
          900: "#1e1b4b",

          light: "#f5f7ff",
          bright: "#6366f1",
        },

        // Accent Colors (Emerald)
        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },

        // Surface Colors
        surface: {
          DEFAULT: "#ffffff",
          light: "#f8fafc",
          muted: "#f1f5f9",
        },

        // Background Colors
        background: {
          DEFAULT: "#9540bd",
          alt: "#f1f5f9",
          dark: "#e2e8f0",
        },

        // Text Colors
        text: {
          primary: "#0f172a",
          secondary: "#475569",
          muted: "#94a3b8",
          light: "#ffffff",
        },

        // Border Colors
        border: {
          DEFAULT: "#e2e8f0",
          light: "#f1f5f9",
          dark: "#cbd5e1",
        },

        // Status Colors
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#3b82f6",
      },

      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
      },

      boxShadow: {
        card: "0 4px 12px rgba(15, 23, 42, 0.08)",
        hover: "0 12px 24px rgba(15, 23, 42, 0.12)",
        glow: "0 0 20px rgba(79, 70, 229, 0.15)",
        soft: "0 2px 8px rgba(15, 23, 42, 0.06)",
      },

      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },

      transitionDuration: {
        400: "400ms",
      },

      animation: {
        float: "float 3s ease-in-out infinite",
      },

      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-6px)",
          },
        },
      },
    },
  },

  plugins: [],
};