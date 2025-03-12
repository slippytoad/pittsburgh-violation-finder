
import React from 'react';
import { cn } from '@/lib/utils';
import AnimatedContainer from './AnimatedContainer';

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={cn('w-full py-6 px-6 mt-auto', className)}>
      <AnimatedContainer className="max-w-screen-xl mx-auto" delay={300}>
        <div className="border-t pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>Pittsburgh Violation Finder - {new Date().getFullYear()}</p>
            <p className="mt-2 sm:mt-0">Data provided by the City of Pittsburgh</p>
          </div>
        </div>
      </AnimatedContainer>
    </footer>
  );
};

export default Footer;
