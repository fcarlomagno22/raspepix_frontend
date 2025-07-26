import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#9ffe00", // Updated to #9ffe00
          foreground: "#191F26",
        },
        secondary: {
          DEFAULT: "#1a323a",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "dark-bg-start": "#0D1117",
        "dark-bg-end": "#121820",
        "admin-input-bg": "#121820", // Same as dark-bg-end for input backgrounds
      },
      borderRadius: {
        DEFAULT: '1rem', // Adicionando um border-radius padrão
        lg: '1.5rem',    // Aumentando o border-radius grande
        md: '1rem',      // Aumentando o border-radius médio
        sm: '0.75rem',   // Aumentando o border-radius pequeno
        xl: '2rem',      // Adicionando um border-radius extra grande
        '2xl': '3rem',   // Adicionando um border-radius 2x grande
      },
      boxShadow: {
        "glow-sm": "0 0 8px rgba(159, 254, 0, 0.4)",
        glow: "0 0 15px rgba(159, 254, 0, 0.6)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0px)" },
        },
        "pulse-glow-golden": {
          "0%": { filter: "drop-shadow(0 0 5px rgba(255, 215, 0, 0.2))" },
          "50%": { filter: "drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))" },
          "100%": { filter: "drop-shadow(0 0 5px rgba(255, 215, 0, 0.2))" },
        },
        "pulse-border": {
          "0%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.01)" },
          "100%": { opacity: "0.5", transform: "scale(1)" },
        },
        "text-glow-yellow": {
          "0%, 100%": {
            "text-shadow": "0 0 5px rgba(255, 255, 0, 0.4), 0 0 10px rgba(255, 255, 0, 0.2)",
          },
          "50%": {
            "text-shadow": "0 0 15px rgba(255, 255, 0, 0.8), 0 0 25px rgba(255, 255, 0, 0.6)",
          },
        },
        "text-glow-primary": {
          // Novo keyframe para brilho na cor primary
          "0%, 100%": {
            "text-shadow": "0 0 5px rgba(159, 254, 0, 0.4), 0 0 10px rgba(159, 254, 0, 0.2)",
          },
          "50%": {
            "text-shadow": "0 0 15px rgba(159, 254, 0, 0.8), 0 0 25px rgba(159, 254, 0, 0.6)",
          },
        },
        "coin-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "coin-rotate-y": {
          "0%, 100%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(180deg)" },
        },
        "money-fall": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(100px) scale(0.5)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        blob: "blob 7s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045)",
        float: "float 3s ease-in-out infinite",
        "pulse-glow-golden": "pulse-glow-golden 2s infinite ease-in-out",
        "pulse-border": "pulse-border 2s infinite ease-in-out",
        "text-glow-yellow": "text-glow-yellow 2s infinite ease-in-out",
        "text-glow-primary": "text-glow-primary 2s infinite ease-in-out", // Nova animação
        "coin-float": "coin-float 4s ease-in-out infinite",
        "coin-rotate-y": "coin-rotate-y 8s linear infinite",
        "money-fall": "money-fall 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
