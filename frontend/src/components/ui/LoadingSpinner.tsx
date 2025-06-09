import React from 'react';

type SpinnerSize = 'small' | 'medium' | 'large';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  color?: string;
}

/**
 * LoadingSpinner component to indicate loading state
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = '',
  color = 'text-blue-600'
}) => {
  // Size mapping
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} ${color} animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
