import React from 'react';
import { Check, Zap } from 'lucide-react';
import Button from './ui/Button';
import SectionDivider from './ui/SectionDivider';
import { useLanguage } from '../../utils/i18n';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const TiltCard = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);
  const shineOpacity = useTransform(mouseY, [-0.5, 0.5], [0, 0.4]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;

    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative perspective-[1000px] ${className}`}
    >
      <div className="relative h-full w-full" style={{ transform: "translateZ(0)" }}>
        {children}
        <motion.div 
          style={{ opacity: shineOpacity }}
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#00F0FF]/10 to-transparent pointer-events-none rounded-2xl z-20"
        />
      </div>
    </motion.div>
  );
};

const Pricing: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="pb-24 bg-[#050505] border-t border-[#1A1A1A] overflow-hidden">
      <SectionDivider number="06" title={t.pricing.title} subtitle="RESOURCE_ALLOCATION" />
      
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[#B0B0B0] font-sans text-sm mb-16 max-w-2xl mx-auto">
          {t.pricing.subtitle}
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Basic Plan */}
          <TiltCard className="h-full">
            <div className="h-full p-8 border border-[#1A1A1A] rounded-2xl bg-[#121212] hover:border-[#333] transition-colors flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2 font-display">{t.pricing.plan_dev}</h3>
              <div className="text-4xl font-bold text-white mb-6 font-display">$0<span className="text-lg text-[#B0B0B0] font-normal font-sans">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Access to OctoArch-mini', '1 Agent Instance', 'Community Support', 'Basic API Limits'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-[#B0B0B0] text-sm font-sans">
                    <Check className="w-4 h-4 text-[#00F0FF]" /> {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full relative z-30">
                {t.pricing.cta_start}
              </Button>
            </div>
          </TiltCard>

          {/* Popular Plan - Cyber Styled */}
          <TiltCard className="h-full scale-105 z-10">
            <div className="relative h-full p-[1px] rounded-2xl group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF] via-[#9D4EDD] to-[#00F0FF] rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-1000 bg-[length:200%_200%] animate-[spin_4s_linear_infinite]" 
                   style={{ animation: 'gradient-xy 3s ease infinite' }} />
              
              <div className="relative h-full bg-[#1A1A1A] rounded-2xl p-8 flex flex-col backdrop-blur-sm">
                <div className="absolute top-0 right-0 bg-[#00F0FF] text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg font-mono z-20">
                  RECOMMENDED
                </div>
                <h3 className="text-xl font-bold text-[#00F0FF] mb-2 font-display flex items-center gap-2">
                  {t.pricing.plan_startup} <Zap className="w-4 h-4 fill-[#00F0FF] text-[#00F0FF]" />
                </h3>
                <div className="text-4xl font-bold text-white mb-6 font-display">$49<span className="text-lg text-[#B0B0B0] font-normal font-sans">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Access to OctoArch-pro', 'Up to 50 Agent Swarm', 'Priority Email Support', 'High Throughput API'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-gray-300 text-sm font-sans">
                      <Check className="w-4 h-4 text-[#00F0FF]" /> {item}
                    </li>
                  ))}
                </ul>
                <Button variant="neon" className="w-full relative z-30">
                  {t.pricing.cta_deploy}
                </Button>
              </div>
            </div>
          </TiltCard>

          {/* Enterprise Plan */}
          <TiltCard className="h-full">
            <div className="h-full p-8 border border-[#1A1A1A] rounded-2xl bg-[#121212] hover:border-[#333] transition-colors flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2 font-display">{t.pricing.plan_enterprise}</h3>
              <div className="text-4xl font-bold text-white mb-6 font-display">Custom</div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Unlimited Agent Swarms', 'On-Premise Deployment', 'Dedicated Solutions Arch', 'SLA Guarantee'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-[#B0B0B0] text-sm font-sans">
                    <Check className="w-4 h-4 text-[#00F0FF]" /> {item}
                  </li>
                ))}
              </ul>
              <Button variant="ghost" className="w-full border border-[#333] relative z-30">
                {t.pricing.cta_contact}
              </Button>
            </div>
          </TiltCard>

        </div>
      </div>
    </section>
  );
};

export default Pricing;