'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const menuItems = ['Inicio', 'Características', 'Funciones', 'Precios', 'Preguntas'];
  const [activeItem, setActiveItem] = useState('Inicio');

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      const sections = menuItems.map(item => ({
        id: item.toLowerCase(),
        element: document.getElementById(item.toLowerCase())
      }));

      const scrollPosition = window.scrollY + 150; // Offset for navbar height

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element && section.element.offsetTop <= scrollPosition) {
          const itemName = menuItems[i];
          if (activeItem !== itemName) {
            setActiveItem(itemName);
          }
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeItem]);

  const handleLinkClick = (item, event) => {
    event.preventDefault();
    setActiveItem(item);
    const element = document.getElementById(item.toLowerCase());
    if (element) {
      const offsetTop = element.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-start pt-6 px-6">
      {/* Logo - Esquina izquierda */}
      <Image 
        src="/icons/icon.svg" 
        alt="HorekuOs Logo" 
        width={40} 
        height={40}
        className="w-10 h-10 md:w-12 md:h-12"
      />

      {/* Navbar centrada - Solo visible en desktop */}
      <nav className="navbar hidden md:flex">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li 
              key={item} 
              className={`nav-item ${activeItem === item ? 'active' : ''}`}>
              <a 
                href={`#${item.toLowerCase()}`}
                className="nav-link"
                onClick={(e) => handleLinkClick(item, e)}>
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botón Premium - Esquina derecha */}
      <button className="premium-btn-corner">
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">Prueba gratis</span>
        <span className="sm:hidden">Prueba</span>
      </button>
    </header>
  );
}