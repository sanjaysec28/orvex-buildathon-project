import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SPLASH_ARTWORK_SRC,
  SPLASH_DURATION_MS,
  SPLASH_NEXT_ROUTE,
} from './splashConfig';

export function SplashScreenPage() {
  const navigate = useNavigate();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        navigate(SPLASH_NEXT_ROUTE, { replace: true });
      }
    }, SPLASH_DURATION_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [navigate]);

  return (
    <main className="h-[100dvh] w-full overflow-hidden bg-[var(--orvex-surface-canvas)] flex items-center justify-center">
      <img
        src={SPLASH_ARTWORK_SRC}
        alt="ORVEX — The Future Moves Through Us."
        draggable={false}
        className="orvex-splash-fade h-full w-full max-h-[min(100dvh,1672px)] max-w-[min(100%,941px)] object-contain object-center select-none"
      />
    </main>
  );
}
