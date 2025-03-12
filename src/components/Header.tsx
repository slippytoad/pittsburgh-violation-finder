
import React from 'react';
import { cn } from '@/lib/utils';
import AnimatedContainer from './AnimatedContainer';

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn('w-full py-6 px-6', className)}>
      <AnimatedContainer animation="slide-down" className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="font-semibold text-primary-foreground text-lg">P</span>
            </div>
            <h1 className="text-xl font-medium">Pittsburgh Violation Finder</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            2025 Data
          </div>
        </div>
      </AnimatedContainer>
    </header>
  );
};

export default Header;
