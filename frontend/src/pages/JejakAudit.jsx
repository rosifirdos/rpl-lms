import React, { useState, useMemo, useEffect } from 'react';

const initialLogs = [
  {
    id: 'aud-1',
    timestampDate: '13 Okt 2026',
    timestampTime: '08:24:12 WIB',
    isoTimestamp: '2026-10-13T08:24:12+07:00',
    actor: {
      name: 'Admin Utama',
      id: '19820512',
      idType: 'NIP',
      role: 'Admin',
      initial: 'ADM',
      initialBg: 'bg-primary-container text-on-primary-container',
    },
    actionType: 'ENROLL',
    actionBadgeClass: 'bg-[#2563EB]/20 text-[#60A5FA]',
    entityType: 'Enrollment',
    entityTarget: 'Enrollment: ENR-2026-881',
    entitySubtitle: 'Class: TI-A • Rekayasa Perangkat Lunak',
    ip: '10.15.2.46',
    networkType: 'VPN Internal UPGRIS',
    networkIcon: 'vpn_key',
    networkColor: 'text-tertiary',
    device: 'Chrome 132 • Windows 11',
    summary: 'Direct enrollment 40 mahasiswa angkatan 2024 ke kelas aktif RPL Semester Ganjil.',
    diffData: {
      title: 'Inspeksi Perubahan Data: ENROLL pada Enrollment ENR-2026-881',
      badge: 'Enrollment Massal',
      badgeBg: 'bg-blue-600',
      entity: 'class_enrollments',
      targetId: 'ENR-2026-881',
      actorName: 'Admin Utama',
      actorRole: 'Admin Sistem',
      timestamp: '13 Okt 2026, 08:24:12 WIB',
      oldValues: { enrolled_count: 0, status: 'OPEN', students: [] },
      newValues: {
        enrolled_count: 40,
        status: 'FULL',
        students_batch: 'Batch TI-A 2024',
        enrolled_by: '19820512',
        enrolled_at: '2026-10-13T08:24:12Z',
      },
      ip: '10.15.2.46 (Kampus 4 UPGRIS)',
      worker: 'spada-core-worker-01.upgris.ac.id',
      prevHash: '7c4d12...a901',
      sha256: 'f4a821e90bc34589d89012aefbc67190348710abc124ef98762341098dfbac78',
    },
  },
  {
    id: 'aud-2',
    timestampDate: '13 Okt 2026',
    timestampTime: '08:15:03 WIB',
    isoTimestamp: '2026-10-13T08:15:03+07:00',
    actor: {
      name: 'Dr. Awan Rosi, M.Kom.',
      id: '0612345601',
      idType: 'NIDN',
      role: 'Dosen',
      initial: 'AR',
      initialBg: 'bg-secondary-container text-on-secondary-container',
    },
    actionType: 'GRADE_MUTATION',
    actionBadgeClass: 'bg-[#D97706]/20 text-[#FBBF24]',
    entityType: 'Submission',
    entityTarget: 'Submission: SUB-9041',
    entitySubtitle: 'Tugas 01 DFD • NIM 24670001',
    ip: '10.15.4.12',
    networkType: 'Wi-Fi Dosen R.302',
    networkIcon: 'wifi',
    networkColor: 'text-secondary',
    device: 'Safari 18 • macOS Sonoma',
    summary: 'Mutasi skor dari 75.00 menjadi 88.50 untuk NIM 24670001 (Revisi Diagram Konteks).',
    isFocal: true,
    diffData: {
      title: 'Inspeksi Perubahan Data: GRADE_MUTATION pada Submission SUB-9041',
      badge: 'Mutasi Skor',
      badgeBg: 'bg-[#D97706]',
      entity: 'assignments_submissions',
      targetId: '9041',
      actorName: 'Dr. Awan Rosi, M.Kom.',
      actorRole: 'Dosen Pengampu',
      timestamp: '13 Okt 2026, 08:15:03 WIB',
      oldValues: {
        id: 9041,
        assignment_id: 402,
        student_nim: '24670001',
        score: 75.0,
        status: 'SUBMITTED',
        feedback: 'Analisis DFD level 1 kurang mendalam',
        graded_by: null,
        graded_at: null,
        attempt: 1,
        submission_file: 'Tugas01_24670001_Dimas.pdf',
        similarity_score: 12.4,
      },
      newValues: {
        id: 9041,
        assignment_id: 402,
        student_nim: '24670001',
        score: 88.5,
        status: 'GRADED',
        feedback: 'Revisi diagram konteks dan level 1 telah memenuhi spesifikasi SRS',
        graded_by: '0612345601',
        graded_at: '2026-10-13T08:15:03Z',
        attempt: 2,
        submission_file: 'Tugas01_24670001_Dimas_Rev.pdf',
        similarity_score: 12.4,
      },
      ip: '10.15.4.12 (Kampus 4 UPGRIS)',
      worker: 'spada-core-worker-02.upgris.ac.id',
      prevHash: '9a2c41...b730',
      sha256: 'e8b941a57e3f4c65e8a011cd098a5d3f9b23f81e84a29d5b78c93a02bb49c014',
    },
  },
  {
    id: 'aud-3',
    timestampDate: '13 Okt 2026',
    timestampTime: '07:50:45 WIB',
    isoTimestamp: '2026-10-13T07:50:45+07:00',
    actor: {
      name: 'Admin Utama',
      id: '19820512',
      idType: 'NIP',
      role: 'Admin',
      initial: 'ADM',
      initialBg: 'bg-primary-container text-on-primary-container',
    },
    actionType: 'CONFIG_CHANGE',
    actionBadgeClass: 'bg-[#0284C7]/20 text-[#38BDF8]',
    entityType: 'Config',
    entityTarget: 'Config: security.upload_policy',
    entitySubtitle: 'Scope: System-Wide Global',
    ip: '10.15.2.46',
    networkType: 'VPN Internal UPGRIS',
    networkIcon: 'vpn_key',
    networkColor: 'text-tertiary',
    device: 'Firefox 130 • Linux Ubuntu',
    summary: 'Update max upload size limit: 10MB (.pdf, .docx, .xlsx, .zip) per attachment.',
    diffData: {
      title: 'Inspeksi Perubahan Data: CONFIG_CHANGE pada security.upload_policy',
      badge: 'Konfigurasi Sistem',
      badgeBg: 'bg-sky-600',
      entity: 'system_configurations',
      targetId: 'security.upload_policy',
      actorName: 'Admin Utama',
      actorRole: 'Admin Sistem',
      timestamp: '13 Okt 2026, 07:50:45 WIB',
      oldValues: {
        max_upload_size_mb: 5,
        allowed_mime_types: ['application/pdf', 'application/msword'],
        virus_scan_enabled: true,
      },
      newValues: {
        max_upload_size_mb: 10,
        allowed_mime_types: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/zip',
        ],
        virus_scan_enabled: true,
        updated_at: '2026-10-13T07:50:45Z',
      },
      ip: '10.15.2.46 (Kampus 4 UPGRIS)',
      worker: 'spada-core-worker-01.upgris.ac.id',
      prevHash: '6d12f4...e882',
      sha256: '99bf4321acb9876543210fedcba9876543210abcdef0123456789abcdef01234',
    },
  },
  {
    id: 'aud-4',
    timestampDate: '12 Okt 2026',
    timestampTime: '17:30:19 WIB',
    isoTimestamp: '2026-10-12T17:30:19+07:00',
    actor: {
      name: 'Admin Utama',
      id: '19820512',
      idType: 'NIP',
      role: 'Admin',
      initial: 'ADM',
      initialBg: 'bg-primary-container text-on-primary-container',
    },
    actionType: 'UNENROLL',
    actionBadgeClass: 'bg-[#E11D48]/20 text-[#FB7185]',
    entityType: 'Enrollment',
    entityTarget: 'Enrollment: ENR-2026-773',
    entitySubtitle: 'NIM: 23670019 (Cuti Akademik)',
    ip: '10.15.2.46',
    networkType: 'VPN Internal UPGRIS',
    networkIcon: 'vpn_key',
    networkColor: 'text-tertiary',
    device: 'Chrome 132 • Windows 11',
    summary: 'Pencabutan kepesertaan NIM 23670019 dari 6 mata kuliah karena status cuti disetujui BAA.',
  },
  {
    id: 'aud-5',
    timestampDate: '12 Okt 2026',
    timestampTime: '16:10:02 WIB',
    isoTimestamp: '2026-10-12T16:10:02+07:00',
    actor: {
      name: 'Admin Utama',
      id: '19820512',
      idType: 'NIP',
      role: 'Admin',
      initial: 'ADM',
      initialBg: 'bg-primary-container text-on-primary-container',
    },
    actionType: 'DELETE',
    actionBadgeLabel: 'DELETE / SUSPEND',
    actionBadgeClass: 'bg-[#DC2626]/20 text-[#F87171]',
    entityType: 'User',
    entityTarget: 'User: Kevin Sanjaya',
    entitySubtitle: 'NIM: 23670019',
    ip: '10.15.2.46',
    networkType: 'VPN Internal UPGRIS',
    networkIcon: 'vpn_key',
    networkColor: 'text-tertiary',
    device: 'Chrome 132 • Windows 11',
    summary: 'Penonaktifan akun (Pelanggaran Presensi & Kode Etik Integritas Akademik Surat No 811/UPGRIS/2026).',
  },
  {
    id: 'aud-6',
    timestampDate: '12 Okt 2026',
    timestampTime: '14:02:11 WIB',
    isoTimestamp: '2026-10-12T14:02:11+07:00',
    actor: {
      name: 'Dimas Arya Pratama',
      id: '24670001',
      idType: 'NIM',
      role: 'Mahasiswa',
      initial: 'DP',
      initialBg: 'bg-tertiary-container text-on-tertiary-container',
    },
    actionType: 'LOGIN',
    actionBadgeLabel: 'LOGIN / SSO',
    actionBadgeClass: 'bg-surface-container-highest text-secondary',
    entityType: 'User',
    entityTarget: 'Auth: Session 9912',
    entitySubtitle: 'Token: JWT-UPGRIS-OIDC',
    ip: '180.252.164.88',
    networkType: 'Telkomsel ISP Seluler',
    networkIcon: 'cell_tower',
    networkColor: 'text-on-surface-variant',
    device: 'Edge 131 • Android 15',
    summary: 'Login berhasil via SSO Kampus UPGRIS Central Identity Server (OAuth 2.0 PKCE).',
  },
  {
    id: 'aud-7',
    timestampDate: '11 Okt 2026',
    timestampTime: '11:20:45 WIB',
    isoTimestamp: '2026-10-11T11:20:45+07:00',
    actor: {
      name: 'Admin Utama',
      id: '19820512',
      idType: 'NIP',
      role: 'Admin',
      initial: 'ADM',
      initialBg: 'bg-primary-container text-on-primary-container',
    },
    actionType: 'CREATE',
    actionBadgeClass: 'bg-[#059669]/20 text-[#34D399]',
    entityType: 'Class',
    entityTarget: 'Class: TIF-402 TI-A',
    entitySubtitle: 'Course: Arsitektur PL Enterprise',
    ip: '10.15.2.46',
    networkType: 'VPN Internal UPGRIS',
    networkIcon: 'vpn_key',
    networkColor: 'text-tertiary',
    device: 'Chrome 132 • Windows 11',
    summary: 'Pembukaan kelas baru Arsitektur Perangkat Lunak Enterprise 3 SKS Kurikulum MBKM.',
  },
];

