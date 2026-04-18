import type { FormEvent } from 'react';
import { LoggingAccessForm } from './LoggingAccessForm';

interface LoggingCardProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
  onNameChange: (value: string) => void;
  onSurnameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  isSubmitting: boolean;
  validationErrors: {
    name?: string;
    surname?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  errorMessage: string | null;
}

export function LoggingCard({
  onSubmit,
  mode,
  onModeChange,
  name,
  surname,
  email,
  password,
  confirmPassword,
  onNameChange,
  onSurnameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  isSubmitting,
  validationErrors,
  errorMessage,
}: LoggingCardProps) {
  const title = mode === 'login' ? 'Enter the Study' : 'Join the Study';
  const subtitle =
    mode === 'login'
      ? 'Access your curated archives and temporal ledger.'
      : 'Create your account to begin your curated archive journey.';

  return (
    <section className="logging-card" aria-labelledby="study-entry-title">
      <div className="logging-illustration" aria-hidden="true">
        <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" viewBox="0 0 24 24">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3m-3-3l-2.5-2.5m2.5 2.5l-1-1" />
          <circle cx="12" cy="12" fill="#30312c" r="1.5" />
        </svg>
      </div>

      <div className="logging-copy">
        <h1 id="study-entry-title">{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="logging-switch" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          className={`logging-switch__option${mode === 'login' ? ' logging-switch__option--active' : ''}`}
          onClick={() => onModeChange('login')}
          disabled={isSubmitting}
          role="tab"
          aria-selected={mode === 'login'}
        >
          Log In
        </button>
        <button
          type="button"
          className={`logging-switch__option${mode === 'register' ? ' logging-switch__option--active' : ''}`}
          onClick={() => onModeChange('register')}
          disabled={isSubmitting}
          role="tab"
          aria-selected={mode === 'register'}
        >
          Register
        </button>
      </div>

      <LoggingAccessForm
        onSubmit={onSubmit}
        mode={mode}
        name={name}
        surname={surname}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        onNameChange={onNameChange}
        onSurnameChange={onSurnameChange}
        onEmailChange={onEmailChange}
        onPasswordChange={onPasswordChange}
        onConfirmPasswordChange={onConfirmPasswordChange}
        isSubmitting={isSubmitting}
        validationErrors={validationErrors}
        errorMessage={errorMessage}
      />

      <div className="logging-links">
        <a className="logging-footnote" href="#">
          Request Access
        </a>
        <div className="logging-links__divider" aria-hidden="true" />
        <a className="logging-footnote" href="#">
          The Manifesto
        </a>
      </div>
    </section>
  );
}
