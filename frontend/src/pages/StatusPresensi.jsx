import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StatusPresensi from '../features/mahasiswa/StatusPresensi';

/**
 * pages/StatusPresensi.jsx
 *
 * Page wrapper untuk tampilan Status Presensi Mahasiswa (FR-023 / FR-024).
 * Terintegrasi dengan Header global dan Sidebar navigasi SPADA UPGRIS.
 */
export default function StatusPresensiPage({ onRoleChange, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mainWrapClass = sidebarOpen
    ? 'pl-64 transition-all duration-300'
    : 'pl-0 transition-all duration-300';

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeRole="mahasiswa"
        onRoleChange={onRoleChange}
      />
      <Sidebar
        isOpen={sidebarOpen}
        activeRole="mahasiswa"
        onRoleChange={onRoleChange}
        onNavigate={onNavigate}
      />

      <div className={mainWrapClass}>
        <main className="w-full pt-16 px-gutter bg-background min-h-screen">
          <div className="flex flex-col w-full pb-space-xl">
            {/* Dynamic Glow Background */}
            <div className="relative w-full">
              <div className="absolute -top-10 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />
              <div className="absolute top-48 right-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />

              <StatusPresensi onNavigate={onNavigate} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
