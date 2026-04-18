import type { FormEvent } from 'react';
import { LoggingAccessForm } from './LoggingAccessForm';

interface LoggingCardProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function LoggingCard({ onSubmit }: LoggingCardProps) {
  return (
    <section className="logging-card" aria-labelledby="study-entry-title">
      <div className="logging-illustration" aria-hidden="true">
        <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" viewBox="0 0 24 24">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3m-3-3l-2.5-2.5m2.5 2.5l-1-1" />
          <circle cx="12" cy="12" fill="#30312c" r="1.5" />
        </svg>
      </div>

      <div className="logging-copy">
        <h1 id="study-entry-title">Enter the Study</h1>
        <p>Access your curated archives and temporal ledger.</p>
      </div>

      <LoggingAccessForm onSubmit={onSubmit} />

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
