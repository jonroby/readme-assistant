# README Assistant

A local web app where you chat with an AI assistant that inspects a project's
files and helps you generate a README for it. You point it at a folder, ask it
to write a README, and it reads the relevant files, drafts the README, and saves
it to disk.

Built with the [Vercel AI SDK](https://sdk.vercel.ai), Next.js, and OpenAI.

**Live demo:** [readme-assistant.vercel.app](https://readme-assistant.vercel.app/)

## How it works

- **Load a project.** On Chromium browsers (Chrome/Edge) you pick a folder via
  the File System Access API, which gives the app a writable handle to that
  folder. On other browsers you upload a folder, which is read into the browser
  and kept in `localStorage`. Either way the project is capped at 1 MB and OS
  noise (`.DS_Store`, `.git`, `node_modules`, …) is skipped.
- **Chat with file context.** Only the file *paths* are sent to the model up
  front. When it needs a file's contents it calls the `readFile` tool, which is
  resolved in the browser (the files live there) — so the whole project is never
  dumped into the prompt.
- **Generate the README.** When you ask it to generate a README, the model
  drafts one and calls the `writeReadme` tool. A **Save README to disk** button
  appears; clicking it writes the file. With a picked folder it writes
  `README.md` straight back into that folder; otherwise it opens a save dialog.
  The write is always behind that click, so nothing is written without your
  confirmation.

The assistant has two tools — `readFile` and `writeReadme` — and runs a short
agentic loop (read what it needs, then answer or write).

## Prerequisites

- Node.js 20.9 or newer (required by Next.js 16)
- An OpenAI API key
- For writing the README back into the project folder: a Chromium-based browser
  (Chrome or Edge). Other browsers fall back to a download / save dialog.

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

## Usage

1. Click the dropzone and pick (or upload) a project folder.
2. Ask a question about the project, or ask it to **generate a README**.
3. Watch the assistant read the files it needs (shown as "📄 Reading …").
4. When it drafts a README, click **Save README to disk** to write the file.

## Notes & limitations

- The project is held in the browser (`localStorage` for contents; the folder
  handle in IndexedDB so it's remembered across reloads). There is no server-side
  storage.
- After a reload the browser re-asks for permission to the saved folder on your
  first save — this is required by the File System Access API.
- 1 MB upload cap with no content filtering beyond OS noise; keep the folder
  lean (no `node_modules`).
- Uses the `gpt-4o` model.

## Tech stack

Next.js (App Router) · React · Tailwind CSS · shadcn/ui · Vercel AI SDK v6 ·
OpenAI · `react-markdown`.
