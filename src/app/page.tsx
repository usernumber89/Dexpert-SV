import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Guide } from "@/components/landing/Guide";
import { Aboutus } from "@/components/landing/Aboutus";
import  Plans  from "@/components/landing/Plans";
import { Testimony } from "@/components/landing/Testimony";
import { Faq } from "@/components/landing/Faq";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";
import ActiveProjectsHub from "@/components/shared/ActiveProjectsHub";
import { MilestonesShowcase } from "@/components/landing/MilestonesShowcase";
import { StudentFeatures } from "@/components/landing/StudentFeatures";
import { PymePremiumFeatures } from "@/components/landing/PymePremiumFeatures";
import {outfit} from "@/lib/fonts"
export default function Home() {
  return (
    <div className={`${outfit.className} min-h-screen bg-white`}>
      <Navbar />
      <Hero />
      <Aboutus />
      <Guide />
      
      <MilestonesShowcase/>
      
      <StudentFeatures />

   

      <Plans />
      <Testimony />
      <Faq />
      <CallToAction />
      <Footer />
    </div>
  );
}