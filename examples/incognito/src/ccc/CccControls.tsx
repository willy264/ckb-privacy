// Adapted from CCC packages/demo/src/components/{Button,Input}.tsx at
// 3d11c1ed2be6764624ab2b70de2a485eb3a6c93b; see ../../CCC_UPSTREAM.md.
import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export function CccButton({
  icon,
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...props
}: ComponentPropsWithoutRef<'button'> & {
  icon?: ReactNode;
  variant?: 'info' | 'primary' | 'success' | 'danger';
}) {
  return (
    <button {...props} type={type} className={`ccc-button ccc-button-${variant} ${className}`}>
      {icon ? <span className="ccc-button-icon">{icon}</span> : null}
      {children}
    </button>
  );
}

export function CccTextInput({
  state,
  label,
  id,
  className = '',
  ...props
}: Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'onChange'> & {
  state: [string, (value: string) => void];
  label?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={`ccc-field ${className}`}>
      {label ? <label htmlFor={inputId}>{label}</label> : null}
      <input {...props} id={inputId} className={`ccc-input ${state[0] ? 'ccc-input-filled' : ''}`} value={state[0]} onChange={(event) => state[1](event.currentTarget.value)} />
    </div>
  );
}
