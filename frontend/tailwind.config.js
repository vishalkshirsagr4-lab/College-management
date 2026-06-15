/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          500: "#106EBE", // Your primary Blue
          600: "#0d599a",
          700: "#0a4374",
          // --- NEW ADDITIONS ---
          'light': "#E9F1FA",  // Your Light Blue (Perfect for subtle panel backgrounds)
          'bright': "#00ABE4", // Your Bright Blue (Great for clear call-to-actions/tabs)
        },

        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#0FFCBE", // Your exact Mint
          600: "#0bdba5",
        },

        // Mapped White explicitly here, alongside your custom light colors
        surface: {
          DEFAULT: "#ffffff", // Your plain White
          light: "#ffffff",
        },
        background: {
          DEFAULT: "#f8fafc",
          alt: "#E9F1FA",     // Utilizing your Light Blue as an alternate background option
        },

        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },

      borderRadius: {
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
      },

      boxShadow: {
        card: "0 10px 25px rgba(15,23,42,.08)",
        hover: "0 20px 40px rgba(15,23,42,.12)",
        glow: "0 0 25px rgba(16,110,190,.15)",
      },
    },
  },
  plugins: [],
};