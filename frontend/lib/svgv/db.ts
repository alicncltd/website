export interface SavedVideo {
  id?: number;
  name: string;
  data: Uint8Array;
  size: number;
  width: number;
  height: number;
  fps: number;
  frameCount: number;
  createdAt: number;
}

const DB_NAME = 'SvgvDemoDB';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function saveVideo(video: Omit<SavedVideo, 'id' | 'createdAt'>): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record: SavedVideo = {
      ...video,
      createdAt: Date.now()
    };

    const request = store.add(record);

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result as number);
    };

    request.onerror = (event) => {
      reject((event.target as IDBRequest).error);
    };
  });
}

export async function getAllVideos(): Promise<SavedVideo[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event) => {
      const list = (event.target as IDBRequest).result as SavedVideo[];
      list.sort((a, b) => b.createdAt - a.createdAt);
      resolve(list);
    };

    request.onerror = (event) => {
      reject((event.target as IDBRequest).error);
    };
  });
}

export async function deleteVideo(id: number): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject((event.target as IDBRequest).error);
    };
  });
}
