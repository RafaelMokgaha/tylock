import React, { useState, useEffect, useCallback } from 'react';

// Define the shape of an emoji object
interface Emoji {
  id: number;
  x: number;
  y: number;
}

const DonationEmoji: React.FC = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  const handleClick = useCallback((event: MouseEvent) => {
    // Check if the click is on an interactive element to avoid interference
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [role="button"]')) {
      return;
    }

    const newEmoji: Emoji = {
      id: Date.now(),
      x: event.clientX,
      y: event.clientY,
    };

    // Add the new emoji to the state
    setEmojis(prevEmojis => [...prevEmojis, newEmoji]);

    // Set a timer to remove the emoji after its animation completes (3 seconds)
    setTimeout(() => {
      setEmojis(prevEmojis => prevEmojis.filter(emoji => emoji.id !== newEmoji.id));
    }, 3000); 

  }, []);

  useEffect(() => {
    // Add event listener when the component mounts
    document.addEventListener('click', handleClick);

    // Remove event listener when the component unmounts
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [handleClick]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
      {emojis.map(emoji => (
        <a
          key={emoji.id}
          href="https://pay.yoco.com/r/7vynxd"
          target="_blank"
          rel="noopener noreferrer"
          className="donation-emoji pointer-events-auto absolute text-4xl"
          style={{
            left: `${emoji.x}px`,
            top: `${emoji.y}px`,
            textShadow: '0 0 10px rgba(236, 72, 153, 0.9), 0 0 20px rgba(236, 72, 153, 0.7)',
          }}
          aria-label="Make a donation"
        >
          💖
        </a>
      ))}
    </div>
  );
};

export default DonationEmoji;
