/**
 * pages/ForgotPassword.jsx
 *
 * Halaman-level wrapper dan integrasi rute untuk /forgot-password.
 * Mendukung navigasi SPA via props (onNavigate, onBack) serta fallback history/URL browser.
 * Komponen logika utama ada di features/auth/ForgotPassword.jsx.
 */
import ForgotPassword from '../features/auth/ForgotPassword';

export default function ForgotPasswordPage({ onNavigate, onBack, ...props }) {
  // Handler navigasi default jika props tidak disertakan
  // Delegasi ke fungsi shared dari App.jsx via props
  const handleNavigate = (targetRoute) => {
    if (onNavigate) {
      onNavigate(targetRoute);
      return;
    }
    // Fallback: gunakan query string routing (standalone usage tanpa App shell)
    // Konsisten dengan App.jsx yang menggunakan ?page= format
    if (typeof window !== 'undefined') {
      // Jangan remap 'login' ke dashboard - biarkan 'login' sebagai route terpisah
      const targetUrl = `?page=${targetRoute === 'dashboard' ? 'dasbor-mahasiswa' : targetRoute}`;
      window.history.pushState({}, '', targetUrl);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('page')) {
        url.searchParams.delete('page');
        const nextUrl = url.pathname + (url.search ? `?${url.searchParams.toString()}` : '');
        window.history.pushState({}, '', nextUrl || '/?page=dasbor-mahasiswa');
      } else {
        // Fallback ke beranda via direct navigation
        window.location.href = '/?page=dasbor-mahasiswa';
      }
    }
  };

  return (
    <ForgotPassword
      onNavigate={handleNavigate}
      onBack={handleBack}
      {...props}
    />
  );
}

export { ForgotPassword };
