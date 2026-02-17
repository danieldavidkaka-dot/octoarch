import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalVisualsProps {
  isTyping: boolean;
  isConnected: boolean;
}

const TerminalVisuals: React.FC<TerminalVisualsProps> = ({ isTyping, isConnected }) => {
  return (
    <>
      {/* SVG del cable congradiente animado */}
      <svg className="hidden lg:block absolute top-24 left-[200px] w-[200px] h-[100px] pointer-events-none z-0" style={{ overflow: 'visible' }}>
         <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" stopColor="#00F0FF" stopOpacity="0" />
               <stop offset="50%" stopColor="#00F0FF" stopOpacity="0.5" />
               <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
            </linearGradient>
            <filter id="glowLine">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
         </defs>
         <motion.path 
           d="M 0 50 C 50 50, 50 20, 180 20" 
           fill="none" 
           stroke="url(#lineGradient)" 
           strokeWidth="2"
           filter="url(#glowLine)"
           initial={{ pathLength: 0, opacity: 0 }}
           whileInView={{ pathLength: 1, opacity: 1 }}
           transition={{ duration: 1.5, ease: "easeInOut" }}
         />
         <motion.circle r="3" fill="#ffffff">
            <animateMotion 
               dur="2s" 
               repeatCount="indefinite" 
               path="M 0 50 C 50 50, 50 20, 180 20" 
            />
         </motion.circle>
      </svg>

      {/* Orbe Central y Estado */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-64 flex flex-col items-center lg:sticky lg:top-32 order-1 lg:order-none z-10"
      >
        <div className="relative group">
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#00F0FF]/20 blur-xl rounded-[100%]" />
           <motion.div 
             animate={{ 
               y: [0, -10, 0],
               filter: isTyping ? "brightness(1.3) drop-shadow(0 0 15px rgba(0,240,255,0.4))" : "brightness(1) drop-shadow(0 0 5px rgba(0,240,255,0.1))"
             }}
             transition={{ 
               y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
               filter: { duration: 0.2 }
             }}
             className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center"
           >
             <div className="absolute inset-0 border border-[#00F0FF]/10 rounded-full animate-[spin_10s_linear_infinite] z-0" />
             <div className="absolute inset-2 border border-dashed border-[#00F0FF]/20 rounded-full animate-[spin_15s_linear_infinite_reverse] z-0" />
             <div className="absolute inset-4 rounded-full overflow-hidden border border-[#00F0FF]/30 bg-black/50 shadow-[0_0_30px_rgba(0,240,255,0.1)] z-10 group-hover:border-[#00F0FF]/60 transition-colors duration-500">
               <img 
                 src="https://iili.io/qJK7NKF.md.png" 
                 alt="OctoArch AI Entity"
                 className="w-full h-full object-cover scale-125 opacity-90 mix-blend-screen" 
               />
               <div className="absolute inset-0 bg-gradient-to-tr from-[#00F0FF]/10 to-purple-500/10 mix-blend-overlay pointer-events-none" />
             </div>
           </motion.div>
        </div>
        <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
               <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-[#00F0FF] animate-ping' : 'bg-[#00F0FF]/50'}`} />
               <span className="text-[#00F0FF] font-mono text-xs tracking-[0.2em] font-bold">OCTO_CORE</span>
            </div>
            <div className="h-[1px] w-12 bg-[#00F0FF]/30 mx-auto my-2" />
            <AnimatePresence mode="wait">
              <motion.div 
                key={isTyping ? 'processing' : 'idle'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-[#7AD7F0]/60 font-mono text-[10px]"
              >
                {isTyping ? "PROCESSING_NEURAL_LINK..." : isConnected ? "AWAITING_INPUT" : "CONNECTING..."}
              </motion.div>
            </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

export default TerminalVisuals;