import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        slateSoft: "#f4f4f8"
      }
    }
  },
  plugins: []
};

export default config;
