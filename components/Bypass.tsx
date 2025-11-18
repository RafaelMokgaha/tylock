import React from 'react';

const BYPASS_ITEMS = [
    { name: 'Ubisoft', imageUrl: 'https://static.wixstatic.com/media/a827d0_a181483e35c94c21aaa99d3b4b49f96f~mv2.png', view: 'ubisoftBypass' as const },
    { name: 'EA Games', imageUrl: 'https://static.wixstatic.com/media/a827d0_cdfebc74ebc24f0c880ef1dad2e2f1af~mv2.png', view: 'eaBypass' as const },
    { name: 'Rockstar Games', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Rockstar_Games_Logo.svg/2048px-Rockstar_Games_Logo.svg.png', view: 'rockstarBypass' as const },
    { name: 'Other Games', imageUrl: 'https://static.wixstatic.com/media/a827d0_63a9a9adf9094dbab41b33de9bc78976~mv2.png', view: 'otherBypass' as const },
];

interface BypassProps {
    onNavigate: (view: 'ubisoftBypass' | 'eaBypass' | 'rockstarBypass' | 'otherBypass') => void;
}

const Bypass: React.FC<BypassProps> = ({ onNavigate }) => {
    return (
        <section className="w-full flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-cyan-500 after:shadow-[0_0_10px_theme(colors.cyan.500)]">
                Request a Bypass
            </h2>
            <p className="text-gray-400 mb-12 text-center max-w-2xl">Select a category to view available bypasses or to request a new one.</p>
            <div className="grid grid-cols-2 gap-8 md:gap-16 max-w-4xl w-full">
                {BYPASS_ITEMS.map((item) => (
                    <div 
                        key={item.name} 
                        onClick={() => item.view && onNavigate(item.view)}
                        className={`group transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 ${item.view ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                        <img 
                            src={item.imageUrl} 
                            alt={`${item.name} Bypass`}
                            className="w-full h-auto filter group-hover:drop-shadow-[0_0_15px_theme(colors.cyan.400)] transition-all duration-300"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Bypass;