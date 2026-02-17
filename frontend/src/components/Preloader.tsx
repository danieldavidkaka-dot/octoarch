import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  
  const bootSequence = [
    "Initializing OctoArch kernel...",
    "Allocating neural buffers...",
    "Connecting to distributed agent swarm...",
    "Bypassing security protocols...",
    "OctoArch environment ready."
  ];

  useEffect(() => {
    let delay = 0;
    bootSequence.forEach((line, index) => {
      delay += Math.random() * 500 + 300;
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        if (index === bootSequence.length - 1) {
          setTimeout(onComplete, 800);
        }
      }, delay);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] font-mono text-[#00F0FF]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-lg p-6">
        <div className="mb-4 text-xs text-[#B0B0B0] uppercase tracking-widest border-b border-[#333] pb-2">
          System Boot
        </div>
        <div className="space-y-2">
          {lines.map((line, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-[#333]">❯</span>
              <span className={i === lines.length - 1 ? "animate-pulse" : ""}>{line}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Preloader;