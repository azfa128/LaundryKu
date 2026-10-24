import type { ReactNode } from 'react';

export function Table({ headings, rows }: { headings: string[]; rows: ReactNode[][] }) {
  return <div className="overflow-x-auto rounded-token border border-line bg-white"><table className="w-full min-w-max text-left text-sm"><thead className="bg-mist font-mono text-xs uppercase text-muted"><tr>{headings.map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3">{cell}</td>)}</tr>)}</tbody></table></div>;
}
