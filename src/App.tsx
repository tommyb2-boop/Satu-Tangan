/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { Dashboard3D } from './components/Dashboard3D';
import { TeacherAttendanceModule } from './components/modules/TeacherAttendance';
import { StudentAttendanceModule } from './components/modules/StudentAttendance';
import { TeacherDatabaseModule } from './components/modules/TeacherDatabase';
import { StudentDatabaseModule } from './components/modules/StudentDatabase';
import { ReportCardModule } from './components/modules/ReportCardModule';
import { DynamicEntitiesModule } from './components/modules/DynamicEntitiesModule';
import { FingerprintAttendanceModule } from './components/modules/FingerprintAttendanceModule';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { AppSettingsModal } from './components/AppSettingsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RotateCcw, ShieldCheck, Heart } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { operator, activeTab, resetDemoData } = useApp();
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // ROUTE PROTECTION GUARD:
  // If no operator is logged in, unconditionally render the Login Page!
  if (!operator) {
    return (
      <>
        <LoginPage onOpenArchitecture={() => setIsArchitectureOpen(true)} />
        <ArchitectureDocsModal
          isOpen={isArchitectureOpen}
          onClose={() => setIsArchitectureOpen(false)}
        />
      </>
    );
  }

  // Render Protected Dashboard & Modules
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Header onOpenArchitecture={() => setIsArchitectureOpen(true)} />

      {/* Main Viewport Container (1440px max width baseline) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
      </main>

      {/* Architecture Inspector Modal */}
      <ArchitectureDocsModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Global Application Settings & School Profile Modal */}
      <AppSettingsModal />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 no-print">
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

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
