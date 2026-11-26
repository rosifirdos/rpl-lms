import React, { useState, useMemo } from 'react';
import Breadcrumb from '../components/konfigurasi/Breadcrumb';
import KpiCards from '../components/konfigurasi/KpiCards';
import NavAnchor from '../components/konfigurasi/NavAnchor';
import FileSecuritySection from '../components/konfigurasi/FileSecuritySection';
import AttendancePolicySection from '../components/konfigurasi/AttendancePolicySection';
import AcademicParamSection from '../components/konfigurasi/AcademicParamSection';
import SystemIntegritySection from '../components/konfigurasi/SystemIntegritySection';
import FloatingSaveNotice from '../components/konfigurasi/FloatingSaveNotice';
import Toast from '../components/konfigurasi/Toast';
import { DEFAULT_CONFIG } from '../data/defaultSettings';

export default function KonfigurasiSistem({ onNavigate }) {
  const [savedConfig, setSavedConfig] = useState(DEFAULT_CONFIG);
  const [config, setConfig] = useState({
    ...DEFAULT_CONFIG,
    payloadLimit: 10,
    attendanceThreshold: 70,
    attendanceTolerance: '15',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info', duration = 3500) => {
    setToast({ message, type, duration });
  };

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const unsavedCount = useMemo(() => {
    let diffs = 0;
    const keys = Object.keys(DEFAULT_CONFIG);
    for (const key of keys) {
      if (Array.isArray(config[key])) {
        const a = [...(config[key] || [])].sort().join(',');
        const b = [...(savedConfig[key] || [])].sort().join(',');
        if (a !== b) diffs++;
      } else if (config[key] !== savedConfig[key]) {
        diffs++;
      }
    }
    return diffs;
  }, [config, savedConfig]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setSavedConfig(config);
      setIsSaving(false);
      setSaveSuccess(true);
      showToast(
        'Konfigurasi sistem berhasil disimpan dan tersinkron ke cache Redis!',
        'success'
      );
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2500);
    }, 700);
  };

  const handleResetToDefault = () => {
    setConfig({ ...DEFAULT_CONFIG });
    showToast('Seluruh konfigurasi dikembalikan ke parameter regulasi baku (default).', 'warning');
  };

  const handleCancelChanges = () => {
    setConfig({ ...savedConfig });
    showToast('Perubahan dibatalkan, mengembalikan ke konfigurasi tersimpan.', 'info');
  };

  return (
    <div className="flex flex-col w-full pb-16 pt-2">
      <Breadcrumb
        onReset={handleResetToDefault}
        onSave={handleSave}
        unsavedCount={unsavedCount}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        onNavigate={onNavigate}
      />

      <KpiCards config={config} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <NavAnchor />

        <div className="lg:col-span-9 flex flex-col gap-space-xl">
          <FileSecuritySection
            config={config}
            onChange={handleConfigChange}
            onShowToast={showToast}
          />

          <AttendancePolicySection
            config={config}
            onChange={handleConfigChange}
          />

          <AcademicParamSection
            config={config}
            onChange={handleConfigChange}
          />

          <SystemIntegritySection
            config={config}
            onChange={handleConfigChange}
            onNavigate={onNavigate}
          />

          <FloatingSaveNotice
            onCancel={handleCancelChanges}
            onApply={handleSave}
            isSaving={isSaving}
          />
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}