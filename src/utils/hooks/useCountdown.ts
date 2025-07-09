import { useState, useEffect, useCallback } from 'react';

type TimerStatus = 'running' | 'stopped' | 'finished';

interface UseCountdownReturn {
  time: number;
  isActive: boolean;
  status: TimerStatus;
  startCountdown: (duration: number) => void;
  resetCountdown: () => void;
  stopCountdown: () => void;
  formatTime: (seconds: number) => string;
}

const useCountdown = (): UseCountdownReturn => {
  const [time, setTime] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [status, setStatus] = useState<TimerStatus>('stopped');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      setStatus('running');
      interval = setInterval(() => {
        setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    } else if (time === 0 && isActive) {
      setStatus('finished');
      setIsActive(false);
    } else {
      setStatus('stopped');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

  // Start countdown with a given duration
  const startCountdown = useCallback((duration: number) => {
    setTime(duration);
    setIsActive(true);
    setStatus('running');
  }, []);

  // Reset countdown
  const resetCountdown = useCallback(() => {
    setTime(0);
    setIsActive(false);
    setStatus('stopped');
  }, []);

  // Stop countdown
  const stopCountdown = useCallback(() => {
    setIsActive(false);
    setStatus('stopped');
  }, []);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return { time, isActive, status, startCountdown, resetCountdown, stopCountdown, formatTime };
};

export default useCountdown;
