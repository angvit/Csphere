// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // if using app directory
    "./pages/**/*.{js,ts,jsx,tsx}", // if using pages directory
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        ptserif: "var(--font-pt-serif)",
        custom: "var(--font-custom)",
      },
      colors: {
        "custom-teal": "#202A29",
      },
    },
  },
  plugins: [],
};
