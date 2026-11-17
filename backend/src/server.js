import { GoogleAuth } from 'google-auth-library';
import { createVeoClient } from './veo.js';
import { createApp } from './app.js';

const project = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const model = process.env.VEO_MODEL || 'veo-3.1-fast-generate-001';
const enabled = process.env.VEO_ENABLE_GENERATION === 'true';
const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
const client = project ? createVeoClient({ project, location, model, getToken: () => auth.getAccessToken() }) : null;
const app = createApp({ client, enabled, model, origin: process.env.APP_ORIGIN || 'http://localhost:5173' });
// Loopback only: this prototype is intended to run beside Qool on the developer's computer.
app.listen(Number(process.env.PORT || 3001), '127.0.0.1', () => console.log('Qool Veo backend listening on loopback. Generation ' + (enabled && client ? 'enabled.' : 'disabled; configure backend/.env first.')));
