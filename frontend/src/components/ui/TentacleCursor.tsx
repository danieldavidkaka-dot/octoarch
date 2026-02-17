import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const TentacleCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Configuration for the tentacle
  const SEGMENT_COUNT = 25;
  const segments = useRef(Array.from({ length: SEGMENT_COUNT }, () => ({ x: 0, y: 0 })));
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Initialize segments position on first move to prevent "flying in" from 0,0
      if (!isVisible) {
        segments.current = segments.current.map(() => ({ x: e.clientX, y: e.clientY }));
        setIsVisible(true);
      }

      // Check for hover targets
      const target = e.target as HTMLElement;
      const isHoverable = target.closest('button, a, input, [data-hoverable="true"], .cursor-pointer');
      setIsHovering(!!isHoverable);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  // Animation Loop for Physics
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      // Move head to mouse
      let targetX = mousePosition.x;
      let targetY = mousePosition.y;

      // Update each segment
      segments.current.forEach((segment, i) => {
        // Physics: Follow the leader (or mouse for the first one)
        // The speed factor (0.15) determines the "weight" or drag of the tentacle
        const dx = targetX - segment.x;
        const dy = targetY - segment.y;
        
        // Ease function
        segment.x += dx * 0.25;
        segment.y += dy * 0.25;

        // Set the target for the NEXT segment to be the CURRENT segment's new position
        targetX = segment.x;
        targetY = segment.y;

        // Direct DOM manipulation for maximum performance (bypassing React render cycle)
        const el = document.getElementById(`tentacle-seg-${i}`);
        if (el) {
          el.style.transform = `translate3d(${segment.x}px, ${segment.y}px, 0)`;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePosition]);

  if (typeof window === 'undefined') return null;

  return (
    <div 
      ref={cursorRef} 
      className={`fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* The Head (Target Reticle) */}
      <div 
        className="fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 border border-[#00F0FF] rounded-full transition-all duration-200 ease-out"
        style={{ 
          transform: `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale(${isHovering ? 1.5 : 1})`,
          backgroundColor: isHovering ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
          borderColor: isHovering ? '#00F0FF' : 'rgba(0, 240, 255, 0.5)'
        }}
      >
         <div className="absolute inset-0 bg-[#00F0FF] rounded-full opacity-20 animate-ping" />
      </div>

      {/* The Tentacle Body Segments */}
      {segments.current.map((_, i) => {
        // Calculate size based on index (tapering tail)
        const size = Math.max(2, 12 - (i * 0.4)); 
        const opacity = Math.max(0.1, 1 - (i / SEGMENT_COUNT));
        const color = i % 2 === 0 ? '#00F0FF' : '#9D4EDD'; // Alternating Cyber Colors

        return (
          <div
            key={i}
            id={`tentacle-seg-${i}`}
            className="fixed top-0 left-0 rounded-full bg-[#00F0FF] shadow-[0_0_5px_rgba(0,240,255,0.5)] will-change-transform"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              marginLeft: `-${size / 2}px`, // Center anchor
              marginTop: `-${size / 2}px`,
              opacity: opacity * 0.8,
              backgroundColor: color,
              zIndex: SEGMENT_COUNT - i // Head on top
            }}
          />
        );
      })}
    </div>
  );
};

export default TentacleCursor;