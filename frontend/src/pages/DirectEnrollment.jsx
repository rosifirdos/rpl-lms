/**
 * pages/DirectEnrollment.jsx
 *
 * Halaman-level wrapper untuk Direct Enrollment Mahasiswa SPADA LMS UPGRIS.
 * Membungkus komponen fitur dari features/admin/DirectEnrollment.
 */
import DirectEnrollment from '../features/admin/DirectEnrollment';

export default function DirectEnrollmentPage({ onRoleChange }) {
  return <DirectEnrollment onRoleChange={onRoleChange} />;
}
