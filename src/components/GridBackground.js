export default function GridBackground({ 
  gridSize = '50px', 
  spotlights = [
    { position: '20% 40%', size: '25%' },
    { position: '85% 20%', size: '30%' },
    { position: '60% 85%', size: '30%' }
  ],
  opacity = 0.2 
}) {
  const maskGradients = spotlights.map(
    spot => `radial-gradient(circle at ${spot.position}, black 0%, transparent ${spot.size})`
  ).join(', ');

  return (
    <div 
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, ${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, ${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize} ${gridSize}`,
        WebkitMaskImage: maskGradients,
        maskImage: maskGradients,
        WebkitMaskComposite: 'source-in',
        maskComposite: 'add',
      }}
    />
  );
}