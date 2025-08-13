import React from 'react';
import DealsGrid from '../components/DealsGrid';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const DealsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <div className="container mx-auto px-4 pt-24 pb-6 sm:pb-8 flex-1">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Student <span className="bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-pink-300 bg-clip-text text-transparent animate-pulse">Deals</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Exclusive offers and discounts for students
          </p>
        </div>
        <DealsGrid />
      </div>
      <Footer />
    </div>
  );
};

export default DealsPage; 