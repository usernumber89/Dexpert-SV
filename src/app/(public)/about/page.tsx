import type { Metadata } from "next";
import { AboutHero } from "./AboutHero";
import { AboutMission } from "./AboutMission";
import { AboutStory } from "./AboutStory";
import { AboutStats } from "./AboutStats";
import { AboutTeam } from "./AboutTeam";
import { AboutCTA } from "./AboutCTA";
import { Footer } from "@/components/landing/Footer";
import {Navbar} from "@/components/landing/NavbarAbout";

export const metadata: Metadata = {
  title: "Acerca de",
  description: "Conocé quiénes somos, nuestra misión, visión y cómo estamos transformando el talento joven en El Salvador.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <AboutHero />
      <AboutMission />
     
      <AboutStory />
      <AboutTeam />
      <AboutCTA />
      <Footer />
    </div>
  );
}
