import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8',
        className,
      )}
    >
      {children}
    </div>
  );
}
