import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  children: ReactNode;
}

const variants = {
  primary: 'bg-teal text-ink shadow-soft hover:bg-softlime hover:shadow-card',
  secondary: 'bg-softlime text-ink hover:bg-teal',
  outline: 'border border-line bg-card text-ink shadow-sm hover:border-ink/25 hover:bg-ground',
  danger: 'bg-red-600 text-white shadow-soft hover:bg-red-700',
};

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return <button className={`inline-flex items-center justify-center rounded-token px-4 py-3 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>{children}</button>;
}
