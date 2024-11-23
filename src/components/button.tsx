import { FC, ReactNode } from 'react';

interface ButtonProps {
  buttonType?: 'primary' | 'secondary';
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Button: FC<ButtonProps> = ({
  buttonType = 'primary',
  children,
  className = '',
  onClick,
  ...props
}) => {
  const buttonStyles = {
    primary: 'bg-primary hover:bg-primary-dark',
    secondary: 'bg-slate-100 hover:bg-slate-300',
  };

  return (
    <button
      {...props}
      onClick={onClick}
      className={`text-white font-bold py-3 px-5 rounded-lg inline-flex items-center ${className} ${buttonStyles[buttonType]}`}
    >
      {children}
    </button>
  );
};

export default Button;
