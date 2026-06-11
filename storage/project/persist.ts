import type { Project, DirectoryHandle } from '@/lib/project';

// A Project is split across two browser stores because its parts have two
// natures: name/files/totalBytes are plain data (localStorage, JSON), but the
// folder handle is a live object JSON can't hold — it goes to IndexedDB via
// structured clone, the one mechanism the spec allows to persist a handle so it
// can be reconnected in a later session. saveProject splits; loadProject rejoins.
const STORAGE_KEY = 'project';

// The serializable half of a Project — everything but the handle.
type StoredProject = Omit<Project, 'handle'>;

export function saveProject(project: Project): void {
  const { handle, ...data } = project;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data satisfies StoredProject));
  void saveHandle(handle);
}

export async function loadProject(): Promise<Project | null> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const handle = await loadHandle();
  // No handle means the project's location is gone (different origin, cleared
  // IndexedDB) — it can't be reconnected, so there's nothing usable to restore.
  if (!handle) return null;
  try {
    return { ...(JSON.parse(raw) as StoredProject), handle };
  } catch {
    return null;
  }
}

export function clearProject(): void {
  localStorage.removeItem(STORAGE_KEY);
  void clearHandle();
}

// --- IndexedDB store for the folder handle (the non-serializable half) ---

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

function saveHandle(handle: DirectoryHandle): Promise<unknown> {
  return tx('readwrite', (store) => store.put(handle, KEY));
}

function loadHandle(): Promise<DirectoryHandle | undefined> {
  return tx<DirectoryHandle | undefined>('readonly', (store) => store.get(KEY));
}

function clearHandle(): Promise<unknown> {
  return tx('readwrite', (store) => store.delete(KEY));
}
