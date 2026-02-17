import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface SectionDividerProps {
  number: string;
  title: string;
  subtitle?: string;
}

const useScramble = (text: string, active: boolean, speed: number = 30) => {
  const [displayText, setDisplayText] = useState(text); 
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_//<>";

  useEffect(() => {
    if (!active) return;
    
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => 
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 2;
    }, speed);

    return () => clearInterval(interval);
  }, [active, text, speed]);

  return displayText;
};

const SectionDivider: React.FC<SectionDividerProps> = ({ number, title, subtitle }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const scrambledTitle = useScramble(title, isInView);

  return (
    <div ref={ref} className="relative py-12 w-full max-w-7xl mx-auto px-6 mb-8">
      {/* Horizontal Line Drawing */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute top-1/2 left-0 w-full h-[1px] bg-[#1A1A1A] origin-left"
      />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6 bg-[#050505] pr-8">
          {/* Number Box */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center w-12 h-12 border border-[#00F0FF]/30 bg-[#00F0FF]/5 text-[#00F0FF] font-mono text-sm font-bold"
          >
            {number}
          </motion.div>

          <div className="flex flex-col">
             <h2 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-tight min-w-[200px]">
               {isInView ? scrambledTitle : <span className="opacity-0">{title}</span>}
             </h2>
             {subtitle && (
               <motion.span 
                 initial={{ opacity: 0 }}
                 animate={isInView ? { opacity: 1 } : {}}
                 transition={{ delay: 1 }}
                 className="text-[10px] font-mono text-[#666] tracking-widest uppercase mt-1"
               >
                 {subtitle}
               </motion.span>
             )}
          </div>
        </div>

        {/* Status Indicator */}
        <motion.div 
           initial={{ opacity: 0 }}
           animate={isInView ? { opacity: 1 } : {}}
           transition={{ delay: 1.5 }}
           className="hidden md:flex items-center gap-2 bg-[#050505] pl-8"
        >
           <span className="text-[10px] font-mono text-[#333]">SYSTEM_CHECK</span>
           <span className="text-[10px] font-mono text-[#00F0FF]">[ OK ]</span>
        </motion.div>
      </div>
    </div>
  );
};

export default SectionDivider;