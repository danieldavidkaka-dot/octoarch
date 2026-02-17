import React from 'react';
import { motion } from 'framer-motion';
import { User, MessageSquare } from 'lucide-react';
import SectionDivider from './ui/SectionDivider';
import { useLanguage } from '../../utils/i18n';

const testimonials = [
  { user: "@dev_sara", role: "Full Stack Arch", text: "OctoArch automated my entire CI/CD pipeline while I slept. I woke up to a optimized production environment." },
  { user: "@neo_cortex", role: "SysAdmin", text: "The recursive self-healing capabilities are terrifyingly good. It fixed a memory leak before I even got the alert." },
  { user: "@cypher_punk", role: "Security Ops", text: "Finally, an agent system that respects zero-trust principles. The audit logs are pristine." },
  { user: "@k8s_master", role: "DevOps Lead", text: "Replaced 4 different tools with one OctoArch swarm. The visualizer is straight out of a sci-fi movie." },
  { user: "@ai_researcher", role: "ML Engineer", text: "The latency on the global context module is almost non-existent. It feels like telepathy." },
];

const TestimonialCard: React.FC<{ data: typeof testimonials[0] }> = ({ data }) => (
  <div className="w-[350px] p-6 bg-[#0A0A0A]/80 backdrop-blur-md border border-[#1F1F1F] rounded-none relative group hover:border-[#00F0FF]/30 transition-colors mx-4">
    {/* Corner accents */}
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#333] group-hover:border-[#00F0FF] transition-colors" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#333] group-hover:border-[#00F0FF] transition-colors" />
    
    <div className="flex items-start gap-4 mb-4">
      <div className="w-10 h-10 bg-[#151515] border border-[#333] flex items-center justify-center rounded-full">
        <User className="w-5 h-5 text-[#666] group-hover:text-[#00F0FF] transition-colors" />
      </div>
      <div>
        <div className="text-white font-mono text-sm font-bold">{data.user}</div>
        <div className="text-[#555] font-mono text-xs uppercase">{data.role}</div>
      </div>
    </div>
    
    <p className="text-[#B0B0B0] text-sm leading-relaxed font-sans">
      "{data.text}"
    </p>
    
    <div className="mt-4 flex items-center gap-2 text-[#333] text-xs font-mono group-hover:text-[#00F0FF]/50 transition-colors">
       <MessageSquare className="w-3 h-3" />
       <span>TRANSMISSION_VERIFIED</span>
    </div>
  </div>
);

const Testimonials: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-[#050505] overflow-hidden border-t border-[#1A1A1A]">
      <SectionDivider number="04" title={t.testimonials.title} subtitle="INTERCEPTED_SIGNALS" />
      
      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10" />
        
        <div className="flex">
          <motion.div 
            className="flex"
            animate={{ x: "-50%" }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
              <TestimonialCard key={i} data={t} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;