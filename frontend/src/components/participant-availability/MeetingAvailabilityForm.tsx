import type {TimeBlockPayload} from "../../api/meetings.ts";
import {type FormEvent, useState} from "react";
import {ParticipantTimingSelection} from "./ParticipantTimingSelection.tsx";

interface MeetingAvailabilityFormProps {
    publicToken: string;
    proposedBlocks: TimeBlockPayload[];
    // Opcjonalnie: funkcja wywoływana po udanym zapisie (np. odświeżenie danych)
    onSuccessCallback?: () => void;
}

export function MeetingAvailabilityForm({
                                            publicToken,
                                            proposedBlocks,
                                            onSuccessCallback,
                                        }: MeetingAvailabilityFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
        availableBlocks: TimeBlockPayload[],
    ) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        // Budujemy payload precyzyjnie pod model MeetingVoteRequest (Pydantic)
        const payload = {
            availability: {
                available_blocks: availableBlocks,
                maybe_blocks: [], // Domyślnie puste, zgodnie z max_length=100
                coordinates: null, // Domyślnie null, zgodnie z opcjonalnością
            },
        };

        try {
            // UWAGA: Upewnij się, że adres URL jest poprawny dla Twojego środowiska.
            // Skoro endpoint ma `Depends(get_current_user)`, upewnij się że wysyłasz ciasteczka
            // (credentials: "include") lub nagłówek Authorization (Bearer token).
            const response = await fetch(`/join/${publicToken}/availability`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `Bearer ${localStorage.getItem('token')}` // Odkomentuj jeśli używasz JWT
                },
                body: JSON.stringify(payload),
                // credentials: "include", // Odkomentuj jeśli autoryzacja opiera się na ciasteczkach
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.detail || "Nie udało się zapisać Twojej dostępności.",
                );
            }

            setSuccessMessage("Pomyślnie zapisano Twoją dostępność!");
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Wystąpił nieznany błąd.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ParticipantTimingSelection
            proposedBlocks={proposedBlocks}
            onSubmit={handleSubmit}
            errorMessage={errorMessage}
            successMessage={successMessage}
            isSubmitting={isSubmitting}
        />
    );
}