import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * AppShell — Reusable Layout Component
 *
 * Menyediakan layout konsisten (Header fixed, Sidebar fixed/collapsible,
 * dan area konten utama berpadding dinamis) untuk seluruh halaman SPADA LMS.
 */
export default function AppShell({
  children,
  activeRole = 'mahasiswa',
  onRoleChange,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mainWrapClass = sidebarOpen
    ? 'pl-64 transition-all duration-300'
    : 'pl-0 transition-all duration-300';

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeRole={activeRole}
        onRoleChange={onRoleChange}
      />
      <Sidebar
        isOpen={sidebarOpen}
        activeRole={activeRole}
        onRoleChange={onRoleChange}
      />

      <div className={mainWrapClass}>
        <main className="w-full pt-16 px-gutter bg-background min-h-screen">
          <div className="flex flex-col w-full pb-space-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
