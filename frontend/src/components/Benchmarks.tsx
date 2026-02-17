import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import SectionDivider from './ui/SectionDivider';
import { useLanguage } from '../../utils/i18n';

const data = [
  { name: 'GPT-4o', score: 85 },
  { name: 'Claude 3.5', score: 88 },
  { name: 'Llama 3', score: 72 },
  { name: 'OctoArch', score: 98 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 backdrop-blur border border-[#00F0FF] p-3 text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.2)]">
        <div className="flex items-center gap-2 mb-1">
             <div className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-pulse" />
             <span className="text-[#00F0FF] uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-white text-lg font-bold">{payload[0].value}% <span className="text-[#7AD7F0] text-[10px] font-normal">ACCURACY</span></p>
      </div>
    );
  }
  return null;
};

const Benchmarks: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="benchmarks" className="pb-24 bg-[#050505] border-t border-[#1A1A1A]">
      <SectionDivider number="04" title={t.benchmarks.title} subtitle="COMPARATIVE_ANALYSIS" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <p className="text-[#B0B0B0] font-mono text-sm max-w-xl">
              {t.benchmarks.subtitle}
            </p>
          </div>
          <div className="text-right">
             <div className="text-4xl font-bold text-[#00F0FF] font-mono">98.2%</div>
             <div className="text-xs text-[#7AD7F0] uppercase tracking-widest font-mono">{t.benchmarks.metric}</div>
          </div>
        </div>

        <Card variant="glass" className="w-full bg-[#121212]/60 border-[#1A1A1A] overflow-visible relative">
           <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#00F0FF] z-20" />
           <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#00F0FF] z-20" />
           <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#00F0FF] z-20" />
           <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#00F0FF] z-20" />

          <CardHeader className="border-b border-[#333] pb-4 mb-4 flex flex-row items-center justify-between">
             <CardTitle className="text-sm uppercase tracking-widest text-[#00F0FF] font-mono">{t.benchmarks.chart_title}</CardTitle>
             <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-[#333]" />)}
             </div>
          </CardHeader>
          <CardContent className="h-[400px] relative">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#B0B0B0', fontSize: 12, fontFamily: 'monospace' }} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{fill: 'rgba(0,240,255,0.05)'}} 
                />
                <Bar dataKey="score" radius={[2, 2, 0, 0]} animationDuration={2000}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'OctoArch' ? '#00F0FF' : '#262626'} 
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Benchmarks;