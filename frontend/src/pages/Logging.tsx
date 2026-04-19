import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { loadAuthSession, login, register, saveAuthSession } from '../api/auth';
import { LoggingCard } from '../components/logging/LoggingCard';
import { LoggingFooter } from '../components/logging/LoggingFooter';
import { LoggingHeader } from '../components/logging/LoggingHeader';
import '../styles/logging.css';

type LoggingMode = 'login' | 'register';

const REGISTER_PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

interface ValidationErrors {
  name?: string;
  surname?: string;
  latitude?: string;
  longitude?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const LATITUDE_MIN = -90;
const LATITUDE_MAX = 90;
const LONGITUDE_MIN = -180;
const LONGITUDE_MAX = 180;

function isAutoLoginResponse(data: unknown): data is {
  access_token: string;
  token_type: string;
  user: { id: string; email: string };
} {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const payload = data as {
    access_token?: unknown;
    token_type?: unknown;
    user?: { id?: unknown; email?: unknown } | null;
  };

  return (
    typeof payload.access_token === 'string' &&
    typeof payload.token_type === 'string' &&
    typeof payload.user?.id === 'string' &&
    typeof payload.user?.email === 'string'
  );
}

function parseOptionalCoordinate(
  rawValue: string,
  label: string,
  minimum: number,
  maximum: number,
): { value?: number; error?: string } {
  const trimmedValue = rawValue.trim();

  if (!trimmedValue) {
    return {};
  }

  const parsedValue = Number(trimmedValue);

  if (!Number.isFinite(parsedValue)) {
    return { error: `${label} must be a valid number.` };
  }

  if (parsedValue < minimum || parsedValue > maximum) {
    return { error: `${label} must be between ${minimum} and ${maximum}.` };
  }

  return { value: parsedValue };
}

export function Logging() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<LoggingMode>('login');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const redirectPath = (() => {
    const state = location.state as { from?: unknown } | null;
    const from = state?.from;
    if (typeof from === 'string' && from.startsWith('/')) {
      return from;
    }

    return '/';
  })();

  useEffect(() => {
    document.title = 'SnapSlot | Enter the Study';
  }, []);

  useEffect(() => {
    if (loadAuthSession()) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, redirectPath]);

  function clearFieldError(field: keyof ValidationErrors) {
    setValidationErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function resetMessages() {
    setErrorMessage(null);
    setValidationErrors({});
  }

  function handleModeChange(nextMode: LoggingMode) {
    if (nextMode === mode || isSubmitting) {
      return;
    }

    setMode(nextMode);
    setPassword('');
    setConfirmPassword('');
    setLatitude('');
    setLongitude('');
    resetMessages();
  }

  function validateForm(normalizedEmail: string): ValidationErrors {
    const nextErrors: ValidationErrors = {};

    if (!normalizedEmail) {
      nextErrors.email = 'Email is required.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (mode === 'register' && password.length < REGISTER_PASSWORD_MIN_LENGTH) {
      nextErrors.password = `Password must be at least ${REGISTER_PASSWORD_MIN_LENGTH} characters.`;
    } else if (password.length > PASSWORD_MAX_LENGTH) {
      nextErrors.password = `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`;
    }

    if (mode === 'register') {
      const latitudeResult = parseOptionalCoordinate(latitude, 'Latitude', LATITUDE_MIN, LATITUDE_MAX);
      const longitudeResult = parseOptionalCoordinate(
        longitude,
        'Longitude',
        LONGITUDE_MIN,
        LONGITUDE_MAX,
      );

      if (!name.trim()) {
        nextErrors.name = 'Name is required.';
      }

      if (!surname.trim()) {
        nextErrors.surname = 'Surname is required.';
      }

      if (!confirmPassword) {
        nextErrors.confirmPassword = 'Please confirm your password.';
      } else if (password !== confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match.';
      }

      if (latitudeResult.error) {
        nextErrors.latitude = latitudeResult.error;
      }

      if (longitudeResult.error) {
        nextErrors.longitude = longitudeResult.error;
      }
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email.trim();
    const nextErrors = validateForm(normalizedEmail);
    if (Object.keys(nextErrors).length > 0) {
      setValidationErrors(nextErrors);
      setErrorMessage('Please fix the highlighted fields.');
      return;
    }

    resetMessages();
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const latitudeResult = parseOptionalCoordinate(latitude, 'Latitude', LATITUDE_MIN, LATITUDE_MAX);
        const longitudeResult = parseOptionalCoordinate(
          longitude,
          'Longitude',
          LONGITUDE_MIN,
          LONGITUDE_MAX,
        );

        const registrationResponse = await register({
          name: name.trim(),
          surname: surname.trim(),
          email: normalizedEmail,
          latitude: latitudeResult.value,
          longitude: longitudeResult.value,
          password,
        });

        if (isAutoLoginResponse(registrationResponse)) {
          saveAuthSession(registrationResponse);
        } else {
          const loginResponse = await login({
            email: normalizedEmail,
            password,
          });
          saveAuthSession(loginResponse);
        }
      } else {
        const response = await login({
          email: normalizedEmail,
          password,
        });

        saveAuthSession(response);
      }

      navigate(redirectPath, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        const detail = error.detail || '';
        const duplicateEmail =
          error.status === 400 &&
          /(already|zarejestrowany|exists|taken)/i.test(detail);

        if (duplicateEmail) {
          setValidationErrors((current) => ({
            ...current,
            email: 'This email is already registered.',
          }));
          setErrorMessage('That email is already in use. Try logging in instead.');
        } else if (error.status === 422 && mode === 'register') {
          setErrorMessage(detail || 'Please check the registration fields and try again.');
        } else if (error.status === 401) {
          setErrorMessage('Invalid email or password.');
        } else if (error.status >= 500) {
          setErrorMessage('Authentication service is temporarily unavailable. Please try again.');
        } else {
          setErrorMessage(error.detail || 'Authentication failed. Please try again.');
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
          mode={mode}
          onModeChange={handleModeChange}
          name={name}
          surname={surname}
          latitude={latitude}
          longitude={longitude}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          onNameChange={(value) => {
            setName(value);
            clearFieldError('name');
          }}
          onSurnameChange={(value) => {
            setSurname(value);
            clearFieldError('surname');
          }}
          onLatitudeChange={(value) => {
            setLatitude(value);
            clearFieldError('latitude');
          }}
          onLongitudeChange={(value) => {
            setLongitude(value);
            clearFieldError('longitude');
          }}
          onEmailChange={(value) => {
            setEmail(value);
            clearFieldError('email');
          }}
          onPasswordChange={(value) => {
            setPassword(value);
            clearFieldError('password');
            if (mode === 'register') {
              clearFieldError('confirmPassword');
            }
          }}
          onConfirmPasswordChange={(value) => {
            setConfirmPassword(value);
            clearFieldError('confirmPassword');
          }}
          isSubmitting={isSubmitting}
          validationErrors={validationErrors}
          errorMessage={errorMessage}
        />
      </main>

      <LoggingFooter />
    </div>
  );
}
