import Navbar from './Navbar';
import ChatInput from './ChatInput';
import GridBackground from './GridBackground';

export default function HeroSection() {
  return (
    <div id="inicio" className="relative min-h-screen w-full bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <GridBackground 
          gridSize="50px"
          spotlights={[
            { position: '20% 40%', size: '25%' },
            { position: '85% 20%', size: '30%' },
            { position: '60% 85%', size: '30%' }
          ]}
          opacity={0.2}
        />
      </div>
      
      <Navbar />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none z-5">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-32 pb-16">
        <div className="relative w-full max-w-4xl mb-6 sm:mb-8 px-4">
          <h1 
            className="text-[3.5rem] sm:text-[5rem] md:text-[6.5rem] lg:text-[8rem] font-black text-center leading-none select-none"
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 900,
              color: '#4a4a4a',
              background: 'linear-gradient(to bottom, #5a5a5a 0%, #4a4a4a 30%, #3a3a3a 60%, #1a1a1a 85%, #000000 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            HorekuOs
          </h1>
        </div>

        <div className="relative z-20 w-full max-w-4xl mb-12">
          <ChatInput />
        </div>

        <div className="relative z-20 max-w-4xl text-center px-4 sm:px-6">
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            <span className="text-white font-bold">HorekuOs: </span>
            <span className="text-[#9ca3af] font-normal">La revolución de los bots de WhatsApp impulsados</span>
            <br />
            <span className="text-[#9ca3af] font-normal">por </span>
            <span className="text-white font-bold">inteligencia artificial</span>
            <span className="text-[#9ca3af] font-normal"> de última generación</span>
          </p>
        </div>
      </div>
    </div>
  );
}