import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label: string; error?: string }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, id, className = '', ...props }, ref) {
  const inputId = id ?? props.name;
  return <label className="block space-y-2 text-sm font-semibold text-ink" htmlFor={inputId}>
    <span>{label}</span>
    <input ref={ref} id={inputId} className={`w-full rounded-token border bg-card px-4 py-3 font-normal shadow-sm outline-none transition placeholder:text-muted/70 focus:border-ink focus:ring-2 focus:ring-teal/70 ${error ? 'border-red-500' : 'border-line'} ${className}`} aria-invalid={Boolean(error)} {...props} />
    {error && <span role="alert" className="block font-normal text-red-600">{error}</span>}
  </label>;
});
