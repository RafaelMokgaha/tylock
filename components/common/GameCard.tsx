
import React from 'react';
import type { Game } from '../../types';
import NeonButton from './NeonButton';

interface GameCardProps {
  game: Game;
}

const StarIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);


const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-2">
      <img src={game.imageUrl} alt={game.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      
      {/* Neon border effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_15px_theme(colors.cyan.400),inset_0_0_10px_theme(colors.cyan.400/50%)]"></div>

      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 flex flex-col justify-end text-white">
        <div className="flex justify-between items-center mb-1">
          <span className="bg-cyan-500 text-black px-2 py-0.5 text-xs font-bold rounded">{game.genre}</span>
          <div className="flex items-center space-x-1">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-sm">{game.rating}</span>
          </div>
        </div>
        <h3 className="font-bold text-base md:text-lg leading-tight truncate">{game.title}</h3>

        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
          <NeonButton size="sm" fullWidth color="cyan">Play</NeonButton>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
