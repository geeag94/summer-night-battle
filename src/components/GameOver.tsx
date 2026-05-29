import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameOverProps {
  isOpen: boolean;
  score: number;
  itchLevel: number;
  onRestart: () => void;
}

const messages = [
  { threshold: 0, text: "내일 아침 헌혈 확정", sub: "모기가 너무 행복해합니다" },
  { threshold: 30, text: "피부과 예약 필수", sub: "스테로이드 주사가 필요해 보입니다" },
  { threshold: 60, text: "살짝 간지러움", sub: "묘한 성취감이 느껴집니다" },
  { threshold: 90, text: "모기 학살자", sub: "당신은 이 여름의 영웅입니다" },
];

export const GameOver: React.FC<GameOverProps> = ({ isOpen, score, itchLevel, onRestart }) => {
  const message = [...messages].reverse().find(m => itchLevel >= m.threshold) || messages[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-gray-900 border-2 border-white/20 rounded-lg p-8 max-w-md w-full mx-4 text-center"
          >
            <h2 className="font-galmu text-3xl text-red-400 mb-2">모기 승리!</h2>
            <p className="font-galmu text-lg text-white/80 mb-6">온몸이 가렵습니다</p>
            
            <div className="bg-black/50 rounded-lg p-4 mb-6 border border-white/10">
              <p className="font-galmu text-xl text-yellow-400 mb-1">{message.text}</p>
              <p className="font-pretendard text-sm text-gray-400">{message.sub}</p>
            </div>

            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="font-galmu text-3xl text-green-400">{score}</div>
                <div className="font-pretendard text-xs text-gray-500 mt-1">퇴치한 모기</div>
              </div>
              <div className="text-center">
                <div className="font-galmu text-3xl text-red-400">{itchLevel}%</div>
                <div className="font-pretendard text-xs text-gray-500 mt-1">최종 가려움</div>
              </div>
            </div>

            <button
              onClick={onRestart}
              className="font-galmu w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 transition-colors text-lg"
            >
              다시 싸우기
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
