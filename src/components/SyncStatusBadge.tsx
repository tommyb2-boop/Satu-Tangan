import React, { useState, useEffect } from 'react';
import { syncService, SyncState, QueuedSyncItem } from '../services/syncService';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  X,
  Database
} from 'lucide-react';

export const SyncStatusBadge: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [queueCount, setQueueCount] = useState<number>(0);
  const [lastSync, setLastSync] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [queueItems, setQueueItems] = useState<QueuedSyncItem[]>([]);
  const [isFlushing, setIsFlushing] = useState<boolean>(false);

  useEffect(() => {
    const unsub = syncService.subscribe((status, length) => {
      setSyncState(status);
      setQueueCount(length);
      setLastSync(syncService.getStatus().lastSyncTime);
    });
    return unsub;
  }, []);

  const handleOpenModal = () => {
    setQueueItems(syncService.getQueue());
    setIsModalOpen(true);
  };

  const handleManualSync = async () => {
    setIsFlushing(true);
    await syncService.flushQueue();
    setQueueItems(syncService.getQueue());
    setIsFlushing(false);
  };

  return (
    <>
      {/* Clickable Badge in Header */}
      <button
        onClick={handleOpenModal}
        type="button"
        title={`Status Sinkronisasi Cloud: ${syncState.toUpperCase()} (${queueCount} antrean)`}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border select-none ${
          syncState === 'synced'
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60 shadow-sm'
            : syncState === 'syncing'
            ? 'bg-sky-950/80 text-sky-300 border-sky-500/50 hover:bg-sky-900/80 shadow-md shadow-sky-500/20'
            : syncState === 'offline'
            ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 hover:bg-amber-900/80 shadow-md shadow-amber-500/20 animate-pulse'
            : 'bg-rose-950/80 text-rose-300 border-rose-500/50 hover:bg-rose-900/80'
        }`}
      >
        {syncState === 'synced' && (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline text-[11px]">Tersinkron</span>
          </>
        )}

        {syncState === 'syncing' && (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-sky-400 shrink-0 animate-spin" />
            <span className="text-[11px] font-bold">Sinkronisasi...</span>
          </>
        )}

        {syncState === 'offline' && (
          <>
            <CloudOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] font-bold">Offline</span>
            {queueCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full">
                {queueCount}
              </span>
            )}
          </>
        )}

        {syncState === 'error' && (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="text-[11px] font-bold">Gagal</span>
          </>
        )}
      </button>

      {/* Sync Inspector Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Sinkronisasi Cloud & Offline</h3>
                  <p className="text-[11px] text-slate-400">Firebase Cloud Firestore & Local Cache</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {/* Status Row */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400">Status Jaringan:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1.5 ${
                  syncState === 'synced'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : syncState === 'offline'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-sky-950 text-sky-400 border border-sky-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    syncState === 'synced' ? 'bg-emerald-400' : syncState === 'offline' ? 'bg-amber-400' : 'bg-sky-400 animate-ping'
                  }`} />
                  {syncState === 'synced' ? 'Online & Terhubung' : syncState === 'offline' ? 'Mode Offline' : 'Sedang Sinkronisasi'}
                </span>
              </div>

              {/* Last Sync */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400">Sinkronisasi Terakhir:</span>
                <span className="text-xs font-mono font-medium text-slate-200">{lastSync || 'Hari ini'}</span>
              </div>

              {/* Pending Queue Count */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Antrean Data Tertunda:</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                  queueCount > 0 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400'
                }`}>
                  {queueCount} perubahan
                </span>
              </div>

              {/* Queue Items List (if any) */}
              {queueItems.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-300 mb-1.5">Rincian Antrean Offline:</div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {queueItems.map((item, idx) => (
                      <div key={item.id || idx} className="text-[10px] p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 flex items-center justify-between">
                        <span className="capitalize font-mono text-indigo-300">{item.collection}</span>
                        <span className="text-slate-400">{item.action}</span>
                        <span className="text-slate-500 text-[9px] font-mono">
                          {new Date(item.timestamp).toLocaleTimeString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isFlushing}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFlushing ? 'animate-spin' : ''}`} />
                <span>{isFlushing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
