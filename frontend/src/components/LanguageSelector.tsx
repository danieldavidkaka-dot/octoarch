import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, Language } from '../../utils/i18n';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: 'US' },
  { code: 'es', label: 'Español', flag: 'ES' },
  { code: 'de', label: 'Deutsch', flag: 'DE' },
  { code: 'zh', label: '中文', flag: 'CN' },
  { code: 'jp', label: '日本語', flag: 'JP' },
  { code: 'fr', label: 'Français', flag: 'FR' },
  { code: 'it', label: 'Italiano', flag: 'IT' },
  { code: 'pt', label: 'Português', flag: 'PT' },
];

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1A1A1A] border border-[#333] hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors text-xs font-mono group"
      >
        <Globe className="w-3 h-3 text-[#B0B0B0] group-hover:text-[#00F0FF] transition-colors" />
        <span className="uppercase">{language}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-48 bg-[#121212]/90 backdrop-blur-xl border border-[#00F0FF]/30 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden z-50"
          >
            {/* Cyberpunk Header */}
            <div className="px-3 py-2 bg-[#1A1A1A]/80 border-b border-[#333] flex justify-between items-center">
              <span className="text-[9px] font-mono text-[#00F0FF] uppercase tracking-wider">Select_Lang_Pack</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
            </div>

            <div className="p-1 grid grid-cols-1 gap-0.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`relative flex items-center justify-between px-3 py-2 text-xs font-mono transition-all group hover:bg-[#00F0FF]/10 rounded-sm ${
                    language === lang.code ? 'text-[#00F0FF] bg-[#00F0FF]/5' : 'text-[#B0B0B0]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="opacity-50 text-[10px] w-4">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                  
                  {language === lang.code && (
                    <Check className="w-3 h-3 text-[#00F0FF]" />
                  )}
                  
                  {/* Hover scanline */}
                  <div className="absolute inset-0 bg-[#00F0FF]/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 pointer-events-none" />
                </button>
              ))}
            </div>
            
            <div className="h-0.5 w-full bg-gradient-to-r from-[#00F0FF]/0 via-[#00F0FF]/50 to-[#00F0FF]/0" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;