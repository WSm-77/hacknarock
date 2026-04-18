import type { FormEvent } from 'react';
import { LoggingField } from './LoggingField';

interface LoggingAccessFormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  mode: 'login' | 'register';
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

export function LoggingAccessForm({
  onSubmit,
  mode,
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
}: LoggingAccessFormProps) {
  const submitLabel = isSubmitting
    ? mode === 'login'
      ? 'Entering...'
      : 'Creating account...'
    : mode === 'login'
      ? 'Enter'
      : 'Create account';

  return (
    <form className="logging-form" onSubmit={onSubmit}>
      {mode === 'register' && (
        <>
          <LoggingField
            id="name"
            label="Name"
            name="name"
            placeholder="Ada"
            type="text"
            autoComplete="given-name"
            value={name}
            onChange={onNameChange}
            disabled={isSubmitting}
            errorMessage={validationErrors.name}
          />

          <LoggingField
            id="surname"
            label="Surname"
            name="surname"
            placeholder="Lovelace"
            type="text"
            autoComplete="family-name"
            value={surname}
            onChange={onSurnameChange}
            disabled={isSubmitting}
            errorMessage={validationErrors.surname}
          />
        </>
      )}

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
        errorMessage={validationErrors.email}
      />

      <LoggingField
        id="password"
        label={mode === 'login' ? 'Cipher Key' : 'Password'}
        name="password"
        placeholder="••••••••"
        type="password"
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        value={password}
        onChange={onPasswordChange}
        disabled={isSubmitting}
        errorMessage={validationErrors.password}
      />

      {mode === 'register' && (
        <LoggingField
          id="confirmPassword"
          label="Confirm Password"
          name="confirmPassword"
          placeholder="••••••••"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          disabled={isSubmitting}
          errorMessage={validationErrors.confirmPassword}
        />
      )}

      <p className="logging-error" role="status" aria-live="polite">
        {errorMessage ?? ''}
      </p>

      <button className="logging-submit" type="submit" disabled={isSubmitting}>
        <span>{submitLabel}</span>
        <span className="logging-symbol material-symbols-outlined" aria-hidden="true">
          arrow_forward
        </span>
      </button>
    </form>
  );
}
