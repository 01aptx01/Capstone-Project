// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'md': '900px',    // เปลี่ยนจาก 768px เป็น 900px (Desktop จะเริ่มโชว์ที่ 900px)
        'lg': '1100px',   // ปรับค่าอื่นๆ ได้ตามต้องการ
      },
      colors: {
        primary: {
          DEFAULT: "#FF6B00",
          light: "#FF8C33",
          dark: "#CC5500",
          primary: "#FF8235",     // Orange header
          accent: "#F97316",      // Orange accent
          bg: "#FFF3E8",          // Light orange bg
          gray: "rgba(71,71,71,0.62)",
          grayDark: "rgba(71,71,71,0.7)",
          white: "#FFFFFF"
        },
      },
    },
  },
  plugins: [],
}

export default config