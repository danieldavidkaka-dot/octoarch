import React from 'react';
import SectionDivider from './ui/SectionDivider';
import { useLanguage } from '../../utils/i18n';
// Importamos el hook que maneja la lógica
import { useTerminal } from '../hooks/useTerminal';
// Importamos los componentes visuales que te pasé antes
import TerminalVisuals from './terminal/TerminalVisuals';
import TerminalWindow from './terminal/TerminalWindow';

const TerminalDemo: React.FC = () => {
  const { t } = useLanguage();
  
  // Aquí invocamos al cerebro del frontend
  const terminalLogic = useTerminal();

  return (
    <section id="terminal" className="pb-32 bg-[#050505] relative overflow-hidden min-h-screen flex flex-col justify-center">
      <SectionDivider number="03" title={t.terminal.title} subtitle="DIRECT_KERNEL_ACCESS" />
      
      {/* Fondo ambiental */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-[#7AD7F0]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="flex flex-col gap-12 items-center justify-center relative">
          
          {/* 1. VISUALES (El Orbe y el Cable) */}
          <div className="scale-75 lg:scale-100 mb-[-2rem] z-0 opacity-80 hover:opacity-100 transition-opacity">
            <TerminalVisuals 
              isTyping={terminalLogic.isTyping} 
              isConnected={terminalLogic.isConnected} 
            />
          </div>

          {/* 2. VENTANA (La consola interactiva) */}
          <div className="w-full max-w-6xl z-20">
            {/* Pasamos todas las props del hook a la ventana */}
            <TerminalWindow 
              {...terminalLogic} 
            />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default TerminalDemo;