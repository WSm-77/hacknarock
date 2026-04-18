import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { loadAuthSession, login, saveAuthSession } from '../api/auth';
import { LoggingCard } from '../components/logging/LoggingCard';
import { LoggingFooter } from '../components/logging/LoggingFooter';
import { LoggingHeader } from '../components/logging/LoggingHeader';
import '../styles/logging.css';

export function Logging() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'SnapSlot | Enter the Study';
  }, []);

  useEffect(() => {
    if (loadAuthSession()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await login({
        email: normalizedEmail,
        password,
      });

      saveAuthSession(response);
      navigate('/', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setErrorMessage('Invalid email or password.');
        } else {
          setErrorMessage(error.detail || 'Login failed. Please try again.');
        }
      } else {
        setErrorMessage('Network error. Please check your connection and try again.');
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
          onSubmit={handleSubmit}
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      </main>

      <LoggingFooter />
    </div>
  );
}
