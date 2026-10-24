import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  children: ReactNode;
}

const variants = {
  primary: 'bg-ocean text-white hover:bg-ink',
  secondary: 'bg-mist text-ocean hover:bg-line',
  outline: 'border border-line bg-white text-ink hover:bg-mist',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return <button className={`inline-flex items-center justify-center rounded-token px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>{children}</button>;
}
