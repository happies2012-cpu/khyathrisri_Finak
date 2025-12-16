# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

# Rocket Launchpad (KSF)

Rocket Launchpad is a demo hosting/control-panel platform built with React, TypeScript, Vite, and Tailwind. This repository contains the frontend UI and client-side scaffolding for payments, hosting provisioning, and AI integrations — configured to run locally in demo (mock) mode without any third-party API keys.

Important: This repo intentionally ships with mock providers for payments and AI in order to run without secrets. Replace environment variables and enable server-side integrations before using in production.

Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Build for production
npm run build
```

Recommended workflow

- Edit code in `src/` and run `npm run dev`.
- Replace mock providers in `src/services/paymentProviders` and `src/services/ai` with real provider SDKs and add server-side webhooks for secure verification.
- Use the `supabase/` directory for reference serverless functions and database migrations; adapt to your preferred backend.

How to push to GitHub from your machine

```bash
git add .
git commit -m "Apply KSF branding and initial scaffolding"
git push origin main
```

If you prefer, I can prepare the commit locally and show the exact `git` commands to run next.

Notes and next steps

- Google OAuth: scaffolded placeholders exist; you'll need client IDs for production and a server-side callback for secure sessions. For local/demo testing you can enable mock OAuth by creating a `.env` file with:

```env
VITE_AUTH_MOCK=true
```

When `VITE_AUTH_MOCK` is set, the "Continue with Google" (and other social) buttons will create a demo user locally so you can test flows without external credentials.

- Chatbot: UI scaffold added; current integration uses a mock ChatGPT adapter. Replace with your OpenAI API key or a hosted inference endpoint.
- Payments: mock provider enabled by default. For real gateways (Stripe, Razorpay, PayU), add server-side endpoints and webhooks.
- Production hardening: environment secret management, database migrations, monitoring, and CI/CD pipeline are required before public deployment.

If you want, I will:

- Commit and show `git push` steps (I cannot push on your behalf without credentials).
- Start the Google OAuth and ChatGPT integration scaffolding next.
- Create the role-based admin and hosting provisioning plan and initial server scaffolding.

Tell me which of the next items you want prioritized.
