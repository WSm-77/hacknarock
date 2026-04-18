import type { FormEvent } from 'react';
import { LoggingField } from './LoggingField';

interface LoggingAccessFormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export function LoggingAccessForm({
  onSubmit,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  isSubmitting,
  errorMessage,
}: LoggingAccessFormProps) {
  return (
    <form className="logging-form" onSubmit={onSubmit}>
      <LoggingField
        id="email"
        label="Electronic Mail"
        name="email"
        placeholder="curator@snapslot.com"
        type="email"
        autoComplete="email"
        value={email}
        onChange={onEmailChange}
        disabled={isSubmitting}
        hasError={Boolean(errorMessage)}
      />

      <LoggingField
        id="password"
        label="Cipher Key"
        name="password"
        placeholder="••••••••"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={onPasswordChange}
        disabled={isSubmitting}
        hasError={Boolean(errorMessage)}
      />

      <p className="logging-error" role="status" aria-live="polite">
        {errorMessage ?? ''}
      </p>

      <button className="logging-submit" type="submit" disabled={isSubmitting}>
        <span>{isSubmitting ? 'Entering...' : 'Enter'}</span>
        <span className="logging-symbol material-symbols-outlined" aria-hidden="true">
          arrow_forward
        </span>
      </button>
    </form>
  );
}
