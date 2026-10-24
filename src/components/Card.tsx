import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={`rounded-token border border-line bg-card p-4 shadow-soft ${className}`} {...props}>{children}</div>;
}