export default function JejakAudit() {
  const [logs] = useState(initialLogs);
  const [actionType, setActionType] = useState('GRADE_MUTATION');
  const [entityType, setEntityType] = useState('');
  const [actorQuery, setActorQuery] = useState('');
  const [ipQuery, setIpQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [copyText, setCopyText] = useState('Salin Raw JSON');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (actionType && log.actionType !== actionType) return false;
      if (entityType && log.entityType !== entityType) return false;
      if (actorQuery.trim()) {
        const q = actorQuery.toLowerCase().trim();
        if (!log.actor.name.toLowerCase().includes(q) && !log.actor.id.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (ipQuery.trim() && !log.ip.toLowerCase().includes(ipQuery.toLowerCase().trim())) {
        return false;
      }
      return true;
    });
  }, [logs, actionType, entityType, actorQuery, ipQuery]);

  const handleCopy = (logItem) => {
    const rawPayload = JSON.stringify(logItem.diffData || logItem, null, 2);
    navigator.clipboard.writeText(rawPayload);
    setCopyText('Tersalin!');
    setTimeout(() => setCopyText('Salin Raw JSON'), 1800);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-space-sm pt-space-md mb-space-lg">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
          <a className="hover:text-primary transition-colors flex items-center gap-1" href="#">
            <span className="material-symbols-outlined text-[16px]">home</span>
            Beranda
          </a>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span>Administrasi SPADA</span>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-primary font-bold">Jejak Audit</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mt-space-xs">
          <div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Jejak Audit &amp; Integritas Sistem
              </h1>
              <span className="font-caption text-caption text-secondary font-mono px-2 py-0.5 rounded bg-surface-container-high uppercase border border-outline-variant/30">
                Audit Trail Viewer
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-4xl">
              Pelacakan immutable log mutasi data, histori otentikasi, pergeseran nilai, dan aktivitas administratif terpusat SPADA LMS UPGRIS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm shadow-sm border border-tertiary/20">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-bold tracking-wide">Status Log: IMMUTABLE &amp; SECURED</span>
            </div>
            <div className="flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm border border-outline-variant/30">
              <span className="material-symbols-outlined text-[16px] text-secondary">database</span>
              <span>Total: <strong className="text-on-surface font-semibold">2,840 Entri</strong></span>
            </div>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors shadow-sm cursor-pointer border border-outline-variant/30"
              onClick={() => showToast('Ekspor berkas CSV audit log berhasil diunduh.')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">download</span>
              <span>Ekspor Audit Log (.CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <section className="bg-surface-container rounded-xl p-space-md mb-space-lg shadow-md border border-outline-variant/20">
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs text-on-surface">
              <span className="material-symbols-outlined text-primary text-[20px]">filter_alt</span>
              <span className="font-title-md text-title-md font-semibold">Filter Lanjutan &amp; Penelusuran Log</span>
            </div>
            <span className="font-caption text-caption text-on-surface-variant">Zona Waktu: Asia/Jakarta (WIB) • UTC+7</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-sm mt-1">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Rentang Tanggal</label>
              <input
                className="px-3 py-2 bg-surface-container-low rounded-lg text-on-surface font-body-sm text-body-sm border border-outline-variant/30"
                readOnly
                value="1 Okt 2026 - 13 Okt 2026"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Tipe Aksi</label>
              <select
                className="px-3 py-2 bg-surface-container-low rounded-lg text-on-surface font-body-sm text-body-sm border border-outline-variant/30"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
              >
                <option value="">Semua Tipe Aksi</option>
                <option value="LOGIN">LOGIN / LOGOUT</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="ENROLL">ENROLL</option>
                <option value="UNENROLL">UNENROLL</option>
                <option value="GRADE_MUTATION">GRADE_MUTATION</option>
                <option value="CONFIG_CHANGE">CONFIG_CHANGE</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Entitas Sistem</label>
              <select
                className="px-3 py-2 bg-surface-container-low rounded-lg text-on-surface font-body-sm text-body-sm border border-outline-variant/30"
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
              >
                <option value="">Semua Entitas</option>
                <option value="User">User &amp; Auth</option>
                <option value="Course">Course / MK</option>
                <option value="Class">Class (Rombel)</option>
                <option value="Enrollment">Enrollment</option>
                <option value="Submission">Submission &amp; Nilai</option>
                <option value="Config">System Config</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Aktor (Nama/NIP/NIM)</label>
              <input
                className="px-3 py-2 bg-surface-container-low rounded-lg text-on-surface font-body-sm text-body-sm placeholder:text-outline border border-outline-variant/30"
                placeholder="Cari nama, NIP, NIM..."
                type="text"
                value={actorQuery}
                onChange={(e) => setActorQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Filter IP Address</label>
              <input
                className="px-3 py-2 bg-surface-container-low rounded-lg text-on-surface font-body-sm text-body-sm font-mono placeholder:text-outline border border-outline-variant/30"
                placeholder="10.15.x.x atau 180..."
                type="text"
                value={ipQuery}
                onChange={(e) => setIpQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
            <span className="text-caption text-tertiary flex items-center gap-1 font-caption">
              <span className="material-symbols-outlined text-[14px]">verified</span> Kriptografi Hash SHA-256 Valid
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high text-xs font-semibold"
                onClick={() => {
                  setActionType('');
                  setEntityType('');
                  setActorQuery('');
                  setIpQuery('');
                }}
              >
                Reset Filter
              </button>
              <button
                className="px-4 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-bold text-xs shadow-sm hover:brightness-110"
                onClick={() => showToast('Parameter filter berhasil diterapkan.')}
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-xl mb-space-lg border border-outline-variant/20">
        <div className="flex items-center justify-between px-space-md py-space-sm bg-surface-container border-b border-outline-variant/20">
          <div className="flex items-center gap-space-sm">
            <span className="w-3 h-3 rounded-full bg-tertiary"></span>
            <h2 className="font-title-md text-title-md text-on-surface font-semibold tracking-tight">
              Daftar Aktivitas &amp; Mutasi State Terverifikasi
            </h2>
          </div>
          <span className="text-caption font-caption text-on-surface-variant">
            Menampilkan {filteredLogs.length} mutasi real-time terkini
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-surface-container-high/60 text-on-surface-variant font-label-sm text-label-sm tracking-wider uppercase border-b border-outline-variant/20">
                <th className="py-3 px-4">Waktu Server</th>
                <th className="py-3 px-4">Aktor / Pelaku</th>
                <th className="py-3 px-4">Tipe Aksi</th>
                <th className="py-3 px-4">Entitas &amp; Target ID</th>
                <th className="py-3 px-4">IP &amp; Perangkat</th>
                <th className="py-3 px-4">Ringkasan Mutasi</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm divide-y divide-outline-variant/10">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className={`transition-colors ${log.isFocal ? 'bg-surface-container-high/30' : ''} hover:bg-surface-container/60`}
                >
                  <td className="py-3 px-4 font-mono text-outline whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-on-surface font-semibold">{log.timestampDate}</span>
                      <span className="text-caption font-caption text-outline">{log.timestampTime}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] ${log.actor.initialBg}`}>
                        {log.actor.initial}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">{log.actor.name}</span>
                        <span className="font-caption text-caption text-outline">{log.actor.idType}: {log.actor.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded font-label-sm text-label-sm font-bold tracking-wide ${log.actionBadgeClass}`}>
                      {log.actionBadgeLabel || log.actionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface">{log.entityTarget}</span>
                      <span className="font-caption text-caption text-secondary">{log.entitySubtitle}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-caption text-caption">
                    <div className="flex flex-col">
                      <span className="text-on-surface">{log.ip}</span>
                      <span className={`flex items-center gap-1 font-sans ${log.networkColor}`}>{log.networkType}</span>
                      <span className="text-outline font-sans">{log.device}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs text-on-surface-variant">
                    {log.actionType === 'GRADE_MUTATION' ? (
                      <p className="font-medium">
                        Mutasi skor dari <span className="text-error font-mono font-bold">75.00</span> menjadi{' '}
                        <span className="text-tertiary font-mono font-bold">88.50</span> untuk NIM 24670001 (Revisi Diagram Konteks).
                      </p>
                    ) : (
                      <p className="line-clamp-2">{log.summary}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-label-sm text-label-sm transition-colors cursor-pointer ${
                        log.isFocal
                          ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                          : 'bg-surface-container-high hover:bg-surface-bright text-secondary border border-outline-variant/30'
                      }`}
                      onClick={() => setSelectedLog(log)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {log.isFocal ? 'difference' : 'data_object'}
                      </span>
                      <span>{log.isFocal ? 'Lihat Diff JSON' : 'Detail JSON'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-space-md py-space-sm bg-surface-container gap-space-sm border-t border-outline-variant/10 text-on-surface-variant font-body-sm text-body-sm">
          <span>Menampilkan <strong className="text-on-surface">1-{filteredLogs.length}</strong> dari <strong className="text-on-surface">2,840</strong> entri log</span>
          <div className="flex items-center gap-1 font-label-sm text-label-sm">
            <button className="px-2.5 py-1.5 rounded bg-surface-container-low opacity-50" disabled>
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="px-3 py-1.5 rounded bg-primary-container text-on-primary-container font-bold">1</button>
            <button className="px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright">2</button>
            <button className="px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright">3</button>
            <span className="px-2 text-outline">...</span>
            <button className="px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright">406</button>
            <button className="px-2.5 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Integrity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="flex items-start gap-space-sm p-space-md bg-surface-container rounded-xl shadow-sm border border-outline-variant/20">
          <div className="p-2 rounded-lg bg-tertiary-container/20 text-tertiary">
            <span className="material-symbols-outlined text-[24px]">enhanced_encryption</span>
          </div>
          <div>
            <span className="font-title-md text-title-md font-semibold text-on-surface">Algoritma SHA-256 Chain</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Setiap entri log terikat kriptografi dengan hash transaksi sebelumnya sehingga tidak dapat diubah (immutable).
            </p>
          </div>
        </div>

        <div className="flex items-start gap-space-sm p-space-md bg-surface-container rounded-xl shadow-sm border border-outline-variant/20">
          <div className="p-2 rounded-lg bg-primary-container/20 text-primary">
            <span className="material-symbols-outlined text-[24px]">history_toggle_off</span>
          </div>
          <div>
            <span className="font-title-md text-title-md font-semibold text-on-surface">Retensi Log 7 Tahun</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Sesuai standar akreditasi LAM-INFOKOM dan Permendikbudristek nomor 53/2023 tentang penjaminan mutu pendidikan tinggi.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-space-sm p-space-md bg-surface-container rounded-xl shadow-sm border border-outline-variant/20">
          <div className="p-2 rounded-lg bg-secondary-container/20 text-secondary">
            <span className="material-symbols-outlined text-[24px]">policy</span>
          </div>
          <div>
            <span className="font-title-md text-title-md font-semibold text-on-surface">Kepatuhan UU PDP No. 27/2022</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Penyimpanan data log mengaburkan informasi kredensial sensitif kata sandi dan token otentikasi permanen.
            </p>
          </div>
        </div>
      </div>

      {/* JSON Diff Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl bg-surface-container rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-outline-variant/30">
            <div className="flex items-start justify-between px-space-lg py-space-md bg-surface-container-high border-b border-outline-variant/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#D97706]/20 text-[#FBBF24]">
                  <span className="material-symbols-outlined text-[24px]">difference</span>
                </div>
                <div>
                  <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
                    Inspeksi Perubahan Data: {selectedLog.actionType} pada {selectedLog.entityTarget}
                  </h3>
                  <p className="font-caption text-caption text-on-surface-variant mt-0.5">
                    Pelaku: <strong>{selectedLog.actor.name}</strong> • Waktu: {selectedLog.timestampDate}, {selectedLog.timestampTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-semibold cursor-pointer border border-outline-variant/30"
                  onClick={() => handleCopy(selectedLog)}
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">content_copy</span>
                  <span>{copyText}</span>
                </button>
                <button className="p-1 rounded text-outline hover:text-on-surface" onClick={() => setSelectedLog(null)}>
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-space-md bg-surface-container-low">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col rounded-xl overflow-hidden bg-[#93000a]/10 border border-[#93000a]/30">
                  <div className="px-space-md py-2 bg-[#93000a]/20 text-[#ffb4ab] font-bold text-xs flex justify-between">
                    <span>Nilai Lama (Old Values)</span>
                    <span className="font-mono text-[10px]">Snapshot Sebelum Revisi</span>
                  </div>
                  <pre className="p-space-md font-mono text-xs text-[#ffb4ab] bg-[#020f1e]/80 overflow-x-auto min-h-[160px]">
                    <code>{selectedLog.diffData?.oldValues ? JSON.stringify(selectedLog.diffData.oldValues, null, 2) : 'null (Data Baru)'}</code>
                  </pre>
                </div>

                <div className="flex flex-col rounded-xl overflow-hidden bg-[#00a572]/10 border border-[#00a572]/30">
                  <div className="px-space-md py-2 bg-[#00a572]/20 text-[#4edea3] font-bold text-xs flex justify-between">
                    <span>Nilai Baru (New Values)</span>
                    <span className="font-mono text-[10px]">Mutasi Terverifikasi</span>
                  </div>
                  <pre className="p-space-md font-mono text-xs text-[#4edea3] bg-[#020f1e]/80 overflow-x-auto min-h-[160px]">
                    <code>{JSON.stringify(selectedLog.diffData?.newValues || selectedLog, null, 2)}</code>
                  </pre>
                </div>
              </div>

              <div className="mt-space-md p-space-md bg-surface-container rounded-xl border border-outline-variant/20 font-mono text-xs">
                <span className="text-secondary font-bold">SHA-256 Signature:</span>{' '}
                <span className="text-on-surface break-all">{selectedLog.diffData?.sha256 || 'e8b941a57e3f4c65e8a011cd098a5d3f9b23f81e84a29d5b78c93a02bb49c014'}</span>
              </div>
            </div>

            <div className="flex justify-between px-space-lg py-space-sm bg-surface-container-high border-t border-outline-variant/20">
              <span className="text-caption text-outline">Log ini tidak dapat dihapus atau dimanipulasi oleh administrator sistem.</span>
              <button
                className="px-5 py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-semibold cursor-pointer border border-outline-variant/30"
                onClick={() => setSelectedLog(null)}
              >
                Tutup Inspektor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-container-high border border-tertiary/40 text-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

