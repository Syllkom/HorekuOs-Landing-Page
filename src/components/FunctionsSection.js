'use client';

import Image from 'next/image';
import { ShieldCheck, Download, Gamepad2, Sparkles } from 'lucide-react';
import GridBackground from './GridBackground';
import FeatureCard from './FeatureCard';
import { useState, useEffect, useRef } from 'react';

export default function FunctionsSection() {
  const [activeCard, setActiveCard] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sectionRef.current && !sectionRef.current.contains(event.target)) {
        setActiveCard(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCardClick = (index) => {
    setActiveCard(activeCard === index ? null : index);
  };
  const functions = [
    {
      icon: ShieldCheck,
      title: 'Administración',
      description: 'Administra grupos con solo llamar @HorekuOs',
      position: 'tl'
    },
    {
      icon: Download,
      title: 'Descargas',
      description: 'Descarga videos llamando a @HorekuOs en el chat',
      position: 'tr'
    },
    {
      icon: Gamepad2,
      title: 'Juegos',
      description: 'Disfruta de diversos juegos',
      position: 'bl'
    },
    {
      icon: Sparkles,
      title: 'IA',
      description: 'Integrado con gemini para respuestas rápidas',
      position: 'br'
    }
  ];

  return (
    <section ref={sectionRef} id="funciones" className="relative w-full bg-black py-12 md:py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <GridBackground 
          gridSize="60px"
          spotlights={[
            { position: '25% 50%', size: '35%' },
            { position: '15% 25%', size: '25%' }
          ]}
          opacity={0.15}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-12">
              Funciones
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {functions.map((func, index) => (
                <FeatureCard
                  key={index}
                  icon={func.icon}
                  title={func.title}
                  description={func.description}
                  position={func.position}
                  isActive={activeCard === index}
                  onClick={() => handleCardClick(index)}
                />
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-sm lg:max-w-md">
              <Image
                src="/images/chat.png"
                alt="WhatsApp Chat Mockup"
                width={600}
                height={800}
                className="w-full h-auto rounded-3xl shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}