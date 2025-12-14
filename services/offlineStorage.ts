
import { ContentPack, ContentPackId } from '../types';

const DB_NAME = 'LabPartnerDB';
const DB_VERSION = 1;
const STORE_CONTENT = 'content_packs';
const STORE_PROGRESS = 'user_progress';
const STORE_VIDEOS = 'experiment_videos';

class OfflineStorageService {
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("IndexedDB error:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_CONTENT)) {
          db.createObjectStore(STORE_CONTENT, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
          db.createObjectStore(STORE_PROGRESS, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
          db.createObjectStore(STORE_VIDEOS, { keyPath: 'id' });
        }
      };
    });
  }

  // --- CONTENT PACKS ---

  public async getContentPacks(): Promise<ContentPack[]> {
    await this.ensureDB();
    const stored = await this.getAll<ContentPack>(STORE_CONTENT);
    
    // Merge with defaults if not present
    const defaults: ContentPack[] = [
        { id: 'CORE', name: 'Core System', sizeMB: 15.2, downloaded: true, lastUpdated: new Date() },
        { id: 'CHEMISTRY', name: 'Chemistry Lab', sizeMB: 8.5, downloaded: false },
        { id: 'BIOLOGY', name: 'Biology Lab', sizeMB: 12.1, downloaded: false },
        { id: 'PHYSICS', name: 'Physics Lab', sizeMB: 6.4, downloaded: false },
    ];

    // If DB is empty or missing packs, merge
    const merged = defaults.map(def => {
        const existing = stored.find(s => s.id === def.id);
        return existing || def;
    });

    return merged;
  }

  public async downloadPack(id: ContentPackId): Promise<void> {
      await this.ensureDB();
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pack = (await this.getContentPacks()).find(p => p.id === id);
      if (pack) {
          pack.downloaded = true;
          pack.lastUpdated = new Date();
          await this.put(STORE_CONTENT, pack);
      }
  }

  public async deletePack(id: ContentPackId): Promise<void> {
      await this.ensureDB();
      if (id === 'CORE') throw new Error("Cannot delete Core content");
      
      const pack = (await this.getContentPacks()).find(p => p.id === id);
      if (pack) {
          pack.downloaded = false;
          delete pack.lastUpdated;
          await this.put(STORE_CONTENT, pack);
      }
  }

  // --- VIDEOS ---

  public async saveVideo(blob: Blob, name: string): Promise<string> {
      await this.ensureDB();
      const id = `vid_${Date.now()}`;
      await this.put(STORE_VIDEOS, {
          id,
          name,
          blob,
          date: new Date(),
          size: blob.size
      });
      return id;
  }

  public async getStorageUsage(): Promise<{ usedBytes: number, videoCount: number }> {
      await this.ensureDB();
      const videos = await this.getAll<any>(STORE_VIDEOS);
      const usedBytes = videos.reduce((acc, v) => acc + (v.size || 0), 0);
      return { usedBytes, videoCount: videos.length };
  }

  public async clearVideos(): Promise<void> {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
          const tx = this.db!.transaction(STORE_VIDEOS, 'readwrite');
          tx.objectStore(STORE_VIDEOS).clear();
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
      });
  }

  // --- HELPERS ---

  private async ensureDB() {
      if (!this.db) await this.initDB();
  }

  private getAll<T>(storeName: string): Promise<T[]> {
      return new Promise((resolve, reject) => {
          const tx = this.db!.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
      });
  }

  private put(storeName: string, value: any): Promise<void> {
      return new Promise((resolve, reject) => {
          const tx = this.db!.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = store.put(value);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
      });
  }
}

export const offlineStorage = new OfflineStorageService();
