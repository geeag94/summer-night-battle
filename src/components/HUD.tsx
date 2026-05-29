import React from 'react';

interface HUDProps {
  timeLeft: number;
  score: number;
  itchLevel: number;
}

export const HUD: React.FC<HUDProps> = ({ timeLeft, score, itchLevel }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center gap-6">
        <div className="font-galmu text-xl text-yellow-400">
          TIME: {Math.ceil(timeLeft)}s
        </div>
        <div className="font-galmu text-xl text-green-400">
          KILL: {score}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-galmu text-sm text-gray-400">가려움 지수:</span>
        <div className="w-32 h-4 bg-gray-800 rounded overflow-hidden border border-white/20">
          <div 
            className="h-full bg-red-500 transition-all duration-300 ease-out"
            style={{ width: `${Math.min(itchLevel, 100)}%` }}
          />
        </div>
        <span className="font-galmu text-lg text-red-400 w-12 text-right">{itchLevel}%</span>
      </div>
    </div>
  );
};
