import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const EnhancedAboutPageSimple = () => {
  console.log('EnhancedAboutPageSimple component rendering');
  
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Enhanced About Page - Simple Version
          </h1>
          <p className="text-xl text-gray-600">
            This is the enhanced about page with React Bits components.
          </p>
          <div className="mt-8 p-4 bg-blue-100 rounded-lg">
            <p className="text-blue-800">
              If you can see this message, the routing and component loading is working correctly!
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EnhancedAboutPageSimple;
