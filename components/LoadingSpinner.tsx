'use client';

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Processing...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <svg
          className="animate-spin h-16 w-16 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        
        {/* Pulsing dot */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-2 left-1/2 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
        </div>
      </div>
      
      <p className="mt-6 text-xl text-gray-700">{message}</p>
      <p className="mt-2 text-gray-500">This may take a few moments...</p>
    </div>
  );
}
