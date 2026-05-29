import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';
import { HUD } from './HUD';
import { GameOver } from './GameOver';

interface MosquitoState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  isDead: boolean;
}

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const [itchLevel, setItchLevel] = useState(50);
  const [timeLeft, setTimeLeft] = useState(60);
  const [flashRed, setFlashRed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mosquito, setMosquito] = useState<MosquitoState>({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    targetX: Math.random() * window.innerWidth,
    targetY: Math.random() * window.innerHeight,
    speed: 3,
    isDead: false,
  });

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(Date.now());
  const { initAudio, updateMosquitoSound, playFailSound, playSuccessSound, stopSound } = useAudio();

  // 모기 AI 이동
  const moveMosquito = useCallback(() => {
    const now = Date.now();
    const timeDelta = (now - lastMoveTimeRef.current) / 1000;
    lastMoveTimeRef.current = now;

    setMosquito(prev => {
      if (prev.isDead) return prev;

      const dx = prev.targetX - prev.x;
      const dy = prev.targetY - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 10 || Math.random() < 0.02) {
        // 새로운 목표 지점 설정 (0.8초마다 불규칙하게)
        return {
          ...prev,
          targetX: Math.random() * (window.innerWidth - 20) + 10,
          targetY: Math.random() * (window.innerHeight - 20) + 10,
          speed: 2 + Math.random() * 6, // 불규칙한 속도
        };
      }

      const moveX = (dx / dist) * prev.speed * timeDelta * 60;
      const moveY = (dy / dist) * prev.speed * timeDelta * 60;

      return {
        ...prev,
        x: prev.x + moveX,
        y: prev.y + moveY,
      };
    });

    animationFrameRef.current = requestAnimationFrame(moveMosquito);
  }, []);

  // 게임 시작
  const startGame = useCallback(() => {
    initAudio();
    setGameState('playing');
    setScore(0);
    setItchLevel(50);
    setTimeLeft(60);
    setMosquito({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      targetX: Math.random() * window.innerWidth,
      targetY: Math.random() * window.innerHeight,
      speed: 3,
      isDead: false,
    });
    lastMoveTimeRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(moveMosquito);
  }, [initAudio, moveMosquito]);

  // 게임 오버
  const endGame = useCallback(() => {
    setGameState('over');
    cancelAnimationFrame(animationFrameRef.current);
    stopSound();
  }, [stopSound]);

  // 타이머
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, endGame]);

  // 오디오 업데이트
  useEffect(() => {
    if (gameState !== 'playing') return;

    const dist = Math.sqrt(
      Math.pow(mosquito.x - mousePos.x, 2) + Math.pow(mosquito.y - mousePos.y, 2)
    );
    updateMosquitoSound(dist, mosquito.x, window.innerWidth);
  }, [mosquito, mousePos, gameState, updateMosquitoSound]);

  // 마우스 이동 추적
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  // 클릭 판정
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (gameState !== 'playing') return;

    const clickX = e.clientX;
    const clickY = e.clientY;
    const dist = Math.sqrt(
      Math.pow(mosquito.x - clickX, 2) + Math.pow(mosquito.y - clickY, 2)
    );

    if (dist <= 40) {
      // 성공
      playSuccessSound();
      setScore(prev => prev + 1);
      setItchLevel(prev => Math.max(0, prev - 10));
      setFlashRed(true);
      setTimeout(() => setFlashRed(false), 300);

      // 모기 추락 후 리스폰
      setMosquito(prev => ({
        ...prev,
        isDead: true,
      }));

      setTimeout(() => {
        setMosquito({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          targetX: Math.random() * window.innerWidth,
          targetY: Math.random() * window.innerHeight,
          speed: 3,
          isDead: false,
        });
      }, 500);
    } else {
      // 실패
      playFailSound();
      setItchLevel(prev => Math.min(100, prev + 5));
      
      // 모기 순간이동
      setMosquito(prev => ({
        ...prev,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        targetX: Math.random() * window.innerWidth,
        targetY: Math.random() * window.innerHeight,
      }));
    }
  }, [gameState, mosquito, playSuccessSound, playFailSound]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // 손전등 거리 계산
  const flashlightDistance = Math.sqrt(
    Math.pow(mosquito.x - mousePos.x, 2) + Math.pow(mosquito.y - mousePos.y, 2)
  );
  const isInFlashlight = flashlightDistance <= 80;
  const mosquitoOpacity = isInFlashlight ? Math.max(0.2, 1 - flashlightDistance / 80) : 0;

  return (
    <div 
      ref={gameAreaRef}
      className="fixed inset-0 bg-black cursor-crosshair overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* 손전등 효과 */}
      <div 
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle 80px at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.95) 100%)`,
        }}
      />

      {/* 모기 */}
      <AnimatePresence>
        {gameState === 'playing' && !mosquito.isDead && (
          <motion.div
            className="fixed z-20 pointer-events-none"
            style={{
              left: mosquito.x - 2,
              top: mosquito.y - 2,
              opacity: mosquitoOpacity,
              filter: isInFlashlight ? 'blur(0.5px)' : 'blur(2px)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, y: 50, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-1 h-1 bg-white/80 rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 화면 번쩍 효과 */}
      <AnimatePresence>
        {flashRed && (
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-red-600 pointer-events-none z-30"
          />
        )}
      </AnimatePresence>

      {/* HUD */}
      {gameState === 'playing' && (
        <HUD timeLeft={timeLeft} score={score} itchLevel={itchLevel} />
      )}

      {/* 시작 화면 */}
      <AnimatePresence>
        {gameState === 'ready' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          >
            <div className="text-center">
              <h1 className="font-galmu text-5xl text-white mb-4">여름밤의 사투</h1>
              <p className="font-pretendard text-gray-400 mb-8">어둠 속에서 모기를 찾아 제거하세요</p>
              <button
                onClick={startGame}
                className="font-galmu px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-xl rounded border border-white/20 transition-colors"
              >
                게임 시작
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 게임 오버 */}
      <GameOver 
        isOpen={gameState === 'over'} 
        score={score} 
        itchLevel={itchLevel} 
        onRestart={startGame} 
      />
    </div>
  );
};
