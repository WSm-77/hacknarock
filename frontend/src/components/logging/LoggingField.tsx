interface LoggingFieldProps {
  id: string;
  label: string;
  name: string;
  placeholder: string;
  type: 'email' | 'password';
  autoComplete: string;
}

export function LoggingField({ id, label, name, placeholder, type, autoComplete }: LoggingFieldProps) {
  return (
    <div className="logging-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name} placeholder={placeholder} type={type} autoComplete={autoComplete} />
    </div>
  );
}
