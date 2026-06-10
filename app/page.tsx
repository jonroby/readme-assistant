'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { FileUpload, type UploadedFile } from '@/components/file-upload';
import { MessageList } from '@/components/message-list';
import { ChatInput } from '@/components/chat-input';

export default function Home() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const { messages, sendMessage, setMessages, stop, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const busy = status === 'streaming' || status === 'submitted';

  const handleFile = async (f: File) => {
    setFile({ name: f.name, content: await f.text() });
  };

  const handleRemove = () => {
    stop();
    setFile(null);
    setMessages([]);
  };

  const handleSend = (text: string) => {
    if (!file) return;
    sendMessage(
      { text },
      { body: { fileName: file.name, fileContent: file.content } },
    );
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-background">
      <main className="flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
        <FileUpload
          file={file}
          onFile={handleFile}
          onRemove={handleRemove}
        />

        <MessageList
          messages={messages}
          emptyText={
            file
              ? 'Ask a question about your file.'
              : 'Upload a file to get started.'
          }
        />

        <ChatInput
          onSend={handleSend}
          disabled={!file || busy}
          placeholder={file ? 'Ask about your file...' : 'Upload a file first'}
        />
      </main>
    </div>
  );
}
