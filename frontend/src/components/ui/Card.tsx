import React, { useRef, useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'glass' | 'cyber' | 'outline';
  hoverEffect?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ 
  variant = 'default', 
  hoverEffect = false,
  className = '', 
  children, 
  ...props 
}, ref) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  // Increased base border opacity from white/10 to white/20 for definition
  // Added ring-1 ring-black/50 to sharpen the edge against the background
  const baseStyles = "relative rounded-xl overflow-hidden transition-all duration-500 border ring-1 ring-black/50 backdrop-blur-sm group force-sharp";
  
  const variants = {
    default: "bg-[#0A0A0A] border-white/15",
    glass: "bg-black/40 backdrop-blur-xl border-white/15 shadow-2xl",
    cyber: "bg-[#050505]/95 border-white/20 shadow-[0_0_0_1px_rgba(0,0,0,1)]",
    outline: "bg-transparent border-white/10 hover:border-white/20",
  };

  const hoverStyles = hoverEffect ? "hover:-translate-y-1 hover:shadow-lg hover:shadow-[#00F0FF]/5" : "";

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {/* Spotlight Effect Layer - Increased brightness */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-10"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(0, 240, 255, 0.08), transparent 40%)`
        }}
      />
      
      {/* Border Spotlight Layer - Sharper gradient */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-20"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(0, 240, 255, 0.6), transparent 40%)`,
          maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          WebkitMaskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px' // This defines border width
        }}
      />

      {/* Cyber Variant Extras - Crisp lines */}
      {variant === 'cyber' && (
        <>
          <div className="absolute top-0 left-0 w-6 h-6 border-t-[1px] border-l-[1px] border-[#00F0FF]/0 group-hover:border-[#00F0FF] transition-colors duration-300 rounded-tl-xl opacity-0 group-hover:opacity-100" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[1px] border-r-[1px] border-[#00F0FF]/0 group-hover:border-[#00F0FF] transition-colors duration-300 rounded-br-xl opacity-0 group-hover:opacity-100" />
        </>
      )}

      <div className="relative z-30 h-full">
        {children}
      </div>
    </motion.div>
  );
});

Card.displayName = "Card";

// Re-export subcomponents unchanged
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={`text-xl font-display font-bold tracking-tight text-white leading-none drop-shadow-sm ${className}`} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={`text-sm text-[#B0B0B0] font-sans leading-relaxed ${className}`} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardDescription, CardContent };