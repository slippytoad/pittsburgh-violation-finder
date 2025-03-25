
import React from 'react';
import { cn } from '@/lib/utils';
import AnimatedContainer from './AnimatedContainer';
import { ShieldCheck } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn('w-full py-4 border-b border-border/80 bg-white dark:bg-background sticky top-0 z-10', className)}>
      <AnimatedContainer animation="slide-down" className="nextdns-container">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Pittsburgh Violation Finder</h1>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Property Violation Data
          </div>
        </div>
      </AnimatedContainer>
    </header>
  );
};

export default Header;
