
import React from 'react';
import { cn } from '@/lib/utils';
import AnimatedContainer from './AnimatedContainer';

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={cn('w-full py-5 mt-auto bg-muted/40', className)}>
      <AnimatedContainer className="nextdns-container" delay={300}>
        <div className="border-t border-border/50 pt-5">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p className="font-medium">Pittsburgh Violation Finder &copy; {new Date().getFullYear()}</p>
            <p className="mt-2 sm:mt-0">Data sourced from the City of Pittsburgh</p>
          </div>
        </div>
      </AnimatedContainer>
    </footer>
  );
};

export default Footer;
