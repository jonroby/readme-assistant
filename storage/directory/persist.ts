import type { DirectoryHandle } from '@/lib/directory';

// The picked project folder's writable handle, persisted so we can write the
// README back into it across reloads. Why IndexedDB and not localStorage: a
// FileSystemDirectoryHandle is a live object, not a string. localStorage only
// stores strings (JSON.stringify would drop it). IndexedDB uses structured
// clone, the one mechanism the spec allows to persist a handle so it can be
// reconnected in a later session.

const DB_NAME = 'readme-assistant';
const STORE = 'handles';
const KEY = 'project-dir';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = run(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

export function saveDirectory(handle: DirectoryHandle): Promise<unknown> {
  return tx('readwrite', (store) => store.put(handle, KEY));
}

export function loadDirectory(): Promise<DirectoryHandle | undefined> {
  return tx<DirectoryHandle | undefined>('readonly', (store) =>
    store.get(KEY),
  );
}

export function clearDirectory(): Promise<unknown> {
  return tx('readwrite', (store) => store.delete(KEY));
}
