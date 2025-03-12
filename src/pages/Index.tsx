
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ViolationFinder from '@/components/ViolationFinder';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 px-6 py-8">
        <ViolationFinder />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
