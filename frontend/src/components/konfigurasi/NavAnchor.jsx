import React, { useState, useEffect } from 'react';

const navItems = [
  { id: 'sec-keamanan', label: '1. Keamanan & Berkas', icon: 'security' },
  { id: 'sec-presensi', label: '2. Presensi & Ujian', icon: 'rule' },
  { id: 'sec-akademik', label: '3. Parameter Akademik', icon: 'domain_verification' },
  { id: 'sec-integritas', label: '4. Integritas & Audit', icon: 'verified_user' },
];

export default function NavAnchor() {
  const [activeSection, setActiveSection] = useState('sec-keamanan');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(navItems[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="hidden lg:flex lg:col-span-3 flex-col gap-space-xs sticky top-24 bg-surface-container-low p-space-sm rounded-xl">
      <span className="px-space-sm py-space-xs font-caption text-caption text-outline uppercase tracking-wider font-semibold">
        Navigasi Konfigurasi
      </span>

      {navItems.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              scrollTo(item.id);
            }}
            className={`flex items-center justify-between px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
              isActive
                ? 'bg-surface-container-high text-primary font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </a>
        );
      })}

      {/* Quick Policy Reference Box */}
      <div className="mt-space-md p-space-md rounded-lg bg-surface-container-lowest flex flex-col gap-space-xs text-outline">
        <div className="flex items-center gap-1 text-on-surface font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-secondary text-[16px]">info</span>
          Prinsip Penegakan Sistem
        </div>
        <p className="font-caption text-caption leading-relaxed">
          Semua perubahan konfigurasi divalidasi langsung oleh Core Engine SPADA UPGRIS dan secara otomatis memicu pembaruan cache Redis terdistribusi.
        </p>
      </div>
    </div>
  );
}
