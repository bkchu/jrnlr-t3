import { useCallback, useEffect, useState } from "react";
import { SpringValue, useSpring } from "react-spring";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export const useBoop = ({
  x = 0,
  y = 0,
  rotation = 0,
  scale = 1,
  timing = 150,
  springConfig = {
    tension: 300,
    friction: 10,
    mass: 1,
  },
}): [
  (
    | object
    | {
        transform: SpringValue<string>;
      }
  ),
  () => void
] => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isBooped, setIsBooped] = useState(false);
  // await import('react-spring')
  const style = useSpring({
    transform: isBooped
      ? `translate(${x}px, ${y}px)
         rotate(${rotation}deg)
         scale(${scale})`
      : `translate(0px, 0px)
         rotate(0deg)
         scale(1)`,
    config: springConfig,
  });

  useEffect(() => {
    if (!isBooped) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setIsBooped(false);
    }, timing);
    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBooped]);

  const trigger = useCallback(() => {
    setIsBooped(true);
  }, []);

  const appliedStyle = prefersReducedMotion ? {} : style;
  return [appliedStyle, trigger];
};

export const useGrowBoop = () =>
  useBoop({
    scale: 1.2,
    springConfig: {
      friction: 5,
      tension: 500,
      mass: 0.75,
    },
  });
