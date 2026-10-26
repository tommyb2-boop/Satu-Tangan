import React, { useState, useEffect } from 'react';
import { syncService, SyncState } from '../services/syncService';
import { WifiOff, RefreshCw, X, Layers, CheckCircle } from 'lucide-react';

export const OfflineWarningToast: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [reconnectedNotice, setReconnectedNotice] = useState<boolean>(false);

  useEffect(() => {
    let prev = 'synced';
    const unsub = syncService.subscribe((status, length) => {
      if (prev === 'offline' && status !== 'offline') {
        // Just reconnected
        setReconnectedNotice(true);
        setTimeout(() => setReconnectedNotice(false), 4000);
      }
      prev = status;
      setSyncState(status);
      setQueueCount(length);
      if (status === 'offline') {
        setIsDismissed(false); // auto-show when going offline
      }
    });

    return unsub;
  }, []);

  // Show reconnected toast
  if (reconnectedNotice) {
    return (
      <aside 
        aria-label="Notifikasi Koneksi Pulih"
        className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-emerald-950/95 border border-emerald-500/70 text-emerald-100 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-slideUp"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Koneksi Internet Pulih</div>
            <div className="text-[11px] text-emerald-300">
              Menyinkronkan data offline ke Firebase Cloud...
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // If not offline or user dismissed this session
  if (syncState !== 'offline' || isDismissed) {
    return null;
  }

  return (
    <aside 
      aria-label="Peringatan Mode Offline"
      className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg bg-slate-900/95 border border-amber-500/60 text-slate-100 p-3 sm:p-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-start sm:items-center justify-between gap-3 animate-slideUp"
    >
      <div className="flex items-start sm:items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 sm:mt-0">
          <WifiOff className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400">Mode Offline Aktif</span>
            {queueCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Layers className="w-3 h-3" />
                {queueCount} data antrean
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
            Presensi & perubahan data tetap tersimpan di perangkat lokal. Akan otomatis disinkronkan ke server saat online.
          </p>
        </div>
      </div>

      <button
        onClick={() => setIsDismissed(true)}
        type="button"
        title="Tutup pemberitahuan"
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
};
