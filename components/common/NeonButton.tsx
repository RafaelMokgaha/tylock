
import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: 'cyan' | 'pink' | 'purple' | 'green' | 'red';
  fullWidth?: boolean;
  size?: 'sm' | 'md';
}

const NeonButton: React.FC<NeonButtonProps> = ({ children, color = 'red', fullWidth = false, size = 'md', ...props }) => {
  const colorClasses: Record<string, string> = {
    cyan: 'bg-red-600 hover:bg-red-500 text-white border-transparent',
    pink: 'bg-red-600 hover:bg-red-500 text-white border-transparent',
    purple: 'bg-red-600 hover:bg-red-500 text-white border-transparent',
    green: 'bg-red-600 hover:bg-red-500 text-white border-transparent',
    red: 'bg-red-600 hover:bg-red-500 text-white border-transparent',
    orange: 'bg-red-600 hover:bg-red-500 text-white border-transparent',
    amber: 'bg-red-600 hover:bg-red-500 text-white border-transparent',
    blue: 'bg-red-600 hover:bg-red-500 text-white border-transparent',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base'
  };

  const baseClasses = 'border-2 rounded-lg font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${colorClasses[color]} ${sizeClasses[size]} ${widthClass}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default NeonButton;