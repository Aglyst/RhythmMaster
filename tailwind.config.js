/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "border-440blue",
    "border-800yellow",
    "border-1200red",

    "bg-440blue",
    "bg-800yellow",
    "bg-1200red",

    "shadow-440blueA",
    "shadow-800yellowA",
    "shadow-1200redA"
  ],
  theme: {
    extend: {
      colors : {
        "440blue" : "#0059ff",
        "440blueA" : "#0059ff41",
        "800yellow" : "#ffd900",
        "800yellowA" : "#ffd90050",
        "1200red" : "#ff0040",
        "1200redA" : "#ff004050",
      }
    },
  },
  plugins: [],
}

