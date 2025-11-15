/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#764ba2",
        danger: "#ef4444",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(90deg, #2563eb, #7c3aed)",
        "gradient-dark": "linear-gradient(180deg, #111827, #1f2937)",
      },
    },
  },
};
