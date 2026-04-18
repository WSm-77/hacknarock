import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuthenticatedUserEmail, clearAccessToken } from '../auth/session';
import { ApiError } from '../api/client';
import { submitParticipantAvailability } from '../api/meetings';
import '../styles/availability.css';

type AvailabilityKind = 'available' | 'maybe';

interface AvailabilityRow {
  id: string;
  startTime: string;
  endTime: string;
  kind: AvailabilityKind;
}

const EMPTY_ROW = (): AvailabilityRow => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  startTime: '',
  endTime: '',
  kind: 'available',
});

function toDraftStorageKey(publicToken: string): string {
  return `snapslot:availability-draft:${publicToken}`;
}

function toApiDate(value: string): string {
  return new Date(value).toISOString();
}

export function ParticipantAvailabilityPage() {
  const navigate = useNavigate();
  const { publicToken } = useParams<{ publicToken: string }>();
  const [rows, setRows] = useState<AvailabilityRow[]>([EMPTY_ROW()]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const userEmail = getAuthenticatedUserEmail();

  useEffect(() => {
    if (!publicToken) {
      return;
    }

    const raw = localStorage.getItem(toDraftStorageKey(publicToken));
    if (!raw) {
      return;
    }

    try {
      const draft = JSON.parse(raw) as AvailabilityRow[];
      if (Array.isArray(draft) && draft.length > 0) {
        setRows(draft);
      }
    } catch {
      localStorage.removeItem(toDraftStorageKey(publicToken));
    }
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) {
      return;
    }
    localStorage.setItem(toDraftStorageKey(publicToken), JSON.stringify(rows));
  }, [publicToken, rows]);

  const canSubmit = useMemo(() => {
    if (isClosed || rows.length === 0) {
      return false;
    }
    return rows.every((row) => row.startTime && row.endTime);
  }, [isClosed, rows]);

  function updateRow(rowId: string, patch: Partial<AvailabilityRow>): void {
    setRows((currentRows) => currentRows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
  }

  function removeRow(rowId: string): void {
    setRows((currentRows) => (currentRows.length <= 1 ? currentRows : currentRows.filter((row) => row.id !== rowId)));
  }

  function addRow(): void {
    setRows((currentRows) => [...currentRows, EMPTY_ROW()]);
  }

  async function handleSubmit(): Promise<void> {
    if (!publicToken) {
      setErrorMessage('Missing meeting token in URL.');
      return;
    }

    const invalidRange = rows.some((row) => row.startTime >= row.endTime);
    if (invalidRange) {
      setErrorMessage('Start time must be earlier than end time.');
      return;
    }

    const availableBlocks = rows
      .filter((row) => row.kind === 'available')
      .map((row) => ({ start_time: toApiDate(row.startTime), end_time: toApiDate(row.endTime) }));

    const maybeBlocks = rows
      .filter((row) => row.kind === 'maybe')
      .map((row) => ({ start_time: toApiDate(row.startTime), end_time: toApiDate(row.endTime) }));

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await submitParticipantAvailability(publicToken, {
        availability: {
          available_blocks: availableBlocks,
          maybe_blocks: maybeBlocks,
        },
      });

      if (response.status !== 'collecting_availability') {
        setIsClosed(true);
      }

      setSuccessMessage('Availability saved. You can edit and save again until collection closes.');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          clearAccessToken();
          navigate('/login', { replace: true, state: { from: `/meetings/join/${publicToken}` } });
          return;
        }

        if (error.status === 409) {
          setIsClosed(true);
        }

        setErrorMessage(error.detail);
      } else {
        setErrorMessage('Could not save availability. Try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="availability-page">
      <main className="availability-container">
        <header className="availability-header">
          <p className="availability-overline">Participant availability</p>
          <h1>Define your availability for this meeting</h1>
          <p>
            Link token: <code>{publicToken}</code>
            {userEmail ? ` · logged in as ${userEmail}` : ''}
          </p>
        </header>

        <section className="availability-card">
          <div className="availability-card__head">
            <h2>Time blocks</h2>
            <button className="availability-secondary-btn" type="button" onClick={addRow} disabled={isClosed}>
              Add block
            </button>
          </div>

          <div className="availability-grid">
            {rows.map((row, index) => (
              <article key={row.id} className="availability-row">
                <div className="availability-row__meta">Block {index + 1}</div>
                <label>
                  Start
                  <input
                    type="datetime-local"
                    value={row.startTime}
                    onChange={(event) => updateRow(row.id, { startTime: event.target.value })}
                    disabled={isClosed}
                  />
                </label>
                <label>
                  End
                  <input
                    type="datetime-local"
                    value={row.endTime}
                    onChange={(event) => updateRow(row.id, { endTime: event.target.value })}
                    disabled={isClosed}
                  />
                </label>
                <label>
                  Status
                  <select
                    value={row.kind}
                    onChange={(event) => updateRow(row.id, { kind: event.target.value as AvailabilityKind })}
                    disabled={isClosed}
                  >
                    <option value="available">Available</option>
                    <option value="maybe">Maybe</option>
                  </select>
                </label>
                <button className="availability-remove-btn" type="button" onClick={() => removeRow(row.id)} disabled={isClosed}>
                  Remove
                </button>
              </article>
            ))}
          </div>

          <div className="availability-card__actions">
            <button
              className="availability-primary-btn"
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? 'Saving…' : 'Save availability'}
            </button>
          </div>

          {successMessage && <p className="availability-message availability-message--success">{successMessage}</p>}
          {errorMessage && <p className="availability-message availability-message--error">{errorMessage}</p>}
          {isClosed && (
            <p className="availability-message availability-message--warning">
              Availability collection is closed for this meeting. Editing is disabled.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
