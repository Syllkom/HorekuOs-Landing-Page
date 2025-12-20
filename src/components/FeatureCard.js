'use client';

export default function FeatureCard({ icon: Icon, title, description, position, isActive, onClick }) {
  const getGradientStyle = () => {
    const gradients = {
      'tl': 'radial-gradient(circle at bottom right, #1A1A1A 0%, #0a0a0a 70%), radial-gradient(circle at bottom right, #9A9A9A 0%, transparent 70%)',
      'tr': 'radial-gradient(circle at bottom left, #1A1A1A 0%, #0a0a0a 70%), radial-gradient(circle at bottom left, #9A9A9A 0%, transparent 70%)',
      'bl': 'radial-gradient(circle at top right, #1A1A1A 0%, #0a0a0a 70%), radial-gradient(circle at top right, #9A9A9A 0%, transparent 70%)',
      'br': 'radial-gradient(circle at top left, #1A1A1A 0%, #0a0a0a 70%), radial-gradient(circle at top left, #9A9A9A 0%, transparent 70%)'
    };
    return gradients[position] || gradients['tl'];
  };

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl lg:rounded-2xl p-4 lg:p-6 cursor-pointer select-none hover:scale-105 active:scale-100"
      style={{
        border: isActive ? '1.5px solid rgba(255, 255, 255, 0.3)' : '1.5px solid transparent',
        backgroundImage: getGradientStyle(),
        backgroundClip: 'padding-box, border-box',
        backgroundOrigin: 'padding-box, border-box',
        boxShadow: isActive 
          ? '0 15px 40px -10px rgba(0,0,0,0.6), 0 0 30px rgba(255, 255, 255, 0.1)' 
          : '0 10px 30px -10px rgba(0,0,0,0.5)',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="flex items-start gap-3 lg:gap-4">
        {/* Icon Container */}
        <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 bg-white/5 rounded-lg lg:rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" strokeWidth={1.5} />
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h3 className="text-white font-semibold text-base lg:text-lg mb-1 lg:mb-2">{title}</h3>
          <p className="text-gray-400 text-xs lg:text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}