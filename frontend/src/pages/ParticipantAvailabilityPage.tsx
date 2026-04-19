import { type FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { clearAuthSession, logout } from "../api/auth";
import { ApiError } from "../api/client";
import {
  fetchMeetingByPublicToken,
  submitParticipantAvailability,
  type MeetingJoinResponse,
  type TimeBlockPayload,
} from "../api/meetings";
import { ParticipantAvailabilityCardShell } from "../components/participant-availability/ParticipantAvailabilityCardShell";
import { ParticipantAvailabilityClosedState } from "../components/participant-availability/ParticipantAvailabilityClosedState";
import { ParticipantAvailabilityFooter } from "../components/participant-availability/ParticipantAvailabilityFooter";
import { ParticipantAvailabilityGlobalStyles } from "../components/participant-availability/ParticipantAvailabilityGlobalStyles";
import { ParticipantAvailabilityNav } from "../components/participant-availability/ParticipantAvailabilityNav";
import "../styles/availability.css";
import { ParticipantTimingSelection } from "../components/participant-availability/ParticipantTimingSelection";

export function ParticipantAvailabilityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { publicToken } = useParams<{ publicToken: string }>();
  const [meeting, setMeeting] = useState<MeetingJoinResponse | null>(null);
  const [isMeetingLoading, setIsMeetingLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isCreatePage = location.pathname === "/create";

  useEffect(() => {
    if (!publicToken) {
      return;
    }

    let isMounted = true;

    void fetchMeetingByPublicToken(publicToken)
      .then((meetingResponse) => {
        if (isMounted) {
          setMeeting(meetingResponse);
        }
      })
      .catch((error) => {
        console.error("Failed to load meeting by public token:", error);
        if (error instanceof ApiError && error.status === 401) {
          clearAuthSession();
          navigate("/login", {
            replace: true,
            state: { from: `/meetings/join/${publicToken}` },
          });
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsMeetingLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [navigate, publicToken]);

  const shouldRenderClosedState =
    meeting?.status !== "collecting_availability" &&
    meeting?.status !== undefined;

  async function handleLogout(): Promise<void> {
    try {
      await logout();
    } catch {
      // Ensure client session is always cleared even if API logout fails.
    } finally {
      clearAuthSession();
      navigate("/");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    availableBlocks: TimeBlockPayload[],
  ): Promise<void> {
    event.preventDefault();

    if (!publicToken) {
      setErrorMessage("Missing meeting token in URL.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await submitParticipantAvailability(publicToken, {
        availability: {
          available_blocks: availableBlocks,
          maybe_blocks: [],
          coordinates: null,
        },
      });

      setMeeting((current) =>
        current ? { ...current, status: response.status } : current,
      );
      setSuccessMessage("Availability saved.");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          clearAuthSession();
          navigate("/login", {
            replace: true,
            state: { from: `/meetings/join/${publicToken}` },
          });
          return;
        }

        if (error.status === 409) {
          setMeeting((current) =>
            current ? { ...current, status: "finalized" } : current,
          );
        }

        setErrorMessage(error.detail);
      } else {
        setErrorMessage("Could not save availability. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="antialiased min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed bg-surface text-on-surface">
      <ParticipantAvailabilityGlobalStyles />

      <ParticipantAvailabilityNav
        isCreatePage={isCreatePage}
        onCreateNew={() => navigate("/create")}
        onLogout={() => {
          void handleLogout();
        }}
      />

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-16 md:py-24">
        <ParticipantAvailabilityCardShell>
          {isMeetingLoading ? (
            <p className="availability-message">Loading meeting details...</p>
          ) : shouldRenderClosedState && meeting ? (
            <ParticipantAvailabilityClosedState meeting={meeting} />
          ) : (
            <ParticipantTimingSelection
              proposedBlocks={meeting?.proposed_blocks ?? []}
              onSubmit={handleSubmit}
              errorMessage={errorMessage}
              successMessage={successMessage}
              isSubmitting={isSubmitting}
            />
          )}
        </ParticipantAvailabilityCardShell>
      </main>

      <ParticipantAvailabilityFooter />
    </div>
  );
}
