/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Semua warna mengacu ke CSS custom property di src/index.css yang
      // menyimpan triplet channel (mis. `15 23 42`) untuk mode cerah & gelap.
      // `<alpha-value>` menjaga modifier opasitas (`/20`, `/30`, `/80`) tetap
      // berfungsi. JANGAN mengembalikan hex literal di sini.
      colors: {
        // --- Surface ---
        'surface': 'rgb(var(--surface) / <alpha-value>)',
        'surface-bright': 'rgb(var(--surface-bright) / <alpha-value>)',
        'surface-dim': 'rgb(var(--surface-dim) / <alpha-value>)',
        'surface-container-lowest': 'rgb(var(--surface-container-lowest) / <alpha-value>)',
        'surface-container-low': 'rgb(var(--surface-container-low) / <alpha-value>)',
        'surface-container': 'rgb(var(--surface-container) / <alpha-value>)',
        'surface-container-high': 'rgb(var(--surface-container-high) / <alpha-value>)',
        'surface-container-highest': 'rgb(var(--surface-container-highest) / <alpha-value>)',
        'surface-variant': 'rgb(var(--surface-variant) / <alpha-value>)',
        'background': 'rgb(var(--background) / <alpha-value>)',
        'scrim': 'rgb(var(--scrim) / <alpha-value>)',
        // `bg-overlay` didefinisikan manual di index.css (@layer utilities),
        // bukan lewat colors, karena opasitasnya mengikuti mode.

        // --- Text / outline ---
        'on-surface': 'rgb(var(--on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--on-surface-variant) / <alpha-value>)',
        'on-background': 'rgb(var(--on-background) / <alpha-value>)',
        'outline': 'rgb(var(--outline) / <alpha-value>)',
        'outline-variant': 'rgb(var(--outline-variant) / <alpha-value>)',

        // --- Primary ---
        'primary': 'rgb(var(--primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--primary-hover) / <alpha-value>)',
        'primary-active': 'rgb(var(--primary-active) / <alpha-value>)',
        'on-primary': 'rgb(var(--on-primary) / <alpha-value>)',
        'primary-container': 'rgb(var(--primary-container) / <alpha-value>)',
        'on-primary-container': 'rgb(var(--on-primary-container) / <alpha-value>)',
        'primary-fixed': 'rgb(var(--primary-fixed) / <alpha-value>)',
        'primary-fixed-dim': 'rgb(var(--primary-fixed-dim) / <alpha-value>)',
        'on-primary-fixed': 'rgb(var(--on-primary-fixed) / <alpha-value>)',
        'on-primary-fixed-variant': 'rgb(var(--on-primary-fixed-variant) / <alpha-value>)',
        'surface-tint': 'rgb(var(--surface-tint) / <alpha-value>)',
        'inverse-primary': 'rgb(var(--inverse-primary) / <alpha-value>)',

        // --- Secondary ---
        'secondary': 'rgb(var(--secondary) / <alpha-value>)',
        'on-secondary': 'rgb(var(--on-secondary) / <alpha-value>)',
        'secondary-container': 'rgb(var(--secondary-container) / <alpha-value>)',
        'on-secondary-container': 'rgb(var(--on-secondary-container) / <alpha-value>)',
        'secondary-fixed': 'rgb(var(--secondary-fixed) / <alpha-value>)',
        'secondary-fixed-dim': 'rgb(var(--secondary-fixed-dim) / <alpha-value>)',
        'on-secondary-fixed': 'rgb(var(--on-secondary-fixed) / <alpha-value>)',
        'on-secondary-fixed-variant': 'rgb(var(--on-secondary-fixed-variant) / <alpha-value>)',

        // --- Tertiary ---
        'tertiary': 'rgb(var(--tertiary) / <alpha-value>)',
        'tertiary-hover': 'rgb(var(--tertiary-hover) / <alpha-value>)',
        'on-tertiary': 'rgb(var(--on-tertiary) / <alpha-value>)',
        'tertiary-container': 'rgb(var(--tertiary-container) / <alpha-value>)',
        'on-tertiary-container': 'rgb(var(--on-tertiary-container) / <alpha-value>)',
        'tertiary-fixed': 'rgb(var(--tertiary-fixed) / <alpha-value>)',
        'tertiary-fixed-dim': 'rgb(var(--tertiary-fixed-dim) / <alpha-value>)',
        'on-tertiary-fixed': 'rgb(var(--on-tertiary-fixed) / <alpha-value>)',
        'on-tertiary-fixed-variant': 'rgb(var(--on-tertiary-fixed-variant) / <alpha-value>)',

        // --- Error ---
        'error': 'rgb(var(--error) / <alpha-value>)',
        'on-error': 'rgb(var(--on-error) / <alpha-value>)',
        'error-container': 'rgb(var(--error-container) / <alpha-value>)',
        'on-error-container': 'rgb(var(--on-error-container) / <alpha-value>)',

        // --- Inverse ---
        'inverse-surface': 'rgb(var(--inverse-surface) / <alpha-value>)',
        'inverse-on-surface': 'rgb(var(--inverse-on-surface) / <alpha-value>)',

        // === MVP2 Semantic Tokens ===
        // Dipakai halaman kelas, materi, presensi, dan rekap. Nilainya kini
        // bertema (lihat index.css) sehingga ikut berubah di mode gelap.
        'mvp-page': 'rgb(var(--mvp-page) / <alpha-value>)',
        'mvp-card': 'rgb(var(--mvp-card) / <alpha-value>)',
        'mvp-subtle': 'rgb(var(--mvp-subtle) / <alpha-value>)',
        'mvp-line': 'rgb(var(--mvp-line) / <alpha-value>)',
        'mvp-ink': 'rgb(var(--mvp-ink) / <alpha-value>)',
        'mvp-body': 'rgb(var(--mvp-body) / <alpha-value>)',
        'mvp-muted': 'rgb(var(--mvp-muted) / <alpha-value>)',
        'mvp-primary': 'rgb(var(--mvp-primary) / <alpha-value>)',
        'mvp-primary-hover': 'rgb(var(--mvp-primary-hover) / <alpha-value>)',
        'mvp-primary-strong': 'rgb(var(--mvp-primary-strong) / <alpha-value>)',
        'mvp-primary-soft': 'rgb(var(--mvp-primary-soft) / <alpha-value>)',
        'mvp-primary-tint': 'rgb(var(--mvp-primary-tint) / <alpha-value>)',
        'mvp-success': 'rgb(var(--mvp-success) / <alpha-value>)',
        'mvp-success-ink': 'rgb(var(--mvp-success-ink) / <alpha-value>)',
        'mvp-success-strong': 'rgb(var(--mvp-success-strong) / <alpha-value>)',
        'mvp-success-soft': 'rgb(var(--mvp-success-soft) / <alpha-value>)',
        'mvp-success-tint': 'rgb(var(--mvp-success-tint) / <alpha-value>)',
        'mvp-warning': 'rgb(var(--mvp-warning) / <alpha-value>)',
        'mvp-warning-ink': 'rgb(var(--mvp-warning-ink) / <alpha-value>)',
        'mvp-warning-base': 'rgb(var(--mvp-warning-base) / <alpha-value>)',
        'mvp-warning-soft': 'rgb(var(--mvp-warning-soft) / <alpha-value>)',
        'mvp-warning-tint': 'rgb(var(--mvp-warning-tint) / <alpha-value>)',
        'mvp-danger': 'rgb(var(--mvp-danger) / <alpha-value>)',
        'mvp-danger-ink': 'rgb(var(--mvp-danger-ink) / <alpha-value>)',
        'mvp-danger-strong': 'rgb(var(--mvp-danger-strong) / <alpha-value>)',
        'mvp-danger-soft': 'rgb(var(--mvp-danger-soft) / <alpha-value>)',
        'mvp-danger-tint': 'rgb(var(--mvp-danger-tint) / <alpha-value>)',

        // === Status semantik ===
        // Menggantikan palet mentah (emerald/amber/sky/rose/blue). `-ink` untuk
        // teks & ikon, `-solid` untuk latar tombol penuh bersama `text-white`.
        'success-ink': 'rgb(var(--success-ink) / <alpha-value>)',
        'success-soft': 'rgb(var(--success-soft) / <alpha-value>)',
        'success-border': 'rgb(var(--success-border) / <alpha-value>)',
        'success-solid': 'rgb(var(--success-solid) / <alpha-value>)',
        'warning-ink': 'rgb(var(--warning-ink) / <alpha-value>)',
        'warning-soft': 'rgb(var(--warning-soft) / <alpha-value>)',
        'warning-border': 'rgb(var(--warning-border) / <alpha-value>)',
        'warning-solid': 'rgb(var(--warning-solid) / <alpha-value>)',
        'info-ink': 'rgb(var(--info-ink) / <alpha-value>)',
        'info-soft': 'rgb(var(--info-soft) / <alpha-value>)',
        'info-border': 'rgb(var(--info-border) / <alpha-value>)',
        'info-solid': 'rgb(var(--info-solid) / <alpha-value>)',
        'danger-ink': 'rgb(var(--danger-ink) / <alpha-value>)',
        'danger-soft': 'rgb(var(--danger-soft) / <alpha-value>)',
        'danger-border': 'rgb(var(--danger-border) / <alpha-value>)',
        'danger-solid': 'rgb(var(--danger-solid) / <alpha-value>)',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      spacing: {
        gutter: '1.5rem',
        margin: '2rem',
        'margin-mobile': '1rem',
        'space-md': '1rem',
        'space-xl': '2rem',
        'gutter-mobile': '1rem',
        'space-sm': '0.5rem',
        'space-xs': '0.25rem',
        'space-lg': '1.5rem',
      },
      fontFamily: {
        'headline-md': ['Plus Jakarta Sans'],
        'headline-lg': ['Plus Jakarta Sans'],
        'body-md': ['Inter'],
        'display-hero': ['Plus Jakarta Sans'],
        'label-sm': ['Inter'],
        'display-hero-mobile': ['Plus Jakarta Sans'],
        'body-lg': ['Inter'],
        'body-sm': ['Inter'],
        'title-md': ['Plus Jakarta Sans'],
        'label-md': ['Inter'],
        caption: ['Inter'],
        'title-lg': ['Plus Jakarta Sans'],
      },
      fontSize: {
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg': ['30px', { lineHeight: '38px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'body-md': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'display-hero': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' }],
        'display-hero-mobile': ['28px', { lineHeight: '36px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'body-lg': ['16px', { lineHeight: '26px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'title-md': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'label-md': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        caption: ['11px', { lineHeight: '14px', fontWeight: '500' }],
        'title-lg': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
};
