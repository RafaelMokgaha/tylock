import React from 'react';
import NeonButton from './common/NeonButton';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-purple-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-purple-500 after:shadow-[0_0_10px_theme(colors.purple.500)]">
        {children}
    </h2>
);

const BEAMNG_IMAGE_URL = 'https://static.wixstatic.com/media/d0b81f_bc779c07042c4d77a0f3ae1e42328303~mv2.jpg';

const OnlineFix: React.FC = () => {
  return (
    <section className="bg-gray-800/50 p-8 rounded-lg border border-purple-500/30 w-full max-w-4xl mx-auto">
      <SectionHeader>Online Fix</SectionHeader>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="group relative">
            <img 
                src={BEAMNG_IMAGE_URL} 
                alt="BeamNG.drive cover" 
                className="rounded-lg w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-purple-500 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_20px_theme(colors.purple.500)]"></div>
        </div>
        <div className="flex flex-col h-full justify-center">
          <div>
            <h3 className="text-4xl font-bold text-white mb-2">BeamNG.drive</h3>
            <p className="text-gray-300 text-lg mb-6">
              A dynamic soft-body physics vehicle simulator. Get the latest online fix here.
            </p>
          </div>
          <div className="mt-auto">
            <a 
              href="https://transfer.it/t/nSiyCF9VQR6Q" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <NeonButton color="purple" fullWidth>
                Download
              </NeonButton>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnlineFix;
