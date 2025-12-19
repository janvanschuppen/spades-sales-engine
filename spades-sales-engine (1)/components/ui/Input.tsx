import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-zinc-400 mb-1">{label}</label>}
      <input
        className={`
          w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white 
          placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20
          transition-all duration-200
          ${error ? 'border-red-500/50 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-[10px] text-red-400">{error}</p>}
    </div>
  );
};