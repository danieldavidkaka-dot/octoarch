import React from 'react';
import { motion } from 'framer-motion';

const logos = [
  "CyberDyne", "Tyrell_Corp", "Massive_Dynamic", "Weyland-Yutani", "Aperture_Science", 
  "Hooli", "Globex", "Soylent_Corp", "InGen", "Umbrella_Corp"
];

const LogoWall: React.FC = () => {
  return (
    <section className="py-10 bg-[#020202] border-b border-white/5 overflow-hidden relative z-20">
      <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-transparent to-[#020202] z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <p className="text-[#555] font-mono text-[10px] tracking-[0.2em] uppercase">
          TRUSTED_BY_SECTORS //
        </p>
      </div>

      <div className="flex relative">
        <motion.div 
          className="flex gap-16 items-center whitespace-nowrap"
          animate={{ x: "-50%" }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...logos, ...logos].map((logo, i) => (
            <div 
              key={i} 
              className="text-xl font-display font-bold text-[#333] hover:text-[#00F0FF] transition-colors duration-500 cursor-default select-none uppercase tracking-tighter"
            >
              {logo}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LogoWall;