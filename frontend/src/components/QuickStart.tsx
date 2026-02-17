import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Terminal, Box, ChevronRight } from 'lucide-react';
import SectionDivider from './ui/SectionDivider';
import { useLanguage } from '../../utils/i18n';

const installMethods = [
  { id: 'curl', label: 'cURL', cmd: 'curl -fsSL https://octoarch.sh/install | bash', icon: Terminal },
  { id: 'docker', label: 'Docker', cmd: 'docker run -d -p 8080:8080 octoarch/core', icon: Box },
  { id: 'npx', label: 'NPX', cmd: 'npx octoarch-init@latest', icon: ChevronRight },
];

const QuickStart: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(installMethods[activeTab].cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 bg-[#050505] relative overflow-hidden">
      <SectionDivider number="02" title={t.quickstart.title} subtitle="IMMEDIATE_DEPLOYMENT" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
           <p className="text-[#B0B0B0] font-sans text-sm max-w-xl mx-auto">
             {t.quickstart.subtitle}
           </p>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.05)] ring-1 ring-white/5">
          {/* Terminal Header / Tabs */}
          <div className="flex items-center border-b border-[#1F1F1F] bg-[#0F0F0F]">
            {installMethods.map((method, idx) => (
              <button
                key={method.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-6 py-3 text-xs font-mono transition-all relative ${
                  activeTab === idx 
                    ? 'text-[#00F0FF] bg-[#1A1A1A]' 
                    : 'text-[#666] hover:text-white hover:bg-[#151515]'
                }`}
              >
                <method.icon className="w-3 h-3" />
                {method.label}
                {activeTab === idx && (
                  <motion.div 
                    layoutId="tab-highlight"
                    className="absolute top-0 left-0 w-full h-[2px] bg-[#00F0FF]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Terminal Body */}
          <div className="p-8 relative group">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-sm md:text-base flex items-center gap-3"
              >
                <span className="text-[#00F0FF] select-none">$</span>
                <span className="text-[#E0E0E0]">{installMethods[activeTab].cmd}</span>
                <span className="w-2 h-4 bg-[#00F0FF] animate-pulse ml-1" />
              </motion.div>
            </AnimatePresence>

            <button
              onClick={handleCopy}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-md bg-[#1A1A1A] border border-[#333] text-[#B0B0B0] hover:text-[#00F0FF] hover:border-[#00F0FF] transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="bg-[#080808] px-4 py-2 border-t border-[#1F1F1F] flex justify-between items-center">
             <div className="flex gap-4">
               <span className="text-[10px] text-[#444] font-mono">OS: UNIVERSAL</span>
               <span className="text-[10px] text-[#444] font-mono">ARCH: AMD64/ARM64</span>
             </div>
             <span className="text-[10px] text-[#00F0FF]/50 font-mono">READY_TO_INJECT</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickStart;