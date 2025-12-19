import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading,
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide";
  
  const variants = {
    // Primary: In dark mode, white button. In light mode, black button.
    primary: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-transparent shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]",
    
    // Secondary: Gray button
    secondary: "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 border border-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:border-zinc-700",
    
    // Outline: Transparent with border
    outline: "bg-transparent text-zinc-700 border border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white",
    
    // Ghost: Transparent no border
    ghost: "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/50",
    
    // Danger: Red
    danger: "bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 dark:text-red-500",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-[10px]", 
    md: "px-4 py-1.5 text-xs", 
    lg: "px-5 py-2 text-sm", 
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      ) : children}
    </button>
  );
};