# Admin Security and Driver Eligibility Phases

## Phase 1 — Admin Security Baseline and Authority

Status: Complete — administrator acceptance verified

Checklist:

Complete: Establish server-controlled administrator authority for the two approved founding administrators.
Complete: Require a verified authenticated session and AAL2 multi-factor authentication for future administrator-only routes.
Complete: Provide administrator enrollment for a primary and backup TOTP authenticator.
Complete: Record the approved MFA, passkey, SMS, email-code, and privacy boundaries without enabling staff review yet.
Complete: Keep the existing driver eligibility gate unchanged.

## Phase 2 — Private Driver-Eligibility Review Portal

Status: In Progress — implementation complete; manual acceptance pending

Checklist:

Complete: Add administrator-only review actions and an append-only review audit trail for private driver documents.
Complete: Show drivers safe, signed-in status and reason messages without placing document details in email.
Complete: Require the Phase 1 administrator authority and AAL2 protection for every review action.
Complete: Provide private document previews through 10-minute signed URLs.
In-Progress: Perform manual AAL2 administrator review and driver-facing acceptance checks.

## Phase 3 — Retention and Generic Notifications

Status: Planned — provider decision deferred

Checklist:

Planned: Apply the approved document-retention windows and deletion lifecycle.
Planned: Send generic action-required notifications that reveal no document type, reason, expiry, attachment, or privileged portal link.
Planned: Select and configure the email provider when this phase starts.

## Phase 4 — Administrator Analytics

Status: Planned

Checklist:

Planned: Design separate Operations, Finance, and Trust & Safety dashboards using privacy-preserving aggregates and auditable data sources.
Planned: Define reliable presence, financial, account-lifecycle, security-incident, and future support-ticket data before reporting metrics.
Planned: Defer role-specific analyst and staff access until its own approved authorization phase.

## Phase Commit Rule

No phase or sub-phase is committed until its planned steps and acceptance criteria are complete, reviewed, and explicitly approved. A Phase Commit supplements the repository commit convention with the required `Phase` section; it does not replace the required `What changed`, `Why`, `Collaboration`, `Boundaries`, and `Validation` sections.
