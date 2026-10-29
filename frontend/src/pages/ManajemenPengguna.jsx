/**
 * pages/ManajemenPengguna.jsx
 *
 * Halaman-level wrapper untuk Manajemen Pengguna SPADA LMS UPGRIS.
 * Memadukan Header, Sidebar, dan fitur ManajemenPengguna.
 */
import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ManajemenPengguna from '../features/admin/ManajemenPengguna';

export default function ManajemenPenggunaPage({ onRoleChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        activeRole="admin"
        onRoleChange={onRoleChange}
      />
      <Sidebar
        isOpen={sidebarOpen}
        activeRole="admin"
        onRoleChange={onRoleChange}
      />
      <div className={sidebarOpen ? 'pl-64 transition-all duration-300' : 'pl-0 transition-all duration-300'}>
        <main className="w-full pt-16 px-gutter bg-background min-h-screen">
          <ManajemenPengguna onRoleChange={onRoleChange} />
        </main>
      </div>
    </div>
  );
}
