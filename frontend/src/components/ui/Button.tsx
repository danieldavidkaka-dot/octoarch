import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'neon' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'default' | 'cyber' | 'pill';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'neon', 
  size = 'md', 
  shape = 'default',
  isLoading = false, 
  icon,
  children, 
  className = '',
  ...props 
}) => {
  
  // Design Tokens - Icy Blue (#7AD7F0), Neon Cyan (#00F0FF)
  // Added backdrop-blur and precise borders for sharpness
  const baseStyles = "relative inline-flex items-center justify-center font-mono font-bold transition-all duration-300 overflow-hidden group tracking-wide";
  
  const variants = {
    // Primary Action - Sharper shadow, cleaner text
    neon: "bg-[#7AD7F0] text-[#000000] border border-[#00F0FF] hover:bg-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] hover:border-white",
    // Secondary Action - Higher contrast border (white/20 instead of dark blue/50)
    outline: "bg-transparent backdrop-blur-md text-[#7AD7F0] border border-white/20 hover:border-[#00F0FF] hover:text-[#00F0FF] hover:bg-[#00F0FF]/10 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]",
    // Ghost
    ghost: "bg-transparent text-[#B0B0B0] hover:text-[#00F0FF] hover:bg-white/5",
    // Danger
    danger: "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-black hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const shapes = {
    default: "rounded-lg",
    pill: "rounded-full",
    cyber: "rounded-none [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${shapes[shape]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {/* Scanline effect for Cyber variant */}
      {variant === 'neon' && (
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.8)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat group-hover:bg-[position:-200%_0,0_0] transition-[background-position] duration-[1500ms]" />
      )}

      <span className="relative z-10 flex items-center gap-2">
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && icon && <span className="group-hover:translate-x-1 transition-transform duration-300">{icon}</span>}
        {children}
      </span>
      
      {/* Corner accents for Cyber Outline - Thinner and crisper */}
      {shape === 'cyber' && variant === 'outline' && (
        <>
          <span className="absolute top-0 left-0 w-2 h-2 border-t-[1px] border-l-[1px] border-[#00F0FF] opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b-[1px] border-r-[1px] border-[#00F0FF] opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
      )}
    </motion.button>
  );
};

export default Button;