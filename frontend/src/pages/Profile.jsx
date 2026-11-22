/**
 * pages/Profile.jsx
 *
 * Halaman-level wrapper untuk modul Profil Pengguna & Keamanan E-Learning Kampus.
 * Menghubungkan fitur features/profile/Profile dengan sistem routing.
 */
import Profile from '../features/profile/Profile';

export default function ProfilePage({ onNavigate, onRoleChange, activeRole }) {
  return (
    <Profile
      onNavigate={onNavigate}
      onRoleChange={onRoleChange}
      activeRole={activeRole}
    />
  );
}
