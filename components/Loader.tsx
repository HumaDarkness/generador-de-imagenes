
import React from 'react';

interface LoaderProps {
  small?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ small = false }) => {
    const sizeClasses = small ? 'h-5 w-5' : 'h-16 w-16';
    const borderClasses = small ? 'border-2' : 'border-4';

    return (
        <div className={`${sizeClasses} relative`}>
            <div className={`absolute inset-0 rounded-full ${borderClasses} border-cyan-500 opacity-25`}></div>
            <div className={`absolute inset-0 rounded-full ${borderClasses} border-t-cyan-400 border-l-cyan-400 border-r-transparent border-b-transparent animate-spin`}></div>
        </div>
    );
};
