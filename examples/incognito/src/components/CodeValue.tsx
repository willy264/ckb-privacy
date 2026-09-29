import type { ReactNode } from 'react';

type CodeValueProps = { label: string; children: ReactNode; testId?: string };

export function CodeValue({ label, children, testId }: CodeValueProps) {
  return (
    <div className="code-value">
      <span className="code-label">{label}</span>
      <code data-testid={testId}>{children}</code>
    </div>
  );
}
