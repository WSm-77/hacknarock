import { useEffect } from 'react';
import { LoggingCard } from '../components/logging/LoggingCard';
import { LoggingFooter } from '../components/logging/LoggingFooter';
import { LoggingHeader } from '../components/logging/LoggingHeader';
import '../styles/logging.css';

export function Logging() {
  useEffect(() => {
    document.title = 'SnapSlot | Enter the Study';
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="logging-page">
      <LoggingHeader />

      <main className="logging-main">
        <div className="logging-orb" aria-hidden="true" />

        <LoggingCard onSubmit={handleSubmit} />
      </main>

      <LoggingFooter />
    </div>
  );
}
