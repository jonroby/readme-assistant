'use client';

import { useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { FileText, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<{ name: string; content: string } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const busy = status === 'streaming' || status === 'submitted';

  const loadFile = async (f: File) => {
    setFile({ name: f.name, content: await f.text() });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !file) return;
    sendMessage(
      { text: input },
      { body: { fileName: file.name, fileContent: file.content } },
    );
    setInput('');
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-background">
      <main className="flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
        {/* Uploader */}
        {file ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText className="size-5 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm font-medium">{file.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
              aria-label="Remove file"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) loadFile(f);
            }}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragging
                ? 'border-primary bg-accent'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
          >
            <Upload className="size-6 text-muted-foreground" />
            <span className="text-sm font-medium">
              Drop a file or click to upload
            </span>
            <span className="text-xs text-muted-foreground">
              .md or .txt files
            </span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt,text/plain,text/markdown"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) loadFile(f);
          }}
        />

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {file
                ? 'Ask a question about your file.'
                : 'Upload a file to get started.'}
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === 'user'
                  ? 'max-w-[80%] self-end rounded-lg bg-primary px-4 py-2 text-primary-foreground'
                  : 'max-w-[80%] self-start rounded-lg bg-muted px-4 py-2 text-foreground'
              }
            >
              {message.parts.map((part, i) =>
                part.type === 'text' ? <span key={i}>{part.text}</span> : null,
              )}
            </div>
          ))}
        </div>

        {/* Composer */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            placeholder={file ? 'Ask about your file...' : 'Upload a file first'}
            onChange={(e) => setInput(e.target.value)}
            disabled={!file || busy}
          />
          <Button type="submit" disabled={!file || busy}>
            Send
          </Button>
        </form>
      </main>
    </div>
  );
}
