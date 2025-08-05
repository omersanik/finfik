'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface LottieAnimationProps {
  animationPath: string;
  size?: 'small' | 'medium' | 'large' | 'custom';
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

const LottieAnimation = ({ 
  animationPath, 
  size = 'medium', 
  width, 
  height, 
  loop = true, 
  autoplay = true, 
  className = '' 
}: LottieAnimationProps) => {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(animationPath);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Error loading Lottie animation:', error);
        setError('Failed to load animation');
      } finally {
        setLoading(false);
      }
    };

    if (animationPath) {
      loadAnimation();
    }
  }, [animationPath]);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
    custom: ''
  };

  const customStyle = size === 'custom' && width && height ? {
    width: `${width}px`,
    height: `${height}px`
  } : {};

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`} style={customStyle}>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`} style={customStyle}>
        <div className="text-center">
          <p className="text-sm text-gray-500">Animation failed to load</p>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!animationData) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`} style={customStyle}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        className="w-full h-full"
      />
    </div>
  );
};

export default LottieAnimation; 