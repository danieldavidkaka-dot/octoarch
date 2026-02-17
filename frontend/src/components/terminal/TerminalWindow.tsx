import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Wifi, Cpu, Activity, Minus, Square, X, Lock, GitBranch, ChevronRight, HardDrive } from 'lucide-react';
// Asegúrate de que esta ruta apunte correctamente a tu componente Card
import { Card } from '../ui/Card'; 
// Importamos la interfaz Log desde el hook
import { Log } from '../../hooks/useTerminal';

interface TerminalWindowProps {
  logs: Log[];
  input: string;
  setInput: (val: string) => void;
  handleCommand: (e: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isTyping: boolean;
  isConnected: boolean;
  setLogs: React.Dispatch<React.SetStateAction<Log[]>>;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({ 
  logs, input, setInput, handleCommand, handleKeyDown, isTyping, isConnected, setLogs 
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al recibir nuevos mensajes
  useEffect(() => {
    if (!isMinimized) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [logs, isTyping, isMinimized]);

  const focusInput = () => {
    if (!isMinimized) inputRef.current?.focus();
  };

  const renderLogContent = (text: string, type: Log['type']) => {
    // Regex para colorear IPs, porcentajes, corchetes, etc.
    const parts = text.split(/(\[.*?\]|\d+\.\d+\.\d+\.\d+|#\w+|\d+%|\d+GB|\d+Gbps)/g);
    return (
      <span className="leading-relaxed tracking-wide">
        {parts.map((part, i) => {
          if (part.startsWith('[') && part.endsWith(']')) return <span key={i} className="text-[#9D4EDD] font-bold">{part}</span>;
          if (part.match(/^\d+\.\d+\.\d+\.\d+$/)) return <span key={i} className="text-yellow-400 font-mono">{part}</span>; 
          if (part.startsWith('#')) return <span key={i} className="text-orange-400 font-bold">{part}</span>; 
          if (part.match(/\d+%/)) return <span key={i} className="text-[#00F0FF]">{part}</span>; 
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <motion.div
      className="flex-1 w-full relative z-20 shadow-[0_0_50px_rgba(0,240,255,0.05)]"
      animate={{ height: isMinimized ? '60px' : '700px' }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <Card variant="cyber" className="w-full bg-[#050505]/95 backdrop-blur-2xl border border-[#333] shadow-2xl overflow-hidden flex flex-col h-full ring-1 ring-white/10 rounded-xl">
        
        {/* HEADER BAR */}
        <div 
          className="flex items-center justify-between px-6 py-4 bg-[#0F0F0F] border-b border-[#2A2A2A] select-none cursor-pointer group hover:bg-[#141414] transition-colors"
          onDoubleClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-6">
            <div className="flex gap-2.5 group-hover:gap-3 transition-all duration-300">
              <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-sm hover:brightness-110 cursor-pointer flex items-center justify-center text-[8px] text-black/80 opacity-0 hover:opacity-100 font-bold" onClick={() => setLogs([])}><X className="w-2 h-2"/></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-sm hover:brightness-110 cursor-pointer flex items-center justify-center text-[8px] text-black/80 opacity-0 hover:opacity-100 font-bold" onClick={() => setIsMinimized(true)}><Minus className="w-2 h-2"/></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-sm hover:brightness-110 cursor-pointer flex items-center justify-center text-[8px] text-black/80 opacity-0 hover:opacity-100 font-bold" onClick={() => setIsMinimized(false)}><Square className="w-2 h-2"/></div>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-[#333] ml-2">
              <Terminal className="w-4 h-4 text-[#00F0FF]" />
              <span className="text-sm font-mono text-[#E0E0E0] font-medium tracking-wider">root — octoarch — zsh</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-mono text-[#666]">
            <div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> SSH-2.0</div>
            <div className="flex items-center gap-2 text-[#00F0FF]"><GitBranch className="w-3.5 h-3.5" /> main*</div>
          </div>
        </div>

        {/* TERMINAL BODY */}
        <div 
          className={`flex-1 flex overflow-hidden font-mono text-base transition-opacity duration-300 ${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
          onClick={focusInput}
        >
          {/* LINE NUMBERS */}
          <div className="w-16 bg-[#080808] border-r border-[#222] text-[#444] text-right py-6 pr-4 select-none flex flex-col gap-1 font-mono text-xs overflow-hidden">
              {Array.from({ length: Math.max(logs.length + 5, 25) }).map((_, i) => (
                <div key={i} className="leading-relaxed h-7">{i + 1}</div>
              ))}
          </div>

          {/* LOGS AREA */}
          <div className="flex-1 p-6 overflow-y-auto scroll-smooth cursor-text relative bg-[#030303] scrollbar-thin scrollbar-thumb-[#222] scrollbar-track-transparent">
            {/* Grid de fondo sutil */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,240,255,0.02),rgba(0,240,255,0.01),rgba(157,78,221,0.02))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-40 z-0" />
            
            <div className="relative z-10 space-y-2">
              <AnimatePresence mode="popLayout">
                {logs.map((log) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={log.id} 
                    className="flex gap-4 leading-relaxed group hover:bg-[#111] -mx-6 px-6 py-1 min-h-[1.75rem]"
                  >
                    <span className="text-[#444] select-none text-xs mt-[5px] w-24 shrink-0 font-mono">{log.timestamp}</span>
                    <div className="flex-1 break-all font-medium">
                      {log.sender === 'user' ? (
                          <span className="text-white font-bold flex gap-3">
                            <span className="text-[#00F0FF] animate-pulse">❯</span>
                            {log.text}
                          </span>
                      ) : (
                          <span className={
                            log.type === 'error' ? 'text-red-400' : 
                            log.type === 'success' ? 'text-green-400' : 
                            log.type === 'warning' ? 'text-yellow-400' : 
                            log.type === 'system' ? 'text-[#00F0FF] font-bold' : 
                            'text-[#C0C0C0]'
                          }>
                            {log.type === 'success' && <span className="mr-3 font-bold">✓</span>}
                            {log.type === 'error' && <span className="mr-3 font-bold">✕</span>}
                            {log.type === 'warning' && <span className="mr-3 font-bold">⚠</span>}
                            {log.type === 'system' && <span className="mr-3 font-bold"><HardDrive className="inline w-4 h-4 mb-1"/></span>} 
                            {log.type === 'info' && <span className="mr-3 inline-block filter hue-rotate-[190deg] brightness-125 saturate-[1.2] drop-shadow-[0_0_5px_#00F0FF]">🐙</span>}
                            {renderLogContent(log.text, log.type)}
                          </span>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 px-6 py-2">
                        <span className="text-[#333] text-xs mt-[5px] w-24">...</span>
                        <span className="text-[#00F0FF]/70 text-sm animate-pulse flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-bounce" />
                           System processing request...
                        </span>
                    </motion.div>
                )}
              </AnimatePresence>
              
              {/* INPUT AREA */}
              <form onSubmit={handleCommand} className="flex gap-4 mt-4 px-0 group relative items-center py-2">
                <span className="text-[#333] select-none text-xs w-24 shrink-0 font-mono flex justify-end pr-1 pt-1">
                    <ChevronRight className="w-5 h-5 text-[#00F0FF] animate-pulse" />
                </span>
                <div className="flex-1 relative flex items-center">
                    <span className="text-[#00F0FF] mr-3 font-bold select-none whitespace-nowrap hidden md:inline text-lg">root@octoarch:~#</span>
                    <div className="relative flex-1">
                      <input 
                        ref={inputRef}
                        type="text" 
                        value={input} 
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent outline-none text-[#E0E0E0] border-none p-0 m-0 font-mono text-lg caret-transparent focus:ring-0 placeholder-[#333]" 
                        autoComplete="off"
                        autoFocus={!isMinimized}
                        spellCheck={false}
                      />
                      <motion.div 
                        className="absolute bg-[#00F0FF] pointer-events-none mix-blend-difference shadow-[0_0_10px_#00F0FF]"
                        style={{ left: `${input.length}ch`, top: '4px', height: '20px', width: '12px' }}
                        animate={{ opacity: [1, 1, 0, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }}
                      />
                    </div>
                </div>
              </form>
              <div ref={bottomRef} className="h-8" />
            </div>
          </div>
        </div>

        {/* FOOTER BAR */}
        <div className={`bg-[#0A0A0A] border-t border-[#2A2A2A] px-6 py-2 flex justify-between items-center text-[11px] font-mono text-[#666] select-none transition-opacity duration-200 ${isMinimized ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex gap-8">
                <div className="flex items-center gap-2 hover:text-[#00F0FF] transition-colors cursor-help" title="Latency">
                    <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                    <span>{isConnected ? '14ms' : 'OFFLINE'}</span>
                </div>
                <div className="flex items-center gap-2 hover:text-[#00F0FF] transition-colors cursor-help" title="CPU Load">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>12%</span>
                </div>
                <div className="flex items-center gap-2 hover:text-[#00F0FF] transition-colors cursor-help" title="Memory Usage">
                    <Activity className="w-3.5 h-3.5" />
                    <span>12.4GB</span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <span className="hover:text-white transition-colors">UTF-8</span>
                <span className="hover:text-white transition-colors">Ln {logs.length + 1}, Col {input.length + 1}</span>
                <div className="flex items-center gap-2 text-[#00F0FF] font-bold">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00F0FF] animate-pulse shadow-[0_0_8px_#00F0FF]' : 'bg-red-500'}`} />
                    <span className={isConnected ? 'text-[#00F0FF]' : 'text-red-500'}>{isConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}</span>
                </div>
            </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default TerminalWindow;