import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Terminal, Key } from 'lucide-react';
import Button from './ui/Button';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../../utils/i18n';

const Navbar: React.FC = () => {
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'capabilities', label: t.nav.capabilities },
    { id: 'architecture', label: t.nav.architecture },
    { id: 'benchmarks', label: t.nav.benchmarks },
    { id: 'terminal', label: t.nav.terminal },
    { id: 'pricing', label: t.nav.access },
  ];

  return (
    <motion.nav 
      // Increased border opacity to white/15 and background opacity for better separation
      className="fixed top-0 left-0 right-0 z-40 border-b border-white/15 bg-[#020202]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[#020202]/70 shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ delay: 4.5, duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {/* Icon Container with Glow - Sharper border */}
          <div className="p-1 bg-[#00F0FF]/5 rounded group-hover:bg-[#00F0FF]/20 transition-colors border border-[#00F0FF]/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <Terminal className="text-[#00F0FF] w-5 h-5 drop-shadow-[0_0_2px_rgba(0,240,255,1)]" />
          </div>
          {/* Neon Text Effect - Font Space Grotesk - Sharper Text Shadow */}
          <span className="font-bold tracking-tight text-white font-display group-hover:text-[#00F0FF] transition-colors [text-shadow:0_0_10px_rgba(0,240,255,0.3)]">
            OctoArch_v2.0
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              // Changed font-mono to font-display (Space Grotesk) and added font-medium
              className="text-sm text-[#C0C0C0] hover:text-[#00F0FF] transition-colors uppercase tracking-wider text-[11px] font-display font-medium hover:underline decoration-[#00F0FF]/50 underline-offset-4 hover:drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Button variant="outline" size="sm" icon={<Key className="w-3 h-3" />}>
            {t.nav.api_key}
          </Button>
        </div>
      </div>
      
      {/* Reading Progress Bar - Sharper shadow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#00F0FF] origin-left shadow-[0_0_10px_#00F0FF]"
        style={{ scaleX }}
      />
    </motion.nav>
  );
};

export default Navbar;