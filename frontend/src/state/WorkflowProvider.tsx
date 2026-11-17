import { useEffect, useState, type ReactNode } from 'react';
import { defaults, WorkflowContext, type Workflow } from './workflow';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('qool-workflow', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('draft');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export default function WorkflowProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Workflow>(defaults);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    let active = true;
    openDatabase().then(db => new Promise<Workflow | undefined>((resolve, reject) => {
      const tx = db.transaction('draft', 'readonly');
      const request = tx.objectStore('draft').get('current');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    })).then(saved => {
      if (active && saved) setData({ ...defaults, ...saved });
    }).catch(() => { if (active) setStorageError(true); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    // Open and write in invocation order so earlier drafts cannot overwrite newer ones.
    openDatabase().then(db => {
      const tx = db.transaction('draft', 'readwrite');
      tx.objectStore('draft').put(data, 'current');
      tx.oncomplete = () => db.close();
      tx.onerror = () => { setStorageError(true); db.close(); };
      tx.onabort = () => { setStorageError(true); db.close(); };
    }).catch(() => setStorageError(true));
  }, [data, loaded]);
  if (!loaded) return <p role="status" className="p-8">Loading your draft…</p>;
  return <WorkflowContext.Provider value={{ data, update: patch => setData(current => ({ ...current, ...patch })), reset: () => setData({ ...defaults }) }}>
    {storageError && <p role="status" className="bg-qool-peach p-3 text-center">Browser storage is unavailable. Keep this tab open; your draft may not survive a refresh.</p>}
    {children}
  </WorkflowContext.Provider>;
}
