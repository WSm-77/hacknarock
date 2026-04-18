import type { FormEvent } from 'react';
import { LoggingField } from './LoggingField';

interface LoggingAccessFormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

export function LoggingAccessForm({ onSubmit, isSubmitting }: LoggingAccessFormProps) {
  return (
    <form className="logging-form" onSubmit={onSubmit}>
      <LoggingField
        id="email"
        label="Electronic Mail"
        name="email"
        placeholder="curator@snapslot.com"
        type="email"
        autoComplete="email"
      />

      <LoggingField
        id="password"
        label="Cipher Key"
        name="password"
        placeholder="••••••••"
        type="password"
        autoComplete="current-password"
      />

      <button className="logging-submit" type="submit" disabled={isSubmitting}>
        <span>{isSubmitting ? 'Entering…' : 'Enter'}</span>
        <span className="logging-symbol material-symbols-outlined" aria-hidden="true">
          arrow_forward
        </span>
      </button>
    </form>
  );
}
