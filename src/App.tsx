/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { AppSettingsModal } from './components/AppSettingsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ModuleSkeleton } from './components/ModuleSkeleton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OfflineWarningToast } from './components/OfflineWarningToast';
import { NewDeviceWelcomeModal } from './components/NewDeviceWelcomeModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { RotateCcw } from 'lucide-react';

// Code-split heavy modules via React.lazy so Android mobile devices
// only load the specific bundle chunk when opened, reducing initial load from 1.5MB+ to <200KB!
const Dashboard3D = React.lazy(() =>
  import('./components/Dashboard3D').then((m) => ({ default: m.Dashboard3D }))
);
const FingerprintAttendanceModule = React.lazy(() =>
  import('./components/modules/FingerprintAttendanceModule').then((m) => ({
    default: m.FingerprintAttendanceModule,
  }))
);
const TeacherAttendanceModule = React.lazy(() =>
  import('./components/modules/TeacherAttendance').then((m) => ({
    default: m.TeacherAttendanceModule,
  }))
);
const StudentAttendanceModule = React.lazy(() =>
  import('./components/modules/StudentAttendance').then((m) => ({
    default: m.StudentAttendanceModule,
  }))
);
const TeacherDatabaseModule = React.lazy(() =>
  import('./components/modules/TeacherDatabase').then((m) => ({
    default: m.TeacherDatabaseModule,
  }))
);
const StudentDatabaseModule = React.lazy(() =>
  import('./components/modules/StudentDatabase').then((m) => ({
    default: m.StudentDatabaseModule,
  }))
);
const ReportCardModule = React.lazy(() =>
  import('./components/modules/ReportCardModule').then((m) => ({
    default: m.ReportCardModule,
  }))
);
const DynamicEntitiesModule = React.lazy(() =>
  import('./components/modules/DynamicEntitiesModule').then((m) => ({
    default: m.DynamicEntitiesModule,
  }))
);

const MainAppContent: React.FC = () => {
  const { 
    operator, 
    activeTab, 
    resetDemoData, 
    isNewDeviceModalOpen, 
    closeNewDeviceModal 
  } = useApp();
  const { 
    isInstallable, 
    isInstalled, 
    isAndroid, 
    isIOS, 
    promptInstall 
  } = usePWAInstall();
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  const handleInstallApp = async () => {
    closeNewDeviceModal();
    await promptInstall();
  };

  // ROUTE PROTECTION GUARD:
  // If no operator is logged in, unconditionally render the Login Page!
  if (!operator) {
    return (
      <>
        <OfflineIndicator />
        <LoginPage onOpenArchitecture={() => setIsArchitectureOpen(true)} />
        <ArchitectureDocsModal
          isOpen={isArchitectureOpen}
          onClose={() => setIsArchitectureOpen(false)}
        />
        {/* New Device Local Database & Install Modal on First Launch */}
        <NewDeviceWelcomeModal
          isOpen={isNewDeviceModalOpen}
          onClose={closeNewDeviceModal}
          onInstall={handleInstallApp}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
          isAndroid={isAndroid}
          isIOS={isIOS}
        />
      </>
    );
  }

  // Render Protected Dashboard & Modules with Android mobile bottom navigation
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Offline Status Tracker & Warning Toast */}
      <OfflineIndicator />
      <OfflineWarningToast />

      {/* Top Bar Navigation */}
      <Header onOpenArchitecture={() => setIsArchitectureOpen(true)} />

      {/* Main Viewport Container (1440px max width baseline, with pb-24 for mobile bottom bar clearance) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 xl:pb-8">
        <Suspense fallback={<ModuleSkeleton />}>
          {activeTab === 'dashboard' && (
            <Dashboard3D onOpenArchitecture={() => setIsArchitectureOpen(true)} />
          )}
          {activeTab === 'absen-sidik-jari' && <FingerprintAttendanceModule />}
          {activeTab === 'absensi-guru' && <TeacherAttendanceModule />}
          {activeTab === 'absensi-siswa' && <StudentAttendanceModule />}
          {activeTab === 'db-guru' && <TeacherDatabaseModule />}
          {activeTab === 'db-siswa' && <StudentDatabaseModule />}
          {activeTab === 'cetak-raport' && <ReportCardModule />}
          {activeTab === 'modul-dinamis' && <DynamicEntitiesModule />}
        </Suspense>
      </main>

      {/* Android Native-Style Bottom Navigation for mobile screens */}
      <MobileBottomNav onOpenArchitecture={() => setIsArchitectureOpen(true)} />

      {/* Architecture Inspector Modal */}
      <ArchitectureDocsModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Global Application Settings & School Profile Modal */}
      <AppSettingsModal />

      {/* New Device Local Database & Install Modal */}
      <NewDeviceWelcomeModal
        isOpen={isNewDeviceModalOpen}
        onClose={closeNewDeviceModal}
        onInstall={handleInstallApp}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isAndroid={isAndroid}
        isIOS={isIOS}
      />

      {/* Quiet Footer (Hidden on small mobile screens to prevent clutter, accessible via drawer) */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 no-print hidden xl:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Satu Tangan</span>
            <span>&bull;</span>
            <span>Aplikasi Operator Pendidikan</span>
            <span>&bull;</span>
            <span className="text-slate-400 italic hidden md:inline">
              &ldquo;Semua kebutuhan pengajar dalam mengolah data siswa dapat diselesaikan secara terpusat dalam satu aplikasi.&rdquo;
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
            >
              Skema Database & Arsitektur
            </button>
            <button
              onClick={() => {
                if (window.confirm('Reset semua data ke kondisi demo awal?')) {
                  resetDemoData();
                }
              }}
              className="flex items-center gap-1 text-slate-500 hover:text-amber-400 transition-colors"
              title="Reset data demo ke awal"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
