import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAccessToken, setAuthenticatedUserEmail } from '../auth/session';
import { ApiError } from '../api/client';
import { login } from '../api/auth';
import { LoggingCard } from '../components/logging/LoggingCard';
import { LoggingFooter } from '../components/logging/LoggingFooter';
import { LoggingHeader } from '../components/logging/LoggingHeader';
import '../styles/logging.css';

export function Logging() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'SnapSlot | Enter the Study';
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
      setErrorMessage('Provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await login({ email, password });
      setAccessToken(response.access_token);
      setAuthenticatedUserEmail(response.user.email);
      const state = location.state as { from?: string } | null;
      navigate(state?.from ?? '/', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.detail);
      } else {
        setErrorMessage('Could not log in. Try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="logging-page">
      <LoggingHeader />

      <main className="logging-main">
        <div className="logging-orb" aria-hidden="true" />

        <LoggingCard
          errorMessage={errorMessage}
          isSubmitting={isSubmitting}
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        />
      </main>

      <LoggingFooter />
    </div>
  );
}
