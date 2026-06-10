'use client';

import { useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { FileUpload } from '@/components/file-upload';
import { MessageList } from '@/components/message-list';
import { ChatInput } from '@/components/chat-input';
import {
  clearProject,
  loadProject,
  readProject,
  saveProject,
  type Project,
} from '@/lib/project';

export default function Home() {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { messages, sendMessage, setMessages, stop, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const busy = status === 'streaming' || status === 'submitted';

  // Restore a previously uploaded project from localStorage.
  useEffect(() => {
    setProject(loadProject());
  }, []);

  const handleFiles = async (files: File[]) => {
    setError(null);
    try {
      const next = await readProject(files);
      saveProject(next);
      setProject(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read project.');
    }
  };

  const handleRemove = () => {
    stop();
    clearProject();
    setProject(null);
    setMessages([]);
  };

  const handleSend = (text: string) => {
    if (!project) return;
    const projectText = project.files
      .map((f) => `=== ${f.path} ===\n${f.content}`)
      .join('\n\n');
    sendMessage({ text }, { body: { projectText } });
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-background">
      <main className="flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
        <FileUpload
          project={project}
          onFiles={handleFiles}
          onRemove={handleRemove}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <MessageList
          messages={messages}
          emptyText={
            project
              ? 'Ask a question about your project.'
              : 'Upload a project folder to get started.'
          }
        />

        <ChatInput
          onSend={handleSend}
          disabled={!project || busy}
          placeholder={
            project ? 'Ask about your project...' : 'Upload a project first'
          }
        />
      </main>
    </div>
  );
}
