import type { ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  tone?: 'blue' | 'amber' | 'neutral' | 'green';
};

export function Badge({ children, tone = 'blue' }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
