/**
 * Offline-First IndexedDB Database Engine for Satu Tangan
 * Provides persistent local database storage, collection management,
 * offline durability, and automatic bidirectional synchronization with localStorage.
 */

const DB_NAME = 'satutangan_offline_db';
const DB_VERSION = 2;

export const DB_STORES = [
  'teachers',
  'students',
  'teacherAttendance',
  'studentAttendance',
  'reportCards',
  'dynamicEntities',
  'dynamicRecords',
  'schoolProfile',
  'metadata',
  'biometricTemplates'
] as const;

export type DbStoreName = (typeof DB_STORES)[number];

export interface OfflineDbStats {
  teachersCount: number;
  studentsCount: number;
  teacherAttendanceCount: number;
  studentAttendanceCount: number;
  reportCardsCount: number;
  dynamicEntitiesCount: number;
  dynamicRecordsCount: number;
  biometricTemplatesCount?: number;
  isIndexedDbSupported: boolean;
  storageEstimateMb?: number;
  lastUpdated: string;
}

class OfflineDbService {
  private db: IDBDatabase | null = null;
  private isSupported: boolean = typeof window !== 'undefined' && 'indexedDB' in window;
  private initPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    if (this.isSupported) {
      this.init();
    }
  }

  /**
   * Initializes the IndexedDB database and object stores
   */
  public async init(): Promise<IDBDatabase | null> {
    if (!this.isSupported) return null;
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          DB_STORES.forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: 'id' });
            }
          });
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve(this.db);
        };

        request.onerror = (err) => {
          console.warn('[OfflineDB] IndexedDB open error, falling back to localStorage:', err);
          resolve(null);
        };
      } catch (e) {
        console.warn('[OfflineDB] Initialization failed:', e);
        resolve(null);
      }
    });

    return this.initPromise;
  }

  /**
   * Puts multiple items into an IndexedDB store in a single transaction
   */
  public async saveCollection<T>(storeName: DbStoreName, items: T[]): Promise<boolean> {
    const db = await this.init();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        // Clear existing to keep it synchronized with the latest state
        store.clear();

        items.forEach((item, index) => {
          const itemObj = item as Record<string, unknown>;
          const normalized = itemObj && itemObj.id ? itemObj : { ...itemObj, id: `item-${index}` };
          store.put(normalized);
        });

        tx.oncomplete = () => resolve(true);
        tx.onerror = (err) => {
          console.warn(`[OfflineDB] Failed saving collection ${storeName}:`, err);
          resolve(false);
        };
      } catch (err) {
        console.warn(`[OfflineDB] Transaction error in ${storeName}:`, err);
        resolve(false);
      }
    });
  }

  /**
   * Saves a single entity (such as SchoolProfile or single item)
   */
  public async saveItem<T>(storeName: DbStoreName, item: T, defaultId = 'current'): Promise<boolean> {
    const db = await this.init();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const itemObj = item as Record<string, unknown>;
        const normalized = itemObj && itemObj.id ? itemObj : { ...itemObj, id: defaultId };
        store.put(normalized);

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Retrieves all items from an IndexedDB store
   */
  public async getAll<T>(storeName: DbStoreName): Promise<T[]> {
    const db = await this.init();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve((request.result as T[]) || []);
        };
        request.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  /**
   * Retrieves a single item by ID
   */
  public async getItem<T>(storeName: DbStoreName, id: string): Promise<T | null> {
    const db = await this.init();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve((request.result as T) || null);
        };
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  /**
   * Alias for getAll to retrieve a collection
   */
  public async getCollection<T>(storeName: DbStoreName): Promise<T[]> {
    return this.getAll<T>(storeName);
  }

  /**
   * Deletes a single item by ID
   */
  public async deleteItem(storeName: DbStoreName, id: string): Promise<boolean> {
    const db = await this.init();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(id);

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Returns statistics about offline database collections and storage
   */
  public async getStats(): Promise<OfflineDbStats> {
    const fallbackStats: OfflineDbStats = {
      teachersCount: 0,
      studentsCount: 0,
      teacherAttendanceCount: 0,
      studentAttendanceCount: 0,
      reportCardsCount: 0,
      dynamicEntitiesCount: 0,
      dynamicRecordsCount: 0,
      isIndexedDbSupported: this.isSupported,
      lastUpdated: new Date().toLocaleTimeString('id-ID')
    };

    if (!this.isSupported) return fallbackStats;

    try {
      const [
        teachers,
        students,
        teacherAtt,
        studentAtt,
        reportCards,
        entities,
        records
      ] = await Promise.all([
        this.getAll('teachers'),
        this.getAll('students'),
        this.getAll('teacherAttendance'),
        this.getAll('studentAttendance'),
        this.getAll('reportCards'),
        this.getAll('dynamicEntities'),
        this.getAll('dynamicRecords')
      ]);

      let estimateMb = 0;
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) {
          estimateMb = +(estimate.usage / (1024 * 1024)).toFixed(2);
        }
      }

      return {
        teachersCount: teachers.length,
        studentsCount: students.length,
        teacherAttendanceCount: teacherAtt.length,
        studentAttendanceCount: studentAtt.length,
        reportCardsCount: reportCards.length,
        dynamicEntitiesCount: entities.length,
        dynamicRecordsCount: records.length,
        isIndexedDbSupported: true,
        storageEstimateMb: estimateMb,
        lastUpdated: new Date().toLocaleTimeString('id-ID')
      };
    } catch {
      return fallbackStats;
    }
  }

  /**
   * Exports full IndexedDB database backup
   */
  public async exportFullBackup(): Promise<string> {
    const [
      teachers,
      students,
      teacherAttendance,
      studentAttendance,
      reportCardsList,
      dynamicEntities,
      dynamicRecords,
      schoolProfileList
    ] = await Promise.all([
      this.getAll('teachers'),
      this.getAll('students'),
      this.getAll('teacherAttendance'),
      this.getAll('studentAttendance'),
      this.getAll('reportCards'),
      this.getAll('dynamicEntities'),
      this.getAll('dynamicRecords'),
      this.getAll('schoolProfile')
    ]);

    const reportCardsMap: Record<string, unknown> = {};
    reportCardsList.forEach((item: unknown) => {
      const card = item as { id?: string; studentId?: string };
      const key = card.studentId || card.id;
      if (key) {
        reportCardsMap[key] = card;
      }
    });

    const backupObj = {
      app: 'Satu Tangan - Operator Pendidikan',
      mode: 'offline-first-backup',
      version: '2.5',
      exportedAt: new Date().toISOString(),
      data: {
        teachers,
        students,
        teacherAttendance,
        studentAttendance,
        reportCards: reportCardsMap,
        dynamicEntities,
        dynamicRecords,
        schoolProfile: schoolProfileList[0] || null
      }
    };

    return JSON.stringify(backupObj, null, 2);
  }

  /**
   * Clears all offline collections (for database reset)
   */
  public async clearAll(): Promise<void> {
    const db = await this.init();
    if (!db) return;

    await Promise.all(
      DB_STORES.map((storeName) => {
        return new Promise<void>((res) => {
          try {
            const tx = db.transaction(storeName, 'readwrite');
            tx.objectStore(storeName).clear();
            tx.oncomplete = () => res();
            tx.onerror = () => res();
          } catch {
            res();
          }
        });
      })
    );
  }
}

export const offlineDb = new OfflineDbService();
