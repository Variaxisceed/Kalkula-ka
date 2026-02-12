import React from 'react';

interface ButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'danger';
  className?: string;
  double?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'default', className = '', double = false }) => {
  const baseStyles = "relative overflow-hidden rounded-2xl text-xl font-medium transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const variants = {
    default: "bg-slate-800 text-slate-200 hover:bg-slate-700 shadow-lg shadow-slate-900/20",
    primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/30",
    secondary: "bg-slate-700 text-slate-100 hover:bg-slate-600 shadow-lg shadow-slate-900/20",
    accent: "bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-900/30",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
  };

  const widthClass = double ? "col-span-2 aspect-[2.1/1]" : "aspect-square";

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center w-full h-full">
        {label}
      </span>
    </button>
  );
};