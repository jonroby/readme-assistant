'use client';

import { Dropzone } from '@/components/dropzone';
import { FileChip } from '@/components/file-chip';
import type { Project } from '@/lib/project';

type FileUploadProps = {
  project: Project | null;
  onFiles: (files: File[]) => void;
  onRemove: () => void;
};

export function FileUpload({ project, onFiles, onRemove }: FileUploadProps) {
  if (project) {
    return (
      <FileChip
        fileCount={project.files.length}
        totalBytes={project.totalBytes}
        onRemove={onRemove}
      />
    );
  }
  return <Dropzone onFiles={onFiles} />;
}
