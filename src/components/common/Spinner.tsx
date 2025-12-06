import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-[3px]',
    lg: 'h-10 w-10 border-4',
  };

  return (
    <span className={`inline-flex items-center justify-center text-primary-500 ${className}`}>
      <span
        className={`${sizeClasses[size]} border-current border-t-transparent rounded-full animate-spin`}
        aria-hidden
      />
    </span>
  );
};

export default Spinner;
