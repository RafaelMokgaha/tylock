
import React from 'react';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-cyan-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-cyan-500 after:shadow-[0_0_10px_theme(colors.cyan.500)]">
        {children}
    </h2>
);

const Bypass: React.FC = () => {
  return (
    <section className="bg-gray-800/50 p-8 rounded-lg border border-cyan-500/30 h-full flex flex-col">
      <SectionHeader>Game Bypass</SectionHeader>
      <div className="flex-grow flex flex-col justify-center items-center text-center">
        <p className="text-gray-300 max-w-md">
          Our bypass solutions for various games will be available here soon. Stay tuned for updates on how to enhance your gaming experience.
        </p>
      </div>
    </section>
  );
};

export default Bypass;
