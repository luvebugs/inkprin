export const DB_NAME = 'TattooGeneratorDB';
export const STORE_NAME = 'images';
export const DB_VERSION = 1;

export interface SavedImage {
  id: string;
  url: string;
  timestamp: number;
  prompt?: string;
  style?: string;
}

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Could not open IndexedDB");
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveImageToDB = async (imageUrl: string, prompt?: string, style?: string) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const item: SavedImage = {
      id: Date.now().toString(), // Unique ID based on timestamp
      url: imageUrl,
      timestamp: Date.now(),
      prompt,
      style
    };

    const request = store.add(item); // Use add instead of put to ensure new entries

    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject("Failed to save image");
    });
  } catch (error) {
    console.error("Error saving to IndexedDB:", error);
  }
};

export const getLatestImageFromDB = async (): Promise<string | null> => {
  try {
    const images = await getAllImagesFromDB();
    if (images.length > 0) {
      // Assuming sorted by timestamp (newest first)
      return images[0].url;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving from IndexedDB:", error);
    return null;
  }
};

export const getAllImagesFromDB = async (): Promise<SavedImage[]> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result as SavedImage[];
        // Sort by timestamp descending (newest first)
        result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(result);
      };
      request.onerror = () => reject("Failed to retrieve images");
    });
  } catch (error) {
    console.error("Error retrieving all images:", error);
    return [];
  }
};
