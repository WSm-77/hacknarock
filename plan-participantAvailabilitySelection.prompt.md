## Plan: Align Meeting ORM and API Date Mapping

Unify backend meeting persistence and API models so datetime values are stored and mapped consistently for DB usage, while avoiding immediate client breakage. The recommended approach is phased: fix blocking enum/runtime issues first, then harden UTC persistence and schema consistency, then complete a two-step timezone migration.

**Steps**

1. Phase 1 - Resolve blocking status consistency.
2. Update meeting_states.py to include ready_for_ai and ai_recommended so service transitions and API responses do not fail at runtime.
3. Verify all status comparisons and assignments in service.py reference only enum members from the updated enum. Depends on step 2.
4. Phase 2 - Normalize DB datetime write/read behavior.
5. Update datetime defaults in meeting_orm.py to UTC-aware defaults for created_at and keep deadline storage explicit.
6. Confirm create/update paths in service.py normalize availability_deadline to UTC before persistence and before transition checks. Depends on step 5.
7. Review and standardize datetime normalization before JSON serialization for proposed blocks and participant availability blocks in service.py and participant_vote_orm.py.
8. Phase 3 - Reconcile API model and ORM contract.
9. Align meetings_models.py with persisted structure by ensuring participant availability fields match service/database expectations and by removing or integrating unused ProposedBlock usage.
10. Verify UUID boundary mapping in response builders in service.py remains explicit and stable for MeetingResponse and ParticipantAvailabilityResponse. Parallel with step 9.
11. Phase 4 - Two-step timezone migration (selected).
12. Step 4a now: keep backward-compatible normalization for naive datetimes and add detection hooks in meetings_models.py and service.py.
13. Step 4b later: switch request validation to strict timezone-aware datetimes and reject naive timestamps after client rollout. Depends on step 12.
14. Phase 5 - Verification and regression coverage.
15. Extend tests in test_meetings_router.py for status transitions, UTC deadline behavior, and timezone-safe availability persistence.
16. Add tests for migration behavior: naive inputs accepted/normalized in 4a, then rejected in 4b.
17. Run focused backend verification with uv for meetings/auth datetime-critical flows.

**Relevant files**

- meeting_states.py — canonical status enum used by service and API.
- meeting_orm.py — datetime defaults and DB persistence behavior.
- participant_vote_orm.py — JSON block persistence shape.
- meetings_models.py — request/response schema and datetime contract.
- service.py — normalization, serialization, mapping, and transitions.
- router.py — endpoint model binding.
- test_meetings_router.py — integration coverage.
- test_auth_router.py — auth datetime behavior if shared datetime handling changes.

**Verification**

1. Validate meeting lifecycle transitions including ready_for_ai and ai_recommended.
2. Validate deadline comparisons for UTC-aware and naive payloads under migration mode.
3. Validate proposed_blocks and participant block serialization round-trip without offset drift.
4. Validate UUID and datetime response formatting remains stable.
5. Run manual API smoke path: create meeting, submit availability, pass deadline, trigger recommendation.

**Decisions**

- Timezone policy selected: two-step migration.
- Included scope: backend ORM, service, and model consistency for meeting and availability datetime persistence.
- Excluded scope: frontend UI redesign and unrelated domains.

Saved to session plan file: memories/session/plan.md

If you want, I can now execute this plan in small commits.
