/**
 * components/ThemeToggle.jsx
 *
 * Tombol pengalih mode cerah/gelap.
 *
 * - `variant="icon"` (default): tombol ikon ringkas, dipakai di Header.
 * - `variant="labeled"`: tombol berlabel, dipakai di halaman standalone
 *   (login / lupa kata sandi) yang tidak memakai AppShell.
 *
 * Preferensi disimpan lewat themeStore sehingga bertahan antar sesi.
 */
import { useThemeStore } from '../stores/themeStore';

function ThemeToggle({ variant = 'icon', className = '' }) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';
  const label = isDark ? 'Aktifkan mode cerah' : 'Aktifkan mode gelap';

  if (variant === 'labeled') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={label}
        title={label}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-label-sm text-label-sm ${className}`}
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          {isDark ? 'light_mode' : 'dark_mode'}
        </span>
        <span>{isDark ? 'Mode Cerah' : 'Mode Gelap'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`p-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors ${className}`}
    >
      <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}

export default ThemeToggle;