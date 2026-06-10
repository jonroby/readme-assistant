'use client';

import { Dropzone } from '@/components/dropzone';
import { FileChip } from '@/components/file-chip';

export type UploadedFile = { name: string; content: string };

type FileUploadProps = {
  file: UploadedFile | null;
  onFile: (file: File) => void;
  onRemove: () => void;
};

export function FileUpload({ file, onFile, onRemove }: FileUploadProps) {
  if (file) {
    return <FileChip fileName={file.name} onRemove={onRemove} />;
  }
  return <Dropzone onFile={onFile} />;
}
