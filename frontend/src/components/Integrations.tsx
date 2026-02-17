import React from 'react';
import { Database, Cloud, Server, Box, Globe, Shield, Code, Terminal, Cpu } from 'lucide-react';
import { useLanguage } from '../../utils/i18n';
import SectionDivider from './ui/SectionDivider';
import { motion } from 'framer-motion';

const tools = [
  { name: "Kubernetes", icon: Box, desc: "Orchestration", status: "ONLINE" },
  { name: "AWS", icon: Cloud, desc: "Infrastructure", status: "LINKED" },
  { name: "PostgreSQL", icon: Database, desc: "Data Layer", status: "ACTIVE" },
  { name: "Docker", icon: Server, desc: "Containers", status: "READY" },
  { name: "Cloudflare", icon: Globe, desc: "Edge Network", status: "ONLINE" },
  { name: "Vault", icon: Shield, desc: "Security", status: "LOCKED" },
  { name: "GitHub", icon: Code, desc: "Version Ctrl", status: "SYNCED" },
  { name: "Bash", icon: Terminal, desc: "Shell Access", status: "READY" },
];

const Integrations: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="pb-32 bg-[#050505] relative border-t border-[#1A1A1A]">
      <SectionDivider 
        number="05" 
        title="Neural Links"
        subtitle="EXTERNAL_SYSTEM_HANDSHAKE"
      />

      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative h-32 bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#00F0FF]/50 transition-colors duration-300 overflow-hidden"
            >
              {/* Server Blade Handle (Visual) */}
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#151515] group-hover:bg-[#00F0FF] transition-colors duration-300" />
              
              {/* Scanline Background on Hover */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,240,255,0.05)_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

              <div className="relative h-full p-4 pl-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <tool.icon className="w-6 h-6 text-[#444] group-hover:text-[#00F0FF] transition-colors" />
                   <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-[#333] group-hover:bg-green-500 transition-colors" />
                      <div className="w-1 h-1 rounded-full bg-[#333] group-hover:bg-green-500 delay-75 transition-colors" />
                   </div>
                </div>

                <div>
                   <h4 className="text-white font-mono font-bold text-sm tracking-wider">{tool.name}</h4>
                   <div className="flex justify-between items-end mt-1">
                      <span className="text-[#555] text-[10px] uppercase font-mono">{tool.desc}</span>
                      <span className="text-[#00F0FF]/50 text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">[{tool.status}]</span>
                   </div>
                </div>
              </div>
              
              {/* Decorative screw heads */}
              <div className="absolute top-2 right-2 w-1 h-1 border border-[#333] rounded-full" />
              <div className="absolute bottom-2 right-2 w-1 h-1 border border-[#333] rounded-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;