import React from 'react';
import NeonButton from './common/NeonButton';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-green-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-green-500 after:shadow-[0_0_10px_theme(colors.green.500)]">
        {children}
    </h2>
);

const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => (
    <div className="mb-6 border-b border-green-500/20 pb-6">
        <h3 className="text-xl font-semibold text-white mb-2">{question}</h3>
        <div className="text-gray-400">{children}</div>
    </div>
);

const Help: React.FC = () => {
  return (
    <section className="bg-gray-800/50 p-6 sm:p-8 rounded-lg border border-green-500/30 w-full">
      <SectionHeader>Help &amp; Support</SectionHeader>
      <div>
        <FaqItem question="Installation Instructions">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-purple-300">Step 1: Download SteamTools</h4>
                    <p>
                        SteamTools is required to run all games from our collection. Download it first before requesting any games.
                    </p>
                    <a 
                        href="https://transfer.it/t/bhNi3kpzEBBT" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block mt-2 font-bold text-cyan-400 hover:text-cyan-300 transition-colors underline"
                    >
                        Download SteamTools
                    </a>
                </div>
                <div>
                    <h4 className="font-semibold text-purple-300">Step 2: Request a Game</h4>
                    <p>
                        Use the "Request Game" button on the home screen to ask for a game. Once approved, it will appear in your Library.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold text-purple-300">Step 3: Watch the Tutorial</h4>
                    <p>
                        Follow our video tutorial for a step-by-step guide on installation and setup.
                    </p>
                    <div className="relative mt-4 overflow-hidden rounded-lg border-2 border-cyan-500/30 shadow-[0_0_15px_theme(colors.cyan.500/50%)]" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                            src="https://streamable.com/e/hmzsr5"
                            frameBorder="0"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                            title="Installation Tutorial"
                        ></iframe>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-purple-300">Step 4: Join our Discord Community</h4>
                    <p>
                        For live support, community chat, and the latest announcements, join our Discord server.
                    </p>
                    <a 
                        href="https://discord.gg/tsewTXX2Sk" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block mt-2"
                    >
                        <NeonButton color="purple">Join Discord</NeonButton>
                    </a>
                </div>
            </div>
        </FaqItem>
        <FaqItem question="How do I request a game?">
          After installing SteamTools, navigate to the home screen and click the "Request Game" button. Fill out the form, and once approved, the game will be available in your Library.
        </FaqItem>
        <FaqItem question="What is an Online Fix?">
          An Online Fix is a patch or solution that allows you to play certain games online with friends. You can find available fixes in the "Online Fix" section.
        </FaqItem>
        <FaqItem question="How does the Game Bypass work?">
          The "Bypass" section provides solutions to get around certain game-specific limitations. Please follow the instructions provided for each bypass carefully.
        </FaqItem>
        <FaqItem question="How can I contact support?">
          <div className="space-y-4">
                <p>
                    For direct support from an admin, you can use the "Message" feature in the header to send us a direct message. We'll get back to you as soon as possible.
                </p>
                <p>
                    For faster community-based support and general discussion, we highly recommend joining our Discord server.
                </p>
                <a 
                    href="https://discord.gg/tsewTXX2Sk" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-2"
                >
                    <NeonButton color="purple">Join Discord Server</NeonButton>
                </a>
            </div>
        </FaqItem>
      </div>
    </section>
  );
};

export default Help;