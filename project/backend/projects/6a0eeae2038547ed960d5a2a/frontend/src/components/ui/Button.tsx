import React from 'react';
import './Button.css';

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary';
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant,
  loading,
  onClick,
  children,
}) => {
  const className = `button ${variant} ${loading ? 'loading' : ''}`;

  return (
    <button className={className} onClick={onClick}>
      {loading ? (
        <div className="loader">
          <div className="loader-spinner"></div>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;