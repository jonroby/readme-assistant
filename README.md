# README Assistant

A local web app where you chat with an AI assistant that inspects a project's
files and helps you write or improve its README. You point it at a folder,
browse the file tree, ask it to write a README, and it reads the relevant files,
drafts the README, and saves it back to disk.

Built with the [Vercel AI SDK](https://sdk.vercel.ai), Next.js, and OpenAI.

**Live demo:** [readme-assistant.vercel.app](https://readme-assistant.vercel.app/)

## What this is

The assistant is a small **agent**: instead of being handed the whole project up
front, it's given a set of file-inspection tools and discovers the codebase on
its own — listing files, searching contents, and reading the ones that matter —
before drafting a README grounded in what's actually there. The point is to keep
the README *accurate to the code* rather than hallucinated, and to scale to
projects far larger than would fit in a single prompt.

Everything runs in the browser. The files you load never leave your machine —
the tools execute client-side, and only what the model explicitly reads gets
sent to the API. When a README is ready, you review it (with an optional diff
against the existing one) and save it straight back to the folder on disk.

It's intentionally scoped to one job — generating and improving a README — and
does it end to end: discover → read → draft → review → save.

For how it works under the hood — the load step, the tool loop, the review/save
flow, and the design decisions behind them — see [`NOTES.md`](./NOTES.md).

## Prerequisites

- Node.js 20.9 or newer (required by Next.js 16)
- An OpenAI API key
- A Chromium-based browser (Chrome or Edge) to write the README back into the
  folder — this uses the File System Access API.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your OpenAI API key. Create a `.env.local` file in the project root:

   ```bash
   OPENAI_API_KEY=sk-...
   ```

   The AI SDK's OpenAI provider reads this automatically.

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Testing

Pure logic — the tool runners, the diff, and the snapshot update — is
unit-tested with [Vitest](https://vitest.dev):

```bash
npm test
```

## Notes & limitations

- Runs entirely in the browser: the project and conversation live in
  `localStorage`, the folder handle in IndexedDB. There is no server-side
  storage.
- Writing the README back to disk needs a Chromium browser (File System Access
  API). After a reload the browser re-asks for folder permission on your first
  save.
- 1 MB load cap with no content filtering beyond OS noise; keep the folder lean.
- The loaded project is a snapshot; re-load to pick up on-disk changes.
- Uses the `gpt-4o` model.

## Tech stack

Next.js (App Router) · React · Tailwind CSS · shadcn/ui · Vercel AI SDK v6 ·
OpenAI · Shiki · `react-markdown` · Vitest.
