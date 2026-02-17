import React, { useState } from 'react';
import { Cpu, Globe, Layers, Zap, Shield, GitBranch, Database, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/Card';
import SectionDivider from './ui/SectionDivider';
import { useLanguage } from '../../utils/i18n';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Cpu,
    title: "Neural Orchestration",
    id: "CORE_CPU_01",
    stat: "99.9% EFFICIENT",
    desc: "Centralized intelligence unit managing 1,000+ specialized sub-agents concurrently.",
    span: "md:col-span-2", 
    variant: "cyber"
  },
  {
    icon: Globe,
    title: "Global Context",
    id: "NET_GLOBAL_V2",
    stat: "140ms LATENCY",
    desc: "Real-time semantic understanding of distributed data sources across regions.",
    span: "md:col-span-1",
    variant: "default"
  },
  {
    icon: Layers,
    title: "Self-Healing",
    id: "AUTO_PATCH_X",
    stat: "ZERO DOWNTIME",
    desc: "Autonomous detection and patch deployment for system anomalies.",
    span: "md:col-span-1",
    variant: "default"
  },
  {
    icon: Zap,
    title: "Edge Compute",
    id: "EDGE_NODE_09",
    stat: "5000 TPS",
    desc: "Edge-computed decisions ensuring instant execution of agent commands.",
    span: "md:col-span-2",
    variant: "cyber"
  },
  {
    icon: Shield,
    title: "Zero-Trust Kernel",
    id: "SEC_LEVEL_5",
    stat: "ENCRYPTED",
    desc: "Cryptographically verified agent interactions.",
    span: "md:col-span-1",
    variant: "default"
  },
  {
    icon: GitBranch,
    title: "Recursive Learning",
    id: "EVO_MODEL_GEN4",
    stat: "V4.2.0 ALPHA",
    desc: "System architecture evolves based on task completion.",
    span: "md:col-span-2",
    variant: "outline"
  }
];

const Capabilities: React.FC = () => {
  const { t } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="capabilities" className="pb-32 bg-[#050505] relative overflow-hidden">
      
      {/* Background Organic Shapes - Subtle */}
      <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-[#9D4EDD]/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      
      {/* Section Divider Replaces Old Header */}
      <SectionDivider 
        number="01" 
        title={t.capabilities.title_core + " " + t.capabilities.title_suffix}
        subtitle="MODULE_STATUS: LOADED"
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Asymmetric Bento Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              className={`${feature.span} relative`}
              onMouseEnter={() => setHoveredIndex(idx)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <Card 
                // @ts-ignore
                variant={feature.variant} 
                className={`h-full group transition-all duration-500 ${hoveredIndex !== null && hoveredIndex !== idx ? 'opacity-40 grayscale-[50%]' : 'opacity-100'}`}
              >
                <div className="absolute top-6 right-6 text-[10px] font-mono text-[#333] group-hover:text-[#00F0FF] transition-colors z-20 flex items-center gap-2">
                  <span>{feature.id}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                </div>
                
                <CardHeader className="relative z-10 h-full flex flex-col">
                  <div className="w-12 h-12 mb-6 rounded-lg bg-[#1A1A1A] flex items-center justify-center border border-white/5 group-hover:border-[#00F0FF]/30 transition-colors">
                    <feature.icon className="w-5 h-5 text-[#B0B0B0] group-hover:text-[#00F0FF] transition-colors duration-300" />
                  </div>
                  
                  <CardTitle className="text-2xl mb-2 font-display group-hover:text-white transition-colors">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed font-sans text-[#888] group-hover:text-[#CCC] transition-colors max-w-sm">
                    {feature.desc}
                  </CardDescription>
                  
                  <div className="mt-auto pt-8 flex items-center justify-between border-t border-white/5 group-hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-2">
                          <Database className="w-3 h-3 text-[#555] group-hover:text-[#00F0FF] transition-colors" />
                          <span className="text-[10px] font-mono text-[#7AD7F0]/60 group-hover:text-[#7AD7F0]">{feature.stat}</span>
                      </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Capabilities;