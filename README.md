# README Assistant

A local web app where you chat with an AI assistant that inspects a project's
files and helps you write or improve its README. You point it at a folder,
browse the file tree, ask it to write a README, and it reads the relevant files,
drafts the README, and saves it back to disk.

Built with the [Vercel AI SDK](https://sdk.vercel.ai), Next.js, and OpenAI.

**Live demo:** [readme-assistant.vercel.app](https://readme-assistant.vercel.app/)

## How it works

### Loading a project

On Chromium browsers (Chrome/Edge) you pick a folder via the File System Access
API, which gives the app a writable handle to that folder. On other browsers you
upload a folder (click or drag-and-drop), which is read into the browser. Either
way the project is capped at 1 MB and OS noise (`.DS_Store`, `.git`,
`node_modules`, …) is skipped. All three load methods produce the same
folder-relative file structure.

The loaded project is a **snapshot** — editing files on disk afterwards won't be
reflected until you re-load the folder (there's an info note in the UI saying
so).

### The workspace

Once a project is loaded the layout is **`file tree | (file viewer) | chat`**:

- **File tree** (left sidebar) shows the project's folders and files. Folders
  expand/collapse; the header shows the project (folder) name. The sidebar
  collapses to a thin icon rail to give the chat more room.
- **File viewer** (center, only when a file is open) shows a file's contents
  with **syntax highlighting** ([Shiki](https://shiki.style)). Click a file in
  the tree to open it; the chat shifts to share the space 50/50. Close it to
  re-center the chat.
- **Chat** (right) is the conversation with the assistant.

### Chatting with file context

Only a *signal that a project is loaded* is sent to the model up front — not the
file list. The model discovers the project itself through tools:

- **`listFiles`** — list paths (optionally under a directory prefix).
- **`searchFiles`** — search file contents for a string.
- **`readFile`** — read a file's full contents.
- **`findExistingReadme`** — check for and read an existing README, so the model
  improves it rather than replacing it blindly.
- **`writeReadme`** — stage a generated README for saving.

All tools are **resolved in the browser** (the files live there), so the project
is never dumped into the prompt — this scales to large folders. The assistant
runs a short agentic loop (discover → read what it needs → answer or write), and
the UI shows each step (e.g. "🗂️ Listing files", "🔎 Searching…", "📄 Reading…",
"✍️ Writing README…").

### Generating and saving the README

When the model writes a README, a **Save README to disk** button appears inline,
beneath that message — so the save is a deterministic UI action over the draft,
not dependent on the model. Clicking it:

- **With a picked folder (Chromium):** writes `README.md` straight back into the
  folder. If a README already exists, you're asked to confirm the overwrite
  first.
- **Otherwise:** opens the browser's save dialog (which prompts on overwrite
  itself).

The write is always behind your click — nothing is saved automatically.

### Persistence

The project files and the conversation are saved in `localStorage`, and the
folder handle in IndexedDB, so reloading the page restores your session.
**Clear project** (in the sidebar) wipes all of it after a confirmation.

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

1. On the start screen, pick (or drag-and-drop) a project folder.
2. Browse the tree; click a file to view it.
3. Ask a question about the project, or ask it to **generate a README**
   (in any language — it follows your request).
4. Watch the assistant explore the files (shown as activity lines in the chat).
5. When it drafts a README, click **Save README to disk** to write the file.

## Testing

Tool runners are unit-tested with [Vitest](https://vitest.dev):

```bash
npm test
```

## Notes & limitations

- The project and conversation live in the browser (`localStorage`; the folder
  handle in IndexedDB). There is no server-side storage.
- After a reload the browser re-asks for permission to the saved folder on your
  first save — this is required by the File System Access API.
- 1 MB upload cap with no content filtering beyond OS noise; keep the folder
  lean (no `node_modules`).
- The loaded project is a snapshot; re-load to pick up on-disk changes.
- Uses the `gpt-4o` model.

## Tech stack

Next.js (App Router) · React · Tailwind CSS · shadcn/ui · Vercel AI SDK v6 ·
OpenAI · Shiki · `react-markdown` · Vitest.
