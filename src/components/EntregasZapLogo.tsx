import { useBranding } from '@/contexts/BrandingContext';

interface LogoProps {
  className?: string;
  size?: number;
}

export const EntregasZapLogo = ({ className = "", size = 64 }: LogoProps) => {
  const { appName, logoUrl, hasCustomLogo } = useBranding();

  // Se há logo customizado, usar ele
  if (hasCustomLogo && logoUrl) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="flex items-center justify-center" style={{ width: size, height: size }}>
          <img 
            src={logoUrl} 
            alt={appName}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="text-center leading-tight mt-2">
          <div className="text-lg font-bold text-slate-800">
            {appName}
          </div>
        </div>
      </div>
    );
  }

  // Logo padrão original
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Ilustração do celular */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 200 200"
        className="mb-2"
      >
        <defs>
          <linearGradient id="phoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#1e88e5', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#0d47a1', stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="packageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#81c784', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#66bb6a', stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="topGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#81c784', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#a5d6a7', stopOpacity:1}} />
          </linearGradient>
        </defs>
        
        {/* Fundo transparente */}
        <rect width="200" height="200" fill="transparent"/>
        
        {/* Mão */}
        <path 
          d="M50 120 C45 115, 40 110, 40 100 C40 90, 45 85, 55 85 C65 85, 70 90, 70 100 L70 110 L120 110 C130 110, 135 115, 135 125 L135 150 C135 160, 130 165, 120 165 L60 165 C50 165, 45 160, 45 150 L45 130 C45 125, 47 122, 50 120 Z" 
          fill="#ffb74d"
          stroke="#ff9800"
          strokeWidth="1"
        />
        
        {/* Celular com cantos arredondados no topo */}
        <path 
          d="M90 40 L150 40 Q160 40 160 50 L160 130 Q160 140 150 140 L90 140 Q80 140 80 130 L80 50 Q80 40 90 40 Z" 
          fill="url(#phoneGradient)" 
          stroke="#ffffff" 
          strokeWidth="2"
        />
        
        {/* Borda verde no topo do celular */}
        <path 
          d="M90 40 L150 40 Q160 40 160 50 L160 55 L80 55 L80 50 Q80 40 90 40 Z" 
          fill="url(#topGreen)"
        />
        
        {/* Tela do celular */}
        <rect 
          x="85" 
          y="48" 
          width="70" 
          height="84" 
          rx="6" 
          fill="#ffffff"
        />
        
        {/* Pacote na tela */}
        <rect 
          x="100" 
          y="65" 
          width="40" 
          height="30" 
          fill="url(#packageGradient)" 
          rx="4"
        />
        
        {/* Raio (velocidade) */}
        <path 
          d="M120 75 L127 62 L113 62 L120 50 L113 62 L120 75" 
          fill="#ff9800" 
          stroke="#f57c00" 
          strokeWidth="1"
        />
        
        {/* Linhas do pacote */}
        <line x1="105" y1="80" x2="135" y2="80" stroke="#ffffff" strokeWidth="2"/>
        <line x1="120" y1="68" x2="120" y2="92" stroke="#ffffff" strokeWidth="2"/>
        
        {/* Símbolos de entrega nas laterais */}
        <rect x="108" y="88" width="4" height="4" fill="#1565c0" rx="1"/>
        <rect x="128" y="88" width="4" height="4" fill="#1565c0" rx="1"/>
        
        {/* Botão do celular */}
        <circle cx="120" cy="125" r="5" fill="#ffffff" opacity="0.9"/>
        
        {/* Elementos decorativos */}
        <circle cx="35" cy="60" r="4" fill="#81c784" opacity="0.8"/>
        <circle cx="165" cy="70" r="3" fill="#ff9800" opacity="0.8"/>
        <circle cx="30" cy="140" r="3" fill="#1e88e5" opacity="0.8"/>
        <circle cx="170" cy="120" r="4" fill="#81c784" opacity="0.8"/>
        
        {/* Linhas de movimento */}
        <g stroke="#81c784" strokeWidth="3" opacity="0.7">
          <line x1="25" y1="90" x2="40" y2="90"/>
          <line x1="160" y1="100" x2="175" y2="100"/>
          <line x1="20" y1="110" x2="35" y2="110"/>
          <line x1="165" y1="130" x2="180" y2="130"/>
        </g>
        
        {/* Linhas azuis */}
        <g stroke="#1e88e5" strokeWidth="3" opacity="0.7">
          <line x1="165" y1="85" x2="180" y2="85"/>
          <line x1="15" y1="125" x2="30" y2="125"/>
        </g>
      </svg>
      
      {/* Texto exatamente como no original */}
      <div className="text-center leading-tight">
        <div className="text-lg font-bold">
          <span className="text-slate-800">Entregas </span>
          <span className="text-orange-500">Zap</span>
        </div>
      </div>
    </div>
  );
};