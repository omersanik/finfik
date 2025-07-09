'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingAnimation = ({ size = 'medium', className = '' }: LoadingAnimationProps) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch('/animations/LoadingAnimation.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Error loading animation:', error);
      }
    };

    loadAnimation();
  }, []);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  if (!animationData) {
    return null; // Let Suspense handle the loading state
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        className={sizeClasses[size]}
      />
    </div>
  );
};

export default LoadingAnimation; 