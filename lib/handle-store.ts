import type { DirectoryHandle } from '@/lib/directory';

// Why IndexedDB and not localStorage: a FileSystemDirectoryHandle is a live
// object, not a string. localStorage only stores strings (JSON.stringify would
// drop it). IndexedDB uses structured clone, the one mechanism the spec allows
// to persist a handle so it can be reconnected in a later session.

const DB_NAME = 'readme-assistant';
const STORE = 'handles';
const KEY = 'project-dir';

// TEMP debug logging — remove once the prod handle-persistence bug is fixed.
const log = (...args: unknown[]) => console.log('[handle-store]', ...args);
const err = (...args: unknown[]) => console.error('[handle-store]', ...args);

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      log('onupgradeneeded — creating store');
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      err('openDb error', req.error);
      reject(req.error);
    };
    req.onblocked = () => err('openDb BLOCKED');
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
        request.onerror = () => {
          err('tx request error', request.error);
          reject(request.error);
        };
      }),
  );
}

export async function saveHandle(handle: DirectoryHandle): Promise<unknown> {
  log('saveHandle ->', handle?.name);
  try {
    const r = await tx('readwrite', (store) => store.put(handle, KEY));
    log('saveHandle OK');
    return r;
  } catch (e) {
    err('saveHandle FAILED', e);
    throw e;
  }
}

export async function loadHandle(): Promise<DirectoryHandle | undefined> {
  try {
    const r = await tx<DirectoryHandle | undefined>('readonly', (store) =>
      store.get(KEY),
    );
    log('loadHandle ->', r ? r.name : 'undefined');
    return r;
  } catch (e) {
    err('loadHandle FAILED', e);
    return undefined;
  }
}

export async function clearHandle(): Promise<unknown> {
  log('clearHandle');
  try {
    const r = await tx('readwrite', (store) => store.delete(KEY));
    log('clearHandle OK');
    return r;
  } catch (e) {
    err('clearHandle FAILED', e);
    throw e;
  }
}
