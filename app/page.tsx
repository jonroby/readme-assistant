'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export default function Home() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-2xl flex-col gap-4 px-4 py-8">
        <div className="flex flex-1 flex-col gap-4">
          {messages.length === 0 && (
            <p className="text-zinc-500 dark:text-zinc-400">
              Ask me anything to get started.
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === 'user'
                  ? 'self-end max-w-[80%] rounded-2xl bg-blue-600 px-4 py-2 text-white'
                  : 'self-start max-w-[80%] rounded-2xl bg-zinc-200 px-4 py-2 text-black dark:bg-zinc-800 dark:text-zinc-50'
              }
            >
              {message.parts.map((part, i) =>
                part.type === 'text' ? <span key={i}>{part.text}</span> : null,
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            value={input}
            placeholder="Say something..."
            onChange={(e) => setInput(e.target.value)}
            disabled={status === 'streaming' || status === 'submitted'}
          />
          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-2 text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
            disabled={status === 'streaming' || status === 'submitted'}
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
