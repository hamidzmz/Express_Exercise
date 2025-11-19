# Project Report Outline

Use this template to build the written report (Word/PDF). Screenshot the diagrams and Postman/curl responses once you deploy the project in Codespaces.

## 1. Introduction
- Project goals and learning objectives.
- Technology stack overview.

## 2. Architecture Diagram
- MVC layout showing controllers, models, routes, and the MongoDB cluster.
- Middleware chain (logger → parser → global limiter → per-route limiter → auth → controller → error handler).

## 3. Environment Configuration
- `.env` variables (PORT, JWT_SECRET, JWT_EXPIRES_IN, MONGODB_URI, TLS paths).
- How the self-signed certificate was produced (OpenSSL command).

## 4. Middleware Descriptions
- Logger: purpose and sample log line.
- Rate limiter: algorithm/window, expected HTTP codes.
- Authentication: header format and error responses.
- Error handler: JSON schema returned on failure.

## 5. API Endpoints and Sample Responses
- Include curl/Postman examples for each CRUD method.
- Document failure scenarios (401, 404, 429).

## 6. Security Considerations
- HTTPS enforcement.
- Secrets management with `.env` (JWT secret, Mongo URI, TLS paths).
- Per-route rate limiting strategy.
- JWT issuance/verification flow (login endpoint, token lifetime).
- Docker isolation story.

## 7. Testing & Validation
- Manual testing steps performed.
- Tools (curl/Postman) and screenshots/reports.

## 8. Conclusion & Future Work
- Lessons learned.
- Possible enhancements (JWT hardening, managed DB, Docker optimizations, per-route limiter tweaks).
