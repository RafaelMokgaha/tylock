
import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: 'cyan' | 'pink' | 'purple' | 'green' | 'red';
  fullWidth?: boolean;
  size?: 'sm' | 'md';
}

const NeonButton: React.FC<NeonButtonProps> = ({ children, color = 'cyan', fullWidth = false, size = 'md', ...props }) => {
  const colorClasses = {
    cyan: 'border-cyan-400 text-cyan-400 shadow-[0_0_5px_theme(colors.cyan.400),inset_0_0_5px_theme(colors.cyan.400)] hover:bg-cyan-400 hover:shadow-[0_0_20px_theme(colors.cyan.400)]',
    pink: 'border-pink-400 text-pink-400 shadow-[0_0_5px_theme(colors.pink.400),inset_0_0_5px_theme(colors.pink.400)] hover:bg-pink-400 hover:shadow-[0_0_20px_theme(colors.pink.400)]',
    purple: 'border-purple-400 text-purple-400 shadow-[0_0_5px_theme(colors.purple.400),inset_0_0_5px_theme(colors.purple.400)] hover:bg-purple-400 hover:shadow-[0_0_20px_theme(colors.purple.400)]',
    green: 'border-green-400 text-green-400 shadow-[0_0_5px_theme(colors.green.400),inset_0_0_5px_theme(colors.green.400)] hover:bg-green-400 hover:shadow-[0_0_20px_theme(colors.green.400)]',
    red: 'border-red-400 text-red-400 shadow-[0_0_5px_theme(colors.red.400),inset_0_0_5px_theme(colors.red.400)] hover:bg-red-400 hover:shadow-[0_0_20px_theme(colors.red.400)]'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base'
  };

  const baseClasses = 'bg-transparent border-2 rounded-md font-bold uppercase tracking-wider transition-all duration-300 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
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