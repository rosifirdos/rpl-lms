/**
 * pages/ForgotPassword.jsx
 *
 * Halaman-level wrapper untuk rute /forgot-password.
 * Komponen logika utama ada di features/auth/ForgotPassword.jsx
 * agar mudah diuji dan digunakan ulang secara terpisah.
 */
import ForgotPassword from '../features/auth/ForgotPassword';

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
