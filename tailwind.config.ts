import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          light:  "#D6EEFF",
          mid:    "#38A3F1",
          border: "#BAD8F7",
          title:  "#0D5FA6",
          navy:   "#0D3A6E",
        },
        surface: {
          base:   "#FFFFFF",
          raised: "#F0F7FF",
          muted:  "#E8F3FD",
        },
        ink: {
          primary:   "#0D3A6E",
          secondary: "#5B8DB8",
          muted:     "#93B8D4",
        },
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};

export default config;