
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade-in' | 'slide-up' | 'slide-down';
}

const AnimatedContainer = ({
  children,
  className,
  delay = 0,
  animation = 'fade-in'
}: AnimatedContainerProps) => {
  return (
    <div
      className={cn(
        `animate-${animation}`,
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        opacity: 0,
        animationFillMode: 'forwards'
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;
