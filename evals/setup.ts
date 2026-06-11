import { config } from 'dotenv';

// Evals call OpenAI directly (not through Next), so Vitest must load the key
// itself — Next's automatic .env.local loading doesn't apply here. Load
// .env.local, then .env, without overriding anything already in the shell env
// (an inline OPENAI_API_KEY=... still wins).
config({ path: '.env.local' });
config({ path: '.env' });
