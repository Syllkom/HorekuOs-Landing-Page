import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import GridBackground from './GridBackground';

const getGradientStyle = (position) => {
  const gradients = {
    'tl': 'radial-gradient(circle at bottom right, #1A1A1A 0%, #0a0a0a 70%), radial-gradient(circle at bottom right, #9A9A9A 0%, transparent 70%)',
    'tr': 'radial-gradient(circle at bottom left, #1A1A1A 0%, #0a0a0a 70%), radial-gradient(circle at bottom left, #9A9A9A 0%, transparent 70%)',
    'bl': 'radial-gradient(circle at top right, #1A1A1A 0%, #0a0a0a 70%), radial-gradient(circle at top right, #9A9A9A 0%, transparent 70%)',
    'br': 'radial-gradient(circle at top left, #1A1A1A 0%, #0a0a0a 70%), radial-gradient(circle at top left, #9A9A9A 0%, transparent 70%)'
  };
  return gradients[position] || gradients['tl'];
};

const Accordion = ({ title, children, position }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="group relative rounded-xl lg:rounded-2xl mb-3 lg:mb-4 transition-all duration-300 hover:scale-[1.02]"
      style={{
        border: '1.5px solid transparent',
        backgroundImage: getGradientStyle(position),
        backgroundClip: 'padding-box, border-box',
        backgroundOrigin: 'padding-box, border-box',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
      }}
    >
      <div className="p-4 lg:p-6">
        <button
          className="w-full flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-white font-semibold text-base lg:text-lg text-left">{title}</span>
          <div 
            className="flex-shrink-0 w-9 h-9 lg:w-10 lg:h-10 bg-white/5 rounded-lg lg:rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-all duration-300"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6 text-white"/>
          </div>
        </button>
        <div 
          className="overflow-hidden transition-all duration-500 ease-in-out"
          style={{
            maxHeight: isOpen ? '500px' : '0px',
            opacity: isOpen ? 1 : 0
          }}
        >
          <div className="pt-3 lg:pt-4 text-gray-400 text-xs lg:text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FaqSection() {
  return (
    <section id="preguntas" className="relative w-full bg-black py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <GridBackground 
          gridSize="60px"
          spotlights={[
            { position: '85% 30%', size: '40%' },
            { position: '95% 80%', size: '35%' },
          ]}
          opacity={0.15}
        />
      </div>
      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-4xl font-bold text-white mb-12">Preguntas Frecuentes</h2>
            <div
              className="group relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
              style={{
                border: '1.5px solid transparent',
                backgroundImage: getGradientStyle('br'),
                backgroundClip: 'padding-box, border-box',
                backgroundOrigin: 'padding-box, border-box',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
              }}
            >
              <h3 className="text-white font-semibold text-2xl mb-4">Mas preguntas?</h3>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">Escríbenos al privado por WhatsApp</p>
              <button className="bg-white text-black font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition-colors">
                Enviar
              </button>
            </div>
          </div>
          <div>
            <Accordion title="¿Quién eres, HorekuOs?" position="tl">
              <p>HorekuOs es un bot de WhatsApp integrado con inteligencia artificial para mejorar la experiencia del usuario en grupos y chats privados</p>
            </Accordion>
            <Accordion title="¿Cómo puedo pedir que descargue un video?" position="bl">
              <p>Próximamente...</p>
            </Accordion>
            <Accordion title="¿De qué plataformas puedes descargar videos?" position="bl">
              <p>Próximamente...</p>
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}