import { useRef, useCallback, useEffect } from 'react';

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const isInitializedRef = useRef(false);

  const initAudio = useCallback(() => {
    if (isInitializedRef.current) return;
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const panner = ctx.createStereoPanner();

    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0;

    oscillator.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(ctx.destination);
    oscillator.start();

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    pannerRef.current = panner;
    isInitializedRef.current = true;
  }, []);

  const updateMosquitoSound = useCallback((distance: number, mosquitoX: number, screenWidth: number) => {
    if (!audioContextRef.current || !oscillatorRef.current || !gainNodeRef.current || !pannerRef.current) return;

    const maxDistance = 600;
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    
    // 거리에 따른 볼륨: 가까울수록 크게 (0.001 ~ 0.3)
    const volume = Math.max(0.001, 0.3 * (1 - normalizedDistance));
    gainNodeRef.current.gain.setTargetAtTime(volume, audioContextRef.current.currentTime, 0.1);

    // 거리에 따른 주파수: 가까울수록 높게 (800Hz ~ 1500Hz)
    const freq = 800 + (700 * (1 - normalizedDistance));
    oscillatorRef.current.frequency.setTargetAtTime(freq, audioContextRef.current.currentTime, 0.1);

    // 좌우 팬: 모기 X 위치 기준 (-1 ~ 1)
    const pan = ((mosquitoX / screenWidth) * 2) - 1;
    pannerRef.current.pan.setTargetAtTime(pan, audioContextRef.current.currentTime, 0.1);
  }, []);

  const playFailSound = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  const playSuccessSound = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    // 화이트 노이즈 생성
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    // 하이패스 필터로 타격감 추가
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }, []);

  const stopSound = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.1);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { initAudio, updateMosquitoSound, playFailSound, playSuccessSound, stopSound };
}
