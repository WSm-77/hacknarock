## Plan: Dostępność uczestników z ograniczeniem bloków

Zrobimy dedykowany przepływ dla uczestnika: UI będzie pozwalał zaznaczać tylko sloty mieszczące się w `proposed_blocks`, a zapis pójdzie przez `POST /meetings/join/{public_token}/availability` zamiast tworzenia spotkania. Plan obejmuje też walidację po stronie backendu, żeby blokada była odporna na ręczne requesty, oraz uporządkowanie kontraktu statusów i typów, który teraz jest niespójny między frontem i backendem.

### Steps
1. Ustalić kontrakt statusów w [backend/src/database/meeting_states.py](backend/src/database/meeting_states.py) i [frontend/src/api/meetings.ts](frontend/src/api/meetings.ts) dla `MeetingStatus`.
2. Zastąpić użycie `useCreateMeeting` w [frontend/src/pages/ParticipantAvailabilityPage.tsx](frontend/src/pages/ParticipantAvailabilityPage.tsx) dedykowanym submitem `submitParticipantAvailability`.
3. Przebudować [frontend/src/components/participant-availability/ParticipantTimingSelection.tsx](frontend/src/components/participant-availability/ParticipantTimingSelection.tsx), by przyjmował `proposed_blocks` i emitował `available_blocks`/`maybe_blocks`.
4. Zablokować interakcję poza dozwolonymi slotami w `ParticipantTimingSelection` na podstawie mapy dozwolonych kafli z `meeting.proposed_blocks`.
5. Dodać backendową walidację subsetu w `MeetingService.submit_participant_availability` w [backend/src/meetings/service.py](backend/src/meetings/service.py) przed zapisem `ParticipantVoteORM`.
6. Dodać testy API i UI dla: blokady niedozwolonych slotów, poprawnego payloadu, oraz zapisu głosu.

### Further Considerations
1. Jak traktujemy statusy po deadlinie? A) tylko `finalized` zamyka głosowanie, B) każdy poza `collecting_availability` zamyka, C) lista konfigurowalna.
2. Jak ma działać wybór statusu uczestnika? A) tylko `available`, B) przełącznik `available/maybe`, C) dwa oddzielne tryby zaznaczania.
3. Gdzie egzekwujemy ograniczenie do `proposed_blocks`? A) tylko frontend, B) frontend + backend (rekomendowane), C) tylko backend. 

