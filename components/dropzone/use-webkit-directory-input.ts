'use client';

import { useEffect, useRef } from 'react';

/**
 * A ref for a file <input> that selects whole folders. `webkitdirectory` and
 * `directory` must be set via the DOM — React doesn't render them reliably — so
 * an effect sets them on mount. Attach the returned ref to the input.
 */
export function useWebkitDirectoryInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute('webkitdirectory', '');
      inputRef.current.setAttribute('directory', '');
    }
  }, []);

  return inputRef;
}
