import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState('entering');

  useEffect(() => {
    // Phase transitions for a premium feel
    const timer1 = setTimeout(() => setPhase('pulsing'), 800);
    const timer2 = setTimeout(() => setPhase('leaving'), 2500);
    const timer3 = setTimeout(onFinish, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F1729] transition-opacity duration-700 ${phase === 'leaving' ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative">
        {/* Animated Background Glow */}
        <div className={`absolute inset-0 bg-blue-500/20 blur-3xl rounded-full transition-transform duration-1000 ${phase === 'entering' ? 'scale-0' : 'scale-150'}`} />
        
        {/* Logo Container */}
        <div className={`relative flex items-center justify-center w-40 h-40 bg-white rounded-full shadow-2xl transition-all duration-700 transform ${phase === 'entering' ? 'scale-50 rotate-12 opacity-0' : 'scale-100 rotate-0 opacity-100'}`}>
          <img 
            src="/pwa-192x192.png" 
            alt="OwnerPulse Logo" 
            className={`w-24 h-24 transition-transform duration-1000 ${phase === 'pulsing' ? 'animate-pulse' : ''}`}
          />
        </div>

        {/* Floating Elements */}
        <div className={`absolute -top-4 -right-4 text-amber-400 transition-all duration-700 delay-300 ${phase === 'entering' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
          <Sparkles size={32} />
        </div>
      </div>

      <div className={`mt-8 text-center transition-all duration-700 delay-500 transform ${phase === 'entering' ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Owner<span className="text-blue-500">Pulse</span>
        </h1>
        <p className="mt-2 text-slate-400 font-medium">Leadership Dashboard</p>
      </div>

      {/* Progress Bar (Subtle) */}
      <div className="absolute bottom-12 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full bg-blue-500 transition-all duration-[2500ms] ease-out ${phase === 'entering' ? 'w-0' : 'w-full'}`} />
      </div>
    </div>
  );
};

export default SplashScreen;
