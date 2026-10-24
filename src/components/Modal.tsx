import type { ReactNode } from 'react';

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="w-full max-w-lg rounded-token bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-4"><h2 id="modal-title" className="font-heading text-xl font-bold">{title}</h2><button type="button" onClick={onClose} aria-label="Tutup" className="rounded-full text-2xl text-muted transition hover:bg-ground hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal">×</button></div>
      {children}
    </section>
  </div>;
}
