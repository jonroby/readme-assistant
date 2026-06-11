'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { readDroppedEntries } from '@/storage/project';

type DropzoneProps = {
  onFiles: (files: File[]) => void;
  // When set (browser supports directory access), clicking picks a folder via
  // the File System Access API instead of the upload input.
  onPickDirectory?: () => void;
};

export function Dropzone({ onFiles, onPickDirectory }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // `webkitdirectory` must be set via the DOM; React doesn't render it reliably.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute('webkitdirectory', '');
      inputRef.current.setAttribute('directory', '');
    }
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() =>
          onPickDirectory ? onPickDirectory() : inputRef.current?.click()
        }
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setDragging(false);
          const files = await readDroppedEntries(e.dataTransfer);
          if (files.length) onFiles(files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging
            ? 'border-primary bg-accent'
            : 'border-border hover:border-primary/50 hover:bg-accent/50'
        }`}
      >
        <Upload className="size-6 text-muted-foreground" />
        <span className="text-sm font-medium">
          Drop a project folder or click to upload
        </span>
        <span className="text-xs text-muted-foreground">Max 1 MB total</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(Array.from(e.target.files));
        }}
      />
    </>
  );
}
