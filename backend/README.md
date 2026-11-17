# Qool Veo API prototype

This backend calls the official Vertex AI Veo API. It does not automate Google Flow. Google Flow credits/subscriptions do not supply Vertex AI API credits, and results may differ from Flow.

## Google prerequisites

- A Google Cloud project with billing, Vertex AI API enabled, Veo model availability and quota in the selected region.
- Confirm the current price and whether your trial credits cover this model **before enabling generation**. No free credits are included or promised by Qool.
- Local Application Default Credentials (ADC), with permission to invoke Vertex AI (typically `roles/aiplatform.user`). Use your approved organization authentication method. Never put credentials in React, `VITE_` variables, Git, or chat.
- Node.js 24 and npm. Your laptop does not need a GPU; inference runs at Google.

`veo-3.1-fast-generate-001` and `us-central1` are configurable defaults, not a guarantee of project availability. Verify both in Google's current Vertex AI model catalog. The integration requests one 8-second 720p video with audio, a starting portrait, and adult-person generation. No recorded audio is submitted. Longer scripts may not fit. Lebanese Arabic and portrait/lip-sync quality must be tested with a real authorized project.

## Windows / VS Code

From the repository root, use Terminal → New Terminal:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Edit `backend/.env` locally. Set `GOOGLE_CLOUD_PROJECT` and verify model/region. Keep `VEO_ENABLE_GENERATION=false` while configuring access.

Install the official [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) if needed. Set up local ADC with your authorized account:

```powershell
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
```

If your organization requires a service account, set `GOOGLE_APPLICATION_CREDENTIALS` to its protected credential-file path instead. Do not copy that file into the repository. In deployed environments prefer attached service identities or workload identity rather than long-lived keys.

After verifying model access, quota, prices and credit eligibility, set `VEO_ENABLE_GENERATION=true` in `.env`, then start:

```powershell
npm run dev
```

In a **second terminal**, from the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to the loopback backend on port 3001. `APP_ORIGIN` must match the exact browser origin, including the port; if Vite chooses another port, update it and restart the backend. Requests from a different host/origin are rejected.

Navigate through the existing workflow. On Generate, check the configuration notice, consent to sending the portrait/dialogue and possible credit use, then select **Generate video with Veo**. Qool submits once, polls the returned Google operation every 10 seconds, and shows a real MP4/download only after Google returns one. There is no simulated generation or progress percentage. Prompt-only mode remains available.

## Job behavior and limits

This is a **local, single-user prototype**, not a public deployment backend. It binds to loopback. Do not publish a tunnel or expose it publicly: add user authentication, per-user job ownership, durable storage/queues, spending controls and deployment configuration first.

Only one job can run at a time, with a 30-second submission cooldown. In-memory jobs/videos expire after one hour; at most three jobs are retained, with older completed jobs evicted. Backend restarts lose them. Download videos promptly. The current browser tab stores a job ID in session storage and reconnects after refresh; clearing/forgetting that ID does not cancel Google work or charges. When job lookup fails or submission is ambiguous, check Google Cloud before submitting again. A failed or disconnected request can still have consumed credits. Google billing budgets are alerts, not hard spending caps.

The backend does not save portraits or prompts to disk or log credentials. They are sent to Google when generation is requested. Videos are kept temporarily in memory and served only through local endpoints. Backend errors expose sanitized messages. Follow Google's applicable data handling and content policies.

## Tests

```powershell
npm test
```

Tests mock Google responses and cover request structure, exact prompt/image forwarding, pending/completed/filtered jobs, authentication/access/quota errors, invalid uploads, origin/host checks, cost consent, duplicate prevention, download contents, and job expiration. They do not establish live Veo access, price, credit coverage, or video quality.
