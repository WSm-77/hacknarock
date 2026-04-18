interface LoggingFieldProps {
  id: string;
  label: string;
  name: string;
  placeholder: string;
  type: 'text' | 'email' | 'password' | 'number';
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  step?: string;
  min?: number;
  max?: number;
  errorMessage?: string;
}

export function LoggingField({
  id,
  label,
  name,
  placeholder,
  type,
  autoComplete,
  value,
  onChange,
  disabled = false,
  required = true,
  step,
  min,
  max,
  errorMessage,
}: LoggingFieldProps) {
  const hasError = Boolean(errorMessage);

  return (
    <div className={`logging-field${hasError ? ' logging-field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        required={required}
      />
      <p className="logging-field-error" role="status" aria-live="polite">
        {errorMessage ?? ''}
      </p>
    </div>
  );
}
