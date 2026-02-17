import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/Card';
import SectionDivider from './ui/SectionDivider';
import { useLanguage } from '../../utils/i18n';

// Living Neural Mesh Component (Unchanged logic, cleaner integration)
const NeuralMesh: React.FC = () => {
  const nodes = useMemo(() => {
    const nodeCount = 12;
    return Array.from({ length: nodeCount }).map((_, i) => ({
      id: i,
      x: 50 + 40 * Math.cos((i * 2 * Math.PI) / nodeCount) + (Math.random() * 10 - 5),
      y: 50 + 35 * Math.sin((i * 2 * Math.PI) / nodeCount) + (Math.random() * 10 - 5),
      size: Math.random() * 2 + 1,
    }));
  }, []);

  const connections = useMemo(() => {
    const links: { x1: number, y1: number, x2: number, y2: number, id: string }[] = [];
    nodes.forEach((node, i) => {
      links.push({ x1: 50, y1: 50, x2: node.x, y2: node.y, id: `center-${i}` });
      const nextNode = nodes[(i + 1) % nodes.length];
      links.push({ x1: node.x, y1: node.y, x2: nextNode.x, y2: nextNode.y, id: `neighbor-${i}` });
    });
    return links;
  }, [nodes]);

  return (
    <div className="relative w-full aspect-square md:aspect-video bg-black rounded-sm border border-[#1A1A1A] overflow-hidden shadow-2xl group">
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,240,255,0.05)_360deg)] animate-[spin_8s_linear_infinite] opacity-50 pointer-events-none rounded-full scale-[1.5]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
      <svg className="w-full h-full relative z-10" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {connections.map((line, i) => (
          <motion.line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#00F0FF"
            strokeWidth="0.15"
            strokeOpacity="0.3"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: i * 0.05, ease: "easeInOut" }}
          />
        ))}
        {nodes.map((node, i) => (
          <motion.g key={`node-${i}`}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.size * 2}
              stroke="#00F0FF"
              strokeWidth="0.1"
              fill="transparent"
              strokeDasharray="1 1"
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill="#050505"
              stroke="#00F0FF"
              strokeWidth="0.3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            />
          </motion.g>
        ))}
      </svg>
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-pulse" />
           <span className="text-[9px] text-[#00F0FF] font-mono tracking-wider">HIVE_MIND_ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

const Architecture: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="architecture" className="pb-32 bg-[#050505] relative overflow-hidden flex flex-col items-center border-t border-[#1A1A1A]">
      <SectionDivider number="02" title={t.architecture.label.replace('// ', '')} subtitle="DISTRIBUTED_NET" />
      
      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
             <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-[#00F0FF] z-20" />
             <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-[#00F0FF] z-20" />
             <NeuralMesh />
          </motion.div>
        </div>

        <div className="order-1 lg:order-2 space-y-10">
          <div>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-white leading-tight">
              {t.architecture.title_swarm} <span className="text-[#7AD7F0] decoration-[#00F0FF]/30 underline underline-offset-8 decoration-2">{t.architecture.title_intelligence}</span>
            </h2>
            <p className="text-[#B0B0B0] text-lg leading-relaxed font-sans font-light text-sm border-l-2 border-[#333] pl-6 py-2">
              {t.architecture.description}
            </p>
          </div>

          <div className="space-y-4">
            {[
              { color: "bg-[#9D4EDD]", title: t.architecture.layer1, desc: "Multi-modal input ingestion (Code, Video, Audio)", id: "L1" },
              { color: "bg-[#7AD7F0]", title: t.architecture.layer2, desc: "Task sharding to specialized micro-agents", id: "L2" },
              { color: "bg-[#00F0FF]", title: t.architecture.layer3, desc: "Conflict resolution and output generation", id: "L3" }
            ].map((layer, i) => (
              <Card 
                key={i} 
                variant="outline" 
                hoverEffect 
                className="group border-l-2 border-l-transparent hover:border-l-[#00F0FF] hover:bg-[#1A1A1A]/50 transition-all duration-300"
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex flex-col items-center gap-1 mt-1.5">
                    <div className={`w-2 h-2 ${layer.color} rounded-full animate-pulse`} />
                    <div className="h-full w-[1px] bg-[#333] group-hover:bg-[#00F0FF]/30 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-[#FFFFFF] font-bold font-display uppercase tracking-wider text-sm">{layer.title}</div>
                      <div className="text-[10px] font-mono text-[#333] group-hover:text-[#00F0FF] transition-colors">{layer.id}</div>
                    </div>
                    <div className="text-[#B0B0B0] text-xs font-sans group-hover:text-white transition-colors">{layer.desc}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Architecture;