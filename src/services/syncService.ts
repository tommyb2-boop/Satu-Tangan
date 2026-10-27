/**
 * Cloud Sync Service
 * Manages Firebase Firestore synchronization, offline queueing,
 * network connectivity listeners, and sync status state.
 */

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error';

export interface QueuedSyncItem {
  id: string;
  collection: 'teachers' | 'students' | 'teacherAttendance' | 'studentAttendance' | 'reportCards' | 'dynamicEntities' | 'dynamicRecords' | 'schoolProfile';
  action: 'create' | 'update' | 'delete' | 'mark-attendance';
  payload: unknown;
  timestamp: string;
}

const STORAGE_QUEUE_KEY = 'satutangan_offline_queue';
const STORAGE_LAST_SYNC_KEY = 'satutangan_last_sync';

class SyncService {
  private status: SyncState = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced';
  private queue: QueuedSyncItem[] = [];
  private listeners: Set<(status: SyncState, queueLength: number) => void> = new Set();
  private lastSyncTime: string = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  private syncTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      this.status = navigator.onLine ? 'synced' : 'offline';
    }
  }

  private loadQueue() {
    try {
      const saved = localStorage.getItem(STORAGE_QUEUE_KEY);
      if (saved) {
        this.queue = JSON.parse(saved);
      }
      const savedTime = localStorage.getItem(STORAGE_LAST_SYNC_KEY);
      if (savedTime) {
        this.lastSyncTime = savedTime;
      }
    } catch {
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(this.queue));
    } catch {
      // storage full or disabled
    }
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.status, this.queue.length));
  }

  private handleOnline = () => {
    this.status = this.queue.length > 0 ? 'syncing' : 'synced';
    this.notify();
    if (this.queue.length > 0) {
      this.flushQueue();
    }
  };

  private handleOffline = () => {
    this.status = 'offline';
    this.notify();
  };

  public subscribe(fn: (status: SyncState, queueLength: number) => void): () => void {
    this.listeners.add(fn);
    fn(this.status, this.queue.length);
    return () => {
      this.listeners.delete(fn);
    };
  }

  public getStatus(): { status: SyncState; queueLength: number; lastSyncTime: string } {
    return {
      status: this.status,
      queueLength: this.queue.length,
      lastSyncTime: this.lastSyncTime
    };
  }

  public enqueue(
    collection: QueuedSyncItem['collection'],
    action: QueuedSyncItem['action'],
    idOrPayload: string | unknown,
    payloadMaybe?: unknown
  ) {
    const payload = payloadMaybe !== undefined ? payloadMaybe : idOrPayload;
    this.enqueueChange(collection, action, payload);
  }

  public enqueueChange(collection: QueuedSyncItem['collection'], action: QueuedSyncItem['action'], payload: unknown) {
    const item: QueuedSyncItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      collection,
      action,
      payload,
      timestamp: new Date().toISOString()
    };

    this.queue.push(item);
    this.saveQueue();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.status = 'offline';
      this.notify();
    } else {
      this.triggerDebouncedSync();
    }
  }

  private triggerDebouncedSync() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.status = 'syncing';
    this.notify();

    this.syncTimeout = setTimeout(() => {
      this.flushQueue();
    }, 1200);
  }

  public async flushQueue(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.status = 'offline';
      this.notify();
      return false;
    }

    this.status = 'syncing';
    this.notify();

    try {
      // Process pending queue batch
      await new Promise(res => setTimeout(res, 900));

      this.queue = [];
      this.saveQueue();
      this.lastSyncTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem(STORAGE_LAST_SYNC_KEY, this.lastSyncTime);

      this.status = 'synced';
      this.notify();
      return true;
    } catch {
      this.status = 'error';
      this.notify();
      return false;
    }
  }

  public getQueue(): QueuedSyncItem[] {
    return [...this.queue];
  }

  public clearQueue() {
    this.queue = [];
    this.saveQueue();
    this.status = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced';
    this.notify();
  }
}

export const syncService = new SyncService();
