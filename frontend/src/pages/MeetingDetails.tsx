import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { fetchMeetingDetails, type MeetingDetailsResponse } from '../api/integration';
import { MeetingDetailsHeader } from '../components/meeting-details/MeetingDetailsHeader';
import { MeetingDetailsHero } from '../components/meeting-details/MeetingDetailsHero';
import { MeetingDetailsPageStyles } from '../components/meeting-details/MeetingDetailsPageStyles';

export function MeetingDetails() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<MeetingDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadMeetingDetails(): Promise<void> {
      if (!meetingId) {
        if (!isCancelled) {
          setErrorMessage('Missing meeting ID in route.');
          setIsLoading(false);
        }
        return;
      }

      try {
        if (!isCancelled) {
          setIsLoading(true);
        }

        const data = await fetchMeetingDetails(meetingId);
        if (!isCancelled) {
          setDetails(data);
          setErrorMessage(null);
          document.title = `SnapSlot - Meeting ${data.id.slice(0, 8)}`;
        }
      } catch (error) {
        if (!isCancelled) {
          if (error instanceof ApiError) {
            setErrorMessage(error.detail);
          } else {
            setErrorMessage('Failed to load meeting details.');
          }
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadMeetingDetails();

    return () => {
      isCancelled = true;
    };
  }, [meetingId]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <MeetingDetailsPageStyles />
      <MeetingDetailsHeader />

      <main className="flex-grow">
        {errorMessage && !details ? (
          <section className="px-6 py-24">
            <div className="max-w-3xl mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-[0px_20px_48px_-12px_rgba(86,66,60,0.1)] p-10 text-center">
              <h1 className="font-headline text-4xl text-on-surface mb-4 font-medium">Meeting not found</h1>
              <p className="font-body text-lg text-on-surface-variant mb-8">{errorMessage}</p>
              <button
                type="button"
                className="bg-primary text-on-primary px-[26px] py-[12px] rounded font-label font-medium text-sm hover:bg-primary-container transition-colors duration-300"
                onClick={() => navigate('/')}
              >
                Go back home
              </button>
            </div>
          </section>
        ) : (
          <MeetingDetailsHero details={details} isLoading={isLoading} errorMessage={errorMessage} />
        )}
      </main>
    </div>
  );
}
