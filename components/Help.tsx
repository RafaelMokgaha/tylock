import React from 'react';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-green-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-green-500 after:shadow-[0_0_10px_theme(colors.green.500)]">
        {children}
    </h2>
);

const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => (
    <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">{question}</h3>
        <p className="text-gray-400">{children}</p>
    </div>
);

const Help: React.FC = () => {
  return (
    <section className="bg-gray-800/50 p-8 rounded-lg border border-green-500/30 w-full">
      <SectionHeader>Help &amp; Support</SectionHeader>
      <div>
        <FaqItem question="How do I request a game?">
          Navigate back to the home screen and click the "Request Game" button. Fill out the form with the name of the game you'd like to see added, and we'll look into it.
        </FaqItem>
        <FaqItem question="What is an Online Fix?">
          An Online Fix is a patch or solution that allows you to play certain games online with friends. You can find available fixes in the "Online Fix" section.
        </FaqItem>
        <FaqItem question="How does the Game Bypass work?">
          The "Bypass" section provides solutions to get around certain game-specific limitations. Please follow the instructions provided for each bypass carefully.
        </FaqItem>
        <FaqItem question="How can I contact support?">
          For further assistance, you can use the "Message" feature in the header to send us a direct message. We'll get back to you as soon as possible.
        </FaqItem>
      </div>
    </section>
  );
};

export default Help;
