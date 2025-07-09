// hooks/useIsPortrait.ts
import { useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';

const useIsPortrait = (): boolean => {
  const { width, height } = useWindowDimensions();
  const [isPortrait, setIsPortrait] = useState(height >= width);

  useEffect(() => {
    setIsPortrait(height >= width);
  }, [width, height]);

  return isPortrait;
};

export default useIsPortrait;
