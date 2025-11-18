
import React, { useState } from 'react';
import NeonButton from './common/NeonButton';
import HeartIcon from './icons/HeartIcon';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-pink-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-pink-500 after:shadow-[0_0_10px_theme(colors.pink.500)]">
        {children}
    </h2>
);

// Define a type for the floating emojis
interface Emoji {
    id: number;
    char: string;
    x: number;
    y: number;
}

const Appreciation: React.FC = () => {
    const [emojis, setEmojis] = useState<Emoji[]>([]);

    const handleDonateClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Spawning from the center of the button for better visual effect
        const x = rect.width / 2;
        const y = rect.height / 2;

        const newEmoji: Emoji = {
            id: Date.now(),
            char: '❤️',
            x,
            y,
        };

        setEmojis(prev => [...prev, newEmoji]);

        // Remove the emoji after the animation ends (3s)
        setTimeout(() => {
            setEmojis(prev => prev.filter(emoji => emoji.id !== newEmoji.id));
        }, 3000);
    };

    return (
        <section className="bg-gray-800/50 p-6 sm:p-8 rounded-lg border border-pink-500/30 w-full max-w-3xl mx-auto text-center">
            <SectionHeader>Show Your Appreciation</SectionHeader>
            <HeartIcon className="w-20 h-20 text-pink-400 mx-auto mb-6 drop-shadow-[0_0_10px_theme(colors.pink.400)]" />
            
            <p className="text-gray-300 text-lg mb-4">
                Thank you for being a part of our community!
            </p>
            <p className="text-gray-400 mb-8">
                Your support helps us cover server costs, acquire new games, and keep this service running. Every little bit helps and is greatly appreciated. If you find our service valuable, please consider making a donation.
            </p>

            <div className="relative inline-block">
                <a 
                    href="https://pay.yoco.com/r/7vynxd"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleDonateClick}
                    className="inline-block" // Needed for the relative positioning of emojis
                >
                    <NeonButton color="pink" size="md">
                        <div className="flex items-center gap-3">
                            <HeartIcon className="w-6 h-6" />
                            <span>Donate Now</span>
                        </div>
                    </NeonButton>
                </a>
                {/* Floating Emojis Container */}
                {emojis.map(emoji => (
                    <span
                        key={emoji.id}
                        className="donation-emoji absolute text-2xl select-none pointer-events-none"
                        style={{
                            left: `${emoji.x}px`,
                            top: `${emoji.y}px`,
                        }}
                        aria-hidden="true"
                    >
                        {emoji.char}
                    </span>
                ))}
            </div>

            <div className="mt-12 text-left bg-black/20 p-4 rounded-lg border border-purple-500/20">
                <h3 className="font-bold text-purple-300 text-lg mb-3">What your donation supports:</h3>
                <ul className="space-y-2 text-gray-300 list-disc list-inside">
                    <li>High-speed servers for fast downloads.</li>
                    <li>Acquiring new and requested game titles.</li>
                    <li>Ongoing website maintenance and development.</li>
                    <li>Community management and support.</li>
                </ul>
            </div>
        </section>
    );
};

export default Appreciation;
