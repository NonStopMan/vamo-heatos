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

If uncertain:

- Ask for clarification
- Or choose the simplest reasonable solution
