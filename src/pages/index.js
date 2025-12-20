import Head from 'next/head';
import HeroSection from '@/components/HeroSection';
import CharacteristicsSection from '@/components/CharacteristicsSection';
import FunctionsSection from '@/components/FunctionsSection';
import PricingSection from '@/components/PricingSection';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>HorekuOs - Bot de WhatsApp</title>
      </Head>
      <HeroSection />
      <CharacteristicsSection />
      <FunctionsSection />
      <PricingSection />
      <FaqSection />
      <Footer />
    </>
  );
}