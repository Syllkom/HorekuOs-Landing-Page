import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet" />
        
        {/* Favicon */}
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        
        {/* Meta Tags Básicos */}
        <meta name="description" content="HorekuOs: La revolución de los bots de WhatsApp impulsados por inteligencia artificial de última generación" />
        <meta name="keywords" content="HorekuOs, bot WhatsApp, inteligencia artificial, IA, automatización, chatbot" />
        <meta name="author" content="Syllkom" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://horekuos.vercel.app/" />
        <meta property="og:title" content="HorekuOs - Bot de WhatsApp con IA" />
        <meta property="og:description" content="La revolución de los bots de WhatsApp impulsados por inteligencia artificial de última generación" />
        <meta property="og:image" content="/images/cover.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://horekuos.com/" />
        <meta name="twitter:title" content="HorekuOs - Bot de WhatsApp con IA" />
        <meta name="twitter:description" content="La revolución de los bots de WhatsApp impulsados por inteligencia artificial de última generación" />
        <meta name="twitter:image" content="/images/cover.png" />
        
        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
