import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={`rounded-token border border-line bg-white p-4 shadow-sm ${className}`} {...props}>{children}</div>;
}
