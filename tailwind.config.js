/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#ff69b4", // Your primary color
          secondary: "#f000b8",
          accent: "#1dcdbc",
          neutral: "#2b3440",
          "base-100": "#ffffff",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#ff69b4", // Your primary color
          secondary: "#f000b8",
          accent: "#1dcdbc",
          neutral: "#2b3440",
          "base-100": "#1f2937",
        },
      },
    ],
  },
}

