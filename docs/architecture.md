# J.A.R.V.I.S Enterprise Code Reviewer Architecture

## System Overview
J.A.R.V.I.S is a Serverless, Cloud-Native application deployed on Google Cloud Run. It utilizes a microservices architecture separating the React frontend from the FastAPI backend.

## Multi-Agent Orchestration
Instead of a single LLM prompt, J.A.R.V.I.S leverages an asynchronous multi-agent routing system:
1. **Security Auditor Agent:** Scans specifically for OWASP vulnerabilities and edge cases.
2. **Performance Guru Agent:** Mathematically calculates Big-O Time & Space complexity.
3. **Clean Code Architect:** Ensures enterprise design patterns and readability.

The master Node aggregates these responses into a single JSON report.

## Database & Storage
- **Google Cloud Firestore:** Stores user review history, code snippets, and aggregated metrics.
- **Google BigQuery:** Acts as the knowledge base for Retrieval-Augmented Generation (RAG).

## Security & BYOK
- Supports Bring Your Own Key (BYOK) architecture. Users can inject their own Google Gemini API keys via frontend settings, securely passed via `X-API-Key` headers without backend storage.
