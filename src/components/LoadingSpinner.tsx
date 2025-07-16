
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-pink-500 rounded-full animate-spin"></div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 animate-pulse">Loading events...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
