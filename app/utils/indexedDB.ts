export const DB_NAME = 'TattooGeneratorDB';
export const STORE_NAME = 'images';
export const UPLOAD_STORE_NAME = 'uploaded_images';
export const DB_VERSION = 2;

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
      if (!db.objectStoreNames.contains(UPLOAD_STORE_NAME)) {
        // We'll store files with a key, maybe 'current_upload_1', 'current_upload_2' or just auto increment
        // Since we only allow 2 images, maybe just store them as a list?
        // Or store each file. Let's use autoIncrement.
        db.createObjectStore(UPLOAD_STORE_NAME, { autoIncrement: true });
      }
    };
  });
};

export const saveUploadedImagesToDB = async (files: File[]) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([UPLOAD_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(UPLOAD_STORE_NAME);
    
    // Clear existing uploads as we want to mirror the current state
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject("Failed to clear uploaded images");
    });

    // Add new files
    for (const file of files) {
      store.add(file);
    }

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject("Failed to save uploaded images");
    });
  } catch (error) {
    console.error("Error saving uploaded images to IndexedDB:", error);
  }
};

export const getUploadedImagesFromDB = async (): Promise<File[]> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([UPLOAD_STORE_NAME], 'readonly');
    const store = transaction.objectStore(UPLOAD_STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result as File[];
        resolve(result || []);
      };
      request.onerror = () => reject("Failed to retrieve uploaded images");
    });
  } catch (error) {
    console.error("Error retrieving uploaded images:", error);
    return [];
  }
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
