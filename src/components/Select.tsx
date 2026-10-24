import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label: string; error?: string }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, error, id, children, className = '', ...props }, ref) {
  const selectId = id ?? props.name;
  return <label className="block space-y-2 text-sm font-semibold text-ink" htmlFor={selectId}>
    <span>{label}</span>
    <select ref={ref} id={selectId} className={`w-full rounded-token border bg-white px-4 py-3 outline-none focus:border-ocean ${error ? 'border-red-500' : 'border-line'} ${className}`} aria-invalid={Boolean(error)} {...props}>{children}</select>
    {error && <span role="alert" className="block font-normal text-red-600">{error}</span>}
  </label>;
});
