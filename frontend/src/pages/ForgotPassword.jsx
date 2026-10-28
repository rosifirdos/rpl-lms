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
  const handleNavigate = (targetRoute) => {
    if (onNavigate) {
      onNavigate(targetRoute);
      return;
    }
    if (typeof window !== 'undefined') {
      const targetUrl = targetRoute === 'login' || targetRoute === 'dashboard' ? '/' : `/${targetRoute}`;
      window.history.pushState({}, '', targetUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
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
        window.history.pushState({}, '', nextUrl || '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
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
