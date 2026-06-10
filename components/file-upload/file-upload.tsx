'use client';

import { Dropzone } from '@/components/dropzone';
import { FileChip } from '@/components/file-chip';
import type { Project } from '@/lib/project';

type FileUploadProps = {
  project: Project | null;
  onFiles: (files: File[]) => void;
  // Present when the browser supports directory access; clicking the dropzone
  // then opens the folder picker instead of the upload input.
  onPickDirectory?: () => void;
  onRemove: () => void;
};

export function FileUpload({
  project,
  onFiles,
  onPickDirectory,
  onRemove,
}: FileUploadProps) {
  if (project) {
    return (
      <FileChip
        fileCount={project.files.length}
        totalBytes={project.totalBytes}
        onRemove={onRemove}
      />
    );
  }
  return <Dropzone onFiles={onFiles} onPickDirectory={onPickDirectory} />;
}
