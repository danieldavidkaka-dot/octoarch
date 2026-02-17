import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown, Zap, Terminal, ArrowRight } from 'lucide-react';
import Button from './ui/Button';
import { useLanguage } from '../../utils/i18n';

// Modified Scramble Hook: Only starts when 'active' is true
const useScramble = (text: string, active: boolean, speed: number = 40) => {
  const [displayText, setDisplayText] = useState(active ? "" : text); 
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&[]{}<>";

  useEffect(() => {
    if (!active) return;

    let iteration = 0;
    let timer: ReturnType<typeof setInterval>;

    const startScramble = () => {
      timer = setInterval(() => {
        setDisplayText(prev => 
          text
            .split("")
            .map((letter, index) => {
              if (index < iteration) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );

        if (iteration >= text.length) {
          clearInterval(timer);
        }

        iteration += 1 / 3;
      }, speed);
    };

    startScramble();

    return () => {
      clearInterval(timer);
    };
  }, [text, speed, active]);

  return active ? displayText : "";
};

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [introComplete, setIntroComplete] = useState(false);

  // Parallax Inputs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const scrambledTitle = useScramble("OCTO", introComplete);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth - 0.5) * 50); // range -25 to 25
    mouseY.set((clientY / innerHeight - 0.5) * 50);
  };

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const titleX = useTransform(smoothMouseX, (val) => val * -1); // Inverse movement
  const titleY = useTransform(smoothMouseY, (val) => val * -1);

  // Video Logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setIntroComplete(true);
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch((e) => console.log("Video replay prevented:", e));
        video.loop = true; 
      }, 100); 
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-screen w-full overflow-hidden bg-[#050505] flex flex-col items-center pt-32 pb-20 perspective-[1000px]"
      onMouseMove={handleMouseMove}
    >
      {/* Background Layer with Video */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
         <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-2000 ease-in-out ${introComplete ? 'opacity-30 blur-sm scale-105' : 'opacity-100 blur-0 scale-100'}`}
            autoPlay
            muted
            playsInline
         >
            <source src="https://res.cloudinary.com/di0uempui/video/upload/v1771087229/OctoArch_Pulpo_IA_Heroico_Genera_Video_dqrgnu.mp4" />
         </video>

         <div className="absolute inset-0 bg-[#050505]/50 mix-blend-multiply" />
         <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/30 via-transparent to-[#050505]" />

         {/* Organic Grid Flow */}
         <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: introComplete ? 0.15 : 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:6rem_6rem] [transform:perspective(1000px)_rotateX(60deg)_translateY(-100px)_scale(2)] origin-top mix-blend-overlay animate-grid-flow" 
         />
      </div>

      {/* Foreground Content */}
      <div className="relative z-20 w-full flex flex-col items-center px-4 h-full justify-center min-h-[60vh]">
        <AnimatePresence>
          {introComplete && (
            <motion.div 
              className="max-w-6xl w-full text-center space-y-12 mb-20 relative"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Kinetic Typography - Main Title */}
              <motion.div className="flex flex-col items-center relative mix-blend-screen">
                <div className="flex items-center gap-4 mb-8 overflow-hidden">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#00F0FF]/50" 
                  />
                  <motion.div 
                    variants={itemVariants}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/5 text-[#7AD7F0] text-xs backdrop-blur-md font-mono"
                  >
                    <div className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-pulse" />
                    <span className="tracking-widest">{t.hero.system_online}</span>
                  </motion.div>
                  <motion.div 
                     initial={{ x: "100%" }}
                     animate={{ x: 0 }}
                     transition={{ duration: 0.8, ease: "circOut" }}
                     className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#00F0FF]/50" 
                  />
                </div>

                <motion.div style={{ x: titleX, y: titleY }} className="relative z-10">
                  <h1 
                    className="relative text-8xl md:text-[10rem] font-display font-bold tracking-tighter mb-4 leading-[0.8] cursor-default select-none group"
                  >
                    <span className="text-white relative inline-block transition-transform duration-300 group-hover:scale-105 group-hover:text-[#00F0FF] mix-blend-overlay">
                      {scrambledTitle}
                    </span>
                    
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#00F0FF] to-[#9D4EDD] opacity-80 animate-breathe inline-block">
                      {t.hero.title_suffix}
                    </span>
                  </h1>
                </motion.div>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-xl md:text-2xl text-[#B0B0B0] font-sans font-light max-w-2xl mx-auto leading-relaxed mt-6 drop-shadow-md mix-blend-luminosity"
                >
                  {t.hero.subtitle}
                </motion.p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="flex items-center justify-center gap-2"
              >
                <div className="w-1 h-1 bg-[#00F0FF] rounded-full" />
                <Typewriter text={t.hero.establishing} active={introComplete} />
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              >
                <Button 
                  variant="neon" 
                  size="lg" 
                  shape="cyber" 
                  icon={<Zap className="w-5 h-5 text-black" />}
                >
                  {t.hero.button_init}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="group flex items-center gap-2 hover:bg-white/5 rounded-full px-8 border border-transparent hover:border-white/10"
                >
                  {t.hero.button_manifesto}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#00F0FF]" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Scroll indicator - Organic movement */}
      {introComplete && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#7AD7F0]/30 cursor-pointer hover:text-[#00F0FF] transition-colors z-20 group"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-[#00F0FF]/50 to-transparent group-hover:h-16 transition-all duration-500" />
          <span className="text-[9px] tracking-[0.3em] font-mono uppercase opacity-50 group-hover:opacity-100">Scroll</span>
        </motion.div>
      )}
    </div>
  );
};

const Typewriter: React.FC<{ text: string, active: boolean }> = ({ text, active }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!active) return;
    
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(intervalId);
      }
    }, 40);
    return () => clearInterval(intervalId);
  }, [text, active]);

  return (
    <p className="font-mono text-[#00F0FF]/60 text-xs tracking-widest uppercase">
      {displayedText}
      <span className="animate-pulse">_</span>
    </p>
  );
};

export default Hero;