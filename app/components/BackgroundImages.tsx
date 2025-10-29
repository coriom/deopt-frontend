'use client';

import { useEffect, useState } from 'react';

export default function BackgroundImages() {
  const greeks = ['Delta', 'Gamma', 'Rho', 'Vega', 'Theta', 'Delta', 'Gamma', 'Rho', 'Vega', 'Theta'];

  const [styles, setStyles] = useState<{ top: string; left: string; duration: string; delay: string }[]>([]);

  useEffect(() => {
    const newStyles = greeks.map(() => ({
      top: `${Math.random() * 80}%`,
      left: `${Math.random() * 80}%`,
      duration: `${12 + Math.random() * 6}s`,
      delay: `${Math.random() * 5}s`,
    }));
    setStyles(newStyles);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      {greeks.map((greek, i) => (
        <img
          key={i}
          src={`/image/Greeks/Logo_${greek}.png`} // ✅ nouveau chemin
          alt={`${greek} logo`}
          className={`absolute opacity-10 w-32 animate-floating${i % 4}`}
          style={{
            top: styles[i]?.top,
            left: styles[i]?.left,
            animationDuration: styles[i]?.duration,
            animationDelay: styles[i]?.delay,
          }}
        />
      ))}
    </div>
  );
}
