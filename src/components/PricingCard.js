import { Check, Sparkles } from 'lucide-react';

export default function PricingCard({ 
  planName, 
  price, 
  period, 
  description, 
  features, 
  badge,
  isVIP = false 
}) {
  const isPopular = badge === 'Popular';
  const isPremium = isPopular || isVIP;
  
  return (
    <div className={`pricing-card ${isPopular ? 'popular' : ''} ${isVIP ? 'vip' : ''} hover:scale-105 active:scale-100 transition-transform duration-300`}>
      {/* Nombre del plan (tarjeta) */}
      <div className="card-header">
        <span className="plan-name">{planName}</span>
        {badge && (
          <div className={`badge ${isVIP ? 'vip' : ''}`}>
            <Sparkles className="w-4 h-4" />
            <span>{badge}</span>
          </div>
        )}
      </div>

      {/* Precio */}
      <div className="price-container">
        <h2 className="price">{price}</h2>
        <span className="period">{period}</span>
      </div>

      {/* Descripción */}
      <p className="card-description">
        {description}
      </p>

      {/* CTA Botón (comprar) */}
      <button 
        className={`pricing-btn ${isVIP ? 'btn-gold' : 'btn-white'} ${isPremium ? 'btn-shine' : ''}`}
      >
        Comprar
      </button>

      {/* Lista de funciones  ✓ (lo que trae cada plan) */}
      <ul className="features-list">
        {features.map((feature, index) => (
          <li key={index} className="feature-item">
            <div className="check-icon">
              <Check className="w-3 h-3" strokeWidth={2.5} />
            </div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
