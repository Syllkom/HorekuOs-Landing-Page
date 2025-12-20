'use client';

import Image from 'next/image';
import { Sparkles, Settings, Monitor, CalendarCog } from 'lucide-react';
import GridBackground from './GridBackground';
import FeatureCard from './FeatureCard';
import { useState, useEffect, useRef } from 'react';

export default function CharacteristicsSection() {
  const [isLabel1Pressed, setIsLabel1Pressed] = useState(false);
  const [isLabel2Pressed, setIsLabel2Pressed] = useState(false);
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


  const handleLabel1Click = () => {
    setIsLabel1Pressed(true);
    setTimeout(() => {
      setIsLabel1Pressed(false);
    }, 200);
  };

  const handleLabel2Click = () => {
    setIsLabel2Pressed(true);
    setTimeout(() => {
      setIsLabel2Pressed(false);
    }, 200);
  };

  const handleCardClick = (index) => {
    setActiveCard(activeCard === index ? null : index);
  };

  const features = [
    {
      icon: Sparkles,
      title: 'IA',
      description: 'Inteligencia propia y una personalidad definida',
      position: 'tl'
    },
    {
      icon: Settings,
      title: 'Optimización',
      description: 'Arquitectura para evitar problemas spam en la plataforma',
      position: 'tr'
    },
    {
      icon: Monitor,
      title: 'Multidispositivo',
      description: 'Funciona en múltiples dispositivos',
      position: 'bl'
    },
    {
      icon: CalendarCog,
      title: 'Actualización',
      description: 'Updates constante para mejorar rendimiento',
      position: 'br'
    }
  ];

  return (
    <section ref={sectionRef} id="características" className="relative w-full bg-black py-12 md:py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <GridBackground 
          gridSize="60px"
          spotlights={[
            { position: '70% 50%', size: '40%' },
            { position: '30% 30%', size: '25%' }
          ]}
          opacity={0.15}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative flex items-center justify-center">
            <div 
              className="absolute top-8 left-0 glass-effect rounded-2xl px-6 py-3 flex items-center gap-2 floating-label"
              onClick={handleLabel1Click}
              style={{
                transform: isLabel1Pressed ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M19 12H5M5 12L12 5M5 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-white font-medium">AI integrator</span>
            </div>

            <div className="relative w-80 h-80 lg:w-96 lg:h-96">
              <Image
                src="/images/logo.png"
                alt="HorekuOs 3D Logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div 
              className="absolute bottom-8 right-0 glass-effect rounded-2xl px-6 py-3 flex items-center gap-2 floating-label-delayed"
              onClick={handleLabel2Click}
              style={{
                transform: isLabel2Pressed ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <span className="text-white font-medium">HorekuOs</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-12">
              Características
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  position={feature.position}
                  isActive={activeCard === index}
                  onClick={() => handleCardClick(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}