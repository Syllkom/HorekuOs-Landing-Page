'use client';

import Image from 'next/image';
import GridBackground from './GridBackground';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Footer() {
  const [bubbles, setBubbles] = useState([]);
  const [openSection, setOpenSection] = useState(null);

  const handleSmoothScroll = (sectionId, event) => {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  const createBubble = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBubble = {
      id: Date.now(),
      x,
      y,
    };

    setBubbles(prev => [...prev, newBubble]);

    setTimeout(() => {
      setBubbles(prev => prev.filter(bubble => bubble.id !== newBubble.id));
    }, 1000);
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="w-full bg-black text-white">
      {/* Contact Section */}
      <div className="relative text-center px-4 overflow-hidden min-h-[800px] flex flex-col justify-center items-center">
        <div className="absolute inset-0 flex justify-center items-start pt-24 md:pt-10 pointer-events-none">
          <Image 
            src="/images/light.png" 
            alt="Spotlight" 
            width={711} 
            height={726} 
            className="opacity-70" 
          />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold tracking-wider mb-4">PONGÁMONOS</h2>
          <h2 className="text-4xl font-bold tracking-wider mb-8">EN CONTACTO</h2>
          <button 
            onClick={createBubble}
            className="relative bg-white text-black font-bold py-3 px-10 rounded-full text-lg transition-all duration-300 shadow-[0_0_15px_4px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_8px_rgba(255,255,255,0.6)] overflow-hidden"
          >
            Reservar
            {bubbles.map(bubble => (
              <span
                key={bubble.id}
                className="bubble-effect"
                style={{
                  left: bubble.x,
                  top: bubble.y,
                }}
              />
            ))}
          </button>
        </div>
      </div>

      {/* Footer Info Section */}
      <div className="relative w-full py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0">
            <GridBackground gridSize="40px" opacity={0.1} />
        </div>
        <div className="relative z-10 container mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12 text-center md:text-left">
          
          {/* Column 1: Logo and Description */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/icons/icon.svg" alt="HorekuOs Logo" width={40} height={40} />
              <span className="text-2xl font-bold">HorekuOs</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-xs">
              La revolución de los bots de WhatsApp impulsados por inteligencia artificial de última generación.
            </p>
            <p className="text-gray-500 text-sm">Creado por <span className="font-semibold text-gray-400">Syllkom</span></p>
          </div>

          {/* Desktop: Normal layout */}
          <div className="hidden md:flex flex-row gap-16 md:gap-24 text-left">
            {/* Column 2: Navigation */}
            <div>
              <h3 className="font-bold text-lg mb-4">Navegación</h3>
              <ul className="space-y-3">
                <li><a href="#inicio" onClick={(e) => handleSmoothScroll('inicio', e)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">Inicio</a></li>
                <li><a href="#características" onClick={(e) => handleSmoothScroll('características', e)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">Características</a></li>
                <li><a href="#funciones" onClick={(e) => handleSmoothScroll('funciones', e)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">Funciones</a></li>
                <li><a href="#precios" onClick={(e) => handleSmoothScroll('precios', e)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">Precios</a></li>
                <li><a href="#preguntas" onClick={(e) => handleSmoothScroll('preguntas', e)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">Preguntas</a></li>
              </ul>
            </div>

            {/* Column 3: Social */}
            <div>
              <h3 className="font-bold text-lg mb-4">Social</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">WhatsApp</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Telegram</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          {/* Mobile: Accordion layout */}
          <div className="md:hidden w-full space-y-4">
            {/* Navigation Accordion */}
            <div className="border-b border-gray-800">
              <button
                onClick={() => toggleSection('navigation')}
                className="w-full flex justify-between items-center py-4"
              >
                <h3 className="font-bold text-lg">Navegación</h3>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openSection === 'navigation' ? 'rotate-180' : ''}`}
                />
              </button>
              <div 
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: openSection === 'navigation' ? '300px' : '0px',
                  opacity: openSection === 'navigation' ? 1 : 0
                }}
              >
                <ul className="space-y-3 pb-4">
                  <li><a href="#inicio" onClick={(e) => handleSmoothScroll('inicio', e)} className="text-gray-400 hover:text-white transition-colors cursor-pointer block">Inicio</a></li>
                  <li><a href="#características" onClick={(e) => handleSmoothScroll('características', e)} className="text-gray-400 hover:text-white transition-colors cursor-pointer block">Características</a></li>
                  <li><a href="#funciones" onClick={(e) => handleSmoothScroll('funciones', e)} className="text-gray-400 hover:text-white transition-colors cursor-pointer block">Funciones</a></li>
                  <li><a href="#precios" onClick={(e) => handleSmoothScroll('precios', e)} className="text-gray-400 hover:text-white transition-colors cursor-pointer block">Precios</a></li>
                  <li><a href="#preguntas" onClick={(e) => handleSmoothScroll('preguntas', e)} className="text-gray-400 hover:text-white transition-colors cursor-pointer block">Preguntas</a></li>
                </ul>
              </div>
            </div>

            {/* Social Accordion */}
            <div className="border-b border-gray-800">
              <button
                onClick={() => toggleSection('social')}
                className="w-full flex justify-between items-center py-4"
              >
                <h3 className="font-bold text-lg">Social</h3>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openSection === 'social' ? 'rotate-180' : ''}`}
                />
              </button>
              <div 
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: openSection === 'social' ? '200px' : '0px',
                  opacity: openSection === 'social' ? 1 : 0
                }}
              >
                <ul className="space-y-3 pb-4">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors block">WhatsApp</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors block">Telegram</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors block">GitHub</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors block">LinkedIn</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
