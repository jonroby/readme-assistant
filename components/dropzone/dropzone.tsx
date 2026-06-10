'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

type DropzoneProps = {
  accept?: string;
  onFile: (file: File) => void;
};

export function Dropzone({
  accept = '.md,.txt,text/plain,text/markdown',
  onFile,
}: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
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
        <span className="text-xs text-muted-foreground">.md or .txt files</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </>
  );
}
