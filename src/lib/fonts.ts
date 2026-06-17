// lib/fonts.ts
import { Baumans } from "next/font/google";
import { Signika } from "next/font/google";
import { Outfit } from "next/font/google";

export const baumans = Baumans({
  subsets: ["latin"],
  weight: "400",
});

export const signika = Signika({
    subsets: ["latin"],
    weight: "400",
})

export const outfit = Outfit({
    subsets: ["latin"],
    weight: "400",
})