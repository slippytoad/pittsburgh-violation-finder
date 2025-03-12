
import React, { ReactNode, useEffect, useState } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  const animationClasses = {
    'fade-in': 'fadeIn',
    'slide-up': 'fadeIn',
    'slide-down': 'fadeIn'
  };
  
  return (
    <div
      className={cn(
        animationClasses[animation],
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        animationFillMode: 'forwards'
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;
