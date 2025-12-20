import GridBackground from './GridBackground';
import PricingCard from './PricingCard';

export default function PricingSection() {
  const plans = [
    {
      planName: 'Plan Promedio',
      price: '$0',
      period: 'Permanente',
      description: 'Disfruta de los eneficios básicos de HorekuOs',
      features: [
        'Disponible para 2 grupos',
        'Funciones básicas'
      ],
      badge: null,
      isVIP: false
    },
    {
      planName: 'Plan Plus',
      price: '$3',
      period: 'Anual',
      description: 'Disfruta de los beneficios que ofrece HorekuOs en tus grupos',
      features: [
        'Disponible para 7 grupos',
        'Sugerir cmds personalizados',
        'Servicio de soporte mejorado'
      ],
      badge: 'Popular',
      isVIP: false
    },
    {
      planName: 'Plan VIP',
      price: '$?',
      period: 'Personalizado',
      description: 'Plan VIP personalizado con múltiples beneficios en el desarrollo y sugerencias',
      features: [
        'Completamente personalizado'
      ],
      badge: 'VIP',
      isVIP: true
    }
  ];

  return (
    <section id="precios" className="relative w-full bg-black py-12 md:py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <GridBackground 
          gridSize="60px"
          spotlights={[
            { position: '50% 50%', size: '50%' },
            { position: '80% 30%', size: '30%' },
            { position: '20% 70%', size: '25%' }
          ]}
          opacity={0.15}
        />
      </div>

      <div className="absolute inset-0 flex items-start justify-center pointer-events-none z-0">
        <h2 
          className="text-8xl sm:text-9xl md:text-[150px] lg:text-[200px] font-black text-white opacity-10 leading-none"
          style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}
        >
          Precios
        </h2>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              {...plan}
            />
          ))}
        </div>
      </div>
    </section>
  );
}