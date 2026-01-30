# AGENTS.md — AI Coding Instructions

This repository uses AI-assisted code generation.
All generated code must follow the rules below.

## 1. Project Context

This project is a prototype for a **Multi-Channel Lead Intake Funnel**
for HeatOS Sales at Vamo GmbH.

Core goals:

- Correctness over completeness
- Reliability over cleverness
- Clear architecture over premature optimization

This is NOT a UI-heavy or feature-complete product.

---

## 2. Technology Stack (Preferred)

- Backend: NestJS (TypeScript)
- Frontend: Vue 3 (TypeScript)
- Database: MongoDB
- Runtime: Node.js
- Containerization: Docker

If deviating from this stack:

- Clearly justify the reason
- Keep the deviation minimal

---

## 3. Architectural Principles

### Backend

- RESTful API design
- Explicit DTO validation (class-validator or equivalent)
- Persist data **before** calling external systems
- Treat CRM forwarding as a downstream side effect
- Separate concerns:
  - Controllers: HTTP & validation
  - Services: business logic
  - Adapters: CRM integrations
  - Repositories: persistence

### Frontend

- Form-based data entry
- Client-side validation mirrors backend rules
- Minimal styling
- Clear error and success states

---

## 4. Data & Validation Rules

- Server-side validation is authoritative
- Client-side validation improves UX only
- Required fields must be enforced consistently
- Unknown fields:
  - Allowed only inside `metadata`
  - Or explicitly ignored with documentation

---

## 5. Error Handling & Reliability

- Never lose a lead due to downstream failure
- Prefer retries with backoff for external APIs
- Fail loudly in logs, not silently
- Avoid throwing raw errors to clients

---

## 6. Non-Goals (Do NOT over-engineer)

- No microservices
- No event streaming platforms (Kafka, etc.)
- No heavy frontend frameworks or UI libraries
- No premature optimization

---

## 7. AI Usage Expectations

- Generate clear, readable, idiomatic TypeScript
- Prefer explicit code over magic abstractions
- Add comments only where intent is non-obvious
- Avoid speculative features not requested
- For any new feature or issue implementation, add at least unit test cases covering the change

If uncertain:

- Ask for clarification
- Or choose the simplest reasonable solution

---

## 8. Testing Expectations

- Update or add unit tests when behavior changes.
- Use the existing commands:
  - API: `pnpm --filter api test`
  - Web: `pnpm --filter web test:unit`
- If tests are skipped or fail, explain why and what is needed to fix.

## 9. Commit Expectations

- Use clear, imperative commit messages (e.g., “Add health check endpoint”).
- Keep commits focused on one logical change.
- Include docs updates in the same commit when they describe the change.

## 10. Code Style & Formatting

- Follow project tooling for formatting and linting.
- Prefer explicit DTOs and typed payloads over `any`.
- Keep modules small and aligned with the separation of concerns in Section 3.

## 11. Security & Data Handling

- Never commit real secrets to git; use `.env` files and deployment secrets.
- Avoid logging PII unless necessary; redact where possible.
- Treat CRM forwarding as a downstream side effect and do not block persistence on CRM failures.

## 12. Deployment & Ops Notes

- Production requires environment variables for MongoDB, Salesforce (if enabled), and Azure storage.
- Ensure `/health` stays lightweight and safe for monitoring.
- Document any new required env vars in README/docs.
