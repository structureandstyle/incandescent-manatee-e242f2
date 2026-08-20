export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [{ pattern: /.*/ }],
  theme: { extend: {} },
  plugins: [],
};