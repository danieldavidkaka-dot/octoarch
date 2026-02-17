import React, { useState } from 'react';
import Preloader from './src/components/Preloader';
import Navbar from './src/components/Navbar';
import Hero from './src/components/Hero';
import LogoWall from './src/components/LogoWall';
import QuickStart from './src/components/QuickStart';
import Capabilities from './src/components/Capabilities';
import Architecture from './src/components/Architecture';
import Benchmarks from './src/components/Benchmarks';
import TerminalDemo from './src/components/TerminalDemo';
import Testimonials from './src/components/Testimonials';
import Integrations from './src/components/Integrations';
import Pricing from './src/components/Pricing';
import TentacleCursor from './src/components/ui/TentacleCursor';
import { AnimatePresence } from 'framer-motion';
import { useLanguage } from './utils/i18n';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        // Changed bg-[#050505] to bg-[#020202] for deeper blacks and higher contrast
        <main className="relative min-h-screen bg-[#020202] text-white selection:bg-[#00F0FF] selection:text-black">
          <TentacleCursor />
          <Navbar />
          <Hero />
          <LogoWall />
          <QuickStart />
          <Capabilities />
          <Architecture />
          <TerminalDemo />
          <Testimonials />
          <Benchmarks />
          <Integrations />
          <Pricing />
          
          <footer className="py-8 bg-[#020202] border-t border-white/10 text-center text-[#808080] text-xs font-mono">
            <p>© 2026 OctoArch Systems Inc. {t.capabilities.status}</p>
          </footer>
        </main>
      )}
    </>
  );
};

export default App;