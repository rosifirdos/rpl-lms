import React, { useState, useEffect, useRef, useMemo } from 'react';
import AppShell from '../../components/AppShell';
import { getCourseById } from '../../data/courseCatalog';

/**
 * KelolaKls — Antarmuka Dosen Pengampu untuk satu mata kuliah.
 *
 * Seluruh identitas kelas (nama MK, kode, kelas, SKS, jadwal, dosen) dan daftar
 * 16 pertemuan dibaca dari data/courseCatalog.js berdasarkan `courseId` yang
 * diteruskan App.jsx. Tidak ada identitas mata kuliah yang di-hardcode, sehingga
 * halaman ini menampilkan kelas yang sama dengan yang dipilih dosen.
 *
 * Tab:
 *   1. Pertemuan — akordeon 16 sesi (P8 UTS, P16 UAS), edit topik, materi,
 *      penugasan, dan panel kontrol sesi presensi.
 *   2. Rekap Kehadiran — matriks 16 kolom untuk seluruh mahasiswa terdaftar.
 *   3. Daftar Mahasiswa — status enrollment dan persentase kehadiran.
 *   4. Bobot & Penilaian — konfigurasi komponen penilaian OBE.
 *
 * Alur materi mengikuti DESIGN_INSTRUCTIONS_MVP2_UIUX.md:
 *   - Layar 5 — modal unggah dengan 6 state validasi berkas
 *     (default, drag-over, format salah, ukuran lebih, uploading, siap).
 *   - Layar 6 — konfirmasi hapus destruktif dan unduhan terproteksi
 *     (verifikasi sesi + progres unduh).
 */

// NIDN dosen yang sedang login pada demo ini (Dr. Bayu Pratama, M.Kom.).
// Dipakai untuk menguji jalur 403 saat `?course=` menunjuk kelas dosen lain.
const SIGNED_IN_LECTURER_NIDN = '0612345601';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.zip'];
const EXTENSION_BADGES = ['.pdf', '.docx', '.xlsx', '.zip'];

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MEETING_TAG = (number) => {
  if (number === 8) {
    return { label: 'Ujian Tengah Semester (UTS)', className: 'bg-mvp-warning-tint text-mvp-warning-ink' };
  }
  if (number === 16) {
    return { label: 'Ujian Akhir Semester (UAS)', className: 'bg-mvp-danger-tint text-mvp-danger-strong' };
  }
  return {
    label: number < 8 ? 'Pembelajaran Pra-UTS' : 'Pembelajaran Pasca-UTS',
    className: 'bg-mvp-primary-tint text-mvp-primary-strong',
  };
};

const PRESENCE_STYLE = {
  HADIR: { label: 'HADIR', icon: 'check_circle', className: 'text-mvp-success-strong bg-mvp-success-tint' },
  SAKIT: { label: 'SAKIT', icon: 'medical_services', className: 'text-mvp-warning-ink bg-mvp-warning-tint' },
  IZIN: { label: 'IZIN', icon: 'event_available', className: 'text-mvp-primary-strong bg-mvp-primary-tint' },
  ALPA: { label: 'ALPA', icon: 'cancel', className: 'text-mvp-danger-strong bg-mvp-danger-tint' },
  BELUM: { label: 'BELUM', icon: 'pending', className: 'text-mvp-muted bg-mvp-subtle' },
};

const ENROLLED_STUDENTS = [
  { nim: '24670001', name: 'Dimas Arya Pratama' },
  { nim: '24670002', name: 'Adinda Putri Maharani' },
  { nim: '24670003', name: 'Rian Bagus Santoso' },
  { nim: '24670004', name: 'Nabila Zahra' },
  { nim: '24670005', name: 'Fajar Kurniawan' },
  { nim: '24670006', name: 'Siti Nurhaliza' },
  { nim: '24670007', name: 'Kevin Sanjaya' },
  { nim: '24670008', name: 'Bagas Saputra' },
  { nim: '24670009', name: 'Ahmad Fauzi' },
  { nim: '24670010', name: 'Dewi Lestari' },
  { nim: '24670011', name: 'Rizky Maulana' },
  { nim: '24670012', name: 'Putri Ayu Wulandari' },
  { nim: '24670013', name: 'Andi Prasetyo' },
  { nim: '24670014', name: 'Bayu Nugroho' },
  { nim: '24670015', name: 'Citra Kirana' },
  { nim: '24670016', name: 'Dian Permata' },
  { nim: '24670017', name: 'Eko Saputra' },
  { nim: '24670018', name: 'Fitri Handayani' },
  { nim: '24670019', name: 'Gilang Ramadhan' },
  { nim: '24670020', name: 'Hana Safira' },
  { nim: '24670021', name: 'Indra Gunawan' },
  { nim: '24670022', name: 'Jihan Amelia' },
  { nim: '24670023', name: 'Kurnia Sandi' },
  { nim: '24670024', name: 'Larasati Dewi' },
  { nim: '24670025', name: 'Miko Pratama' },
  { nim: '24670026', name: 'Nadia Rahmawati' },
  { nim: '24670027', name: 'Oscar Wijaya' },
  { nim: '24670028', name: 'Prasetya Utama' },
  { nim: '24670029', name: 'Qori Amalia' },
  { nim: '24670030', name: 'Reza Fahlevi' },
  { nim: '24670031', name: 'Salsabila Putri' },
  { nim: '24670032', name: 'Taufik Hidayat' },
  { nim: '24670033', name: 'Umi Kalsum' },
  { nim: '24670034', name: 'Vino Bastian' },
  { nim: '24670035', name: 'Wulan Sari' },
  { nim: '24670036', name: 'Yusuf Maulana' },
  { nim: '24670037', name: 'Zahra Nabila' },
  { nim: '24670038', name: 'Arif Budiman' },
];

const ASSESSMENT_WEIGHTS = [
  { code: 'Tugas', label: 'Tugas Terstruktur & Kuis', weight: 30, cpmk: 'CPMK-2' },
  { code: 'UTS', label: 'Ujian Tengah Semester', weight: 30, cpmk: 'CPMK-1, CPMK-3' },
  { code: 'UAS', label: 'Ujian Akhir Semester & Demo Proyek', weight: 40, cpmk: 'CPMK-4' },
];

// Status kehadiran deterministik: matriks selalu stabil antar-render.
const presenceFor = (studentIndex, meetingNumber, currentMeeting) => {
  if (meetingNumber > currentMeeting) return 'BELUM';
  const seed = (studentIndex * 31 + meetingNumber * 17) % 100;
  if (seed < 82) return 'HADIR';
  if (seed < 88) return 'SAKIT';
  if (seed < 93) return 'IZIN';
  return 'ALPA';
};

export default function KelolaKls({ onNavigate, onRoleChange, courseId }) {
  const course = useMemo(() => getCourseById(courseId), [courseId]);

  const [activeTab, setActiveTab] = useState('pertemuan');
  const [meetings, setMeetings] = useState([]);
  const [expanded, setExpanded] = useState(() => new Set());
  // Status sesi presensi per pertemuan: NOT_OPENED | OPEN | CLOSED
  const [sessionStates, setSessionStates] = useState({});
  const [activeMeetingId, setActiveMeetingId] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadTarget, setUploadTarget] = useState(null);
  // Unduhan terproteksi: fase 'verifying' → 'progress' → 'done' | 'denied'.
  const [downloadState, setDownloadState] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const toastTimeoutRef = useRef(null);
  const deleteTriggerRef = useRef(null);
  const downloadTimeoutRef = useRef(null);
  const downloadIntervalRef = useRef(null);

  // Sinkronkan data dari katalog setiap kali mata kuliah berubah.
  useEffect(() => {
    const nextMeetings = course.meetings.map((meeting) => ({
      ...meeting,
      materials: meeting.materials.map((material, index) => ({
        id: `${meeting.id}-m${index + 1}`,
        ...material,
      })),
    }));
    setMeetings(nextMeetings);

    const nextStates = {};
    nextMeetings.forEach((meeting) => {
      if (meeting.number === 8 || meeting.number === 16) nextStates[meeting.id] = 'NOT_OPENED';
      else if (meeting.status === 'SESI_AKTIF') nextStates[meeting.id] = 'OPEN';
      else if (meeting.status === 'HADIR') nextStates[meeting.id] = 'CLOSED';
      else nextStates[meeting.id] = 'NOT_OPENED';
    });
    setSessionStates(nextStates);
    setExpanded(new Set([`p${course.currentMeeting}`]));
    setActiveMeetingId(`p${course.currentMeeting}`);
  }, [course]);

  // Bersihkan timer saat unmount agar tidak ada setState setelah komponen lepas.
  useEffect(() => {
    return () => {
      clearTimeout(toastTimeoutRef.current);
      clearTimeout(downloadTimeoutRef.current);
      clearInterval(downloadIntervalRef.current);
    };
  }, []);

  // Tutup modal dengan tombol Escape.
  useEffect(() => {
    if (!editingMeeting && !deleteTarget && !uploadTarget) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setEditingMeeting(null);
        setDeleteTarget(null);
        setUploadTarget(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editingMeeting, deleteTarget, uploadTarget]);

  const showToast = (message, type = 'info') => {
    clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3500);
  };

  const toggleAccordion = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setAllAccordions = (open) => {
    setExpanded(open ? new Set(meetings.map((meeting) => meeting.id)) : new Set());
  };

  const handleToggleSession = (meetingId) => {
    // Hitung status berikutnya di luar updater: updater harus murni, dan di
    // StrictMode React memanggilnya dua kali sehingga efek samping akan dobel.
    const current = sessionStates[meetingId];
    const next = current === 'OPEN' ? 'CLOSED' : 'OPEN';
    setSessionStates((prev) => ({ ...prev, [meetingId]: next }));
    setActiveMeetingId(meetingId);
    showToast(
      next === 'OPEN'
        ? 'Sesi presensi dibuka. Mahasiswa dapat mengisi kehadiran (toleransi 15 menit).'
        : 'Sesi presensi ditutup dan dikunci. Kehadiran tidak dapat diubah lagi.',
      next === 'OPEN' ? 'success' : 'info'
    );
  };

  const handleSaveTopic = (meetingId, title, description) => {
    setMeetings((prev) =>
      prev.map((meeting) => (meeting.id === meetingId ? { ...meeting, title, description } : meeting))
    );
    setEditingMeeting(null);
    showToast('Perubahan topik pertemuan berhasil disimpan.', 'success');
  };

  const requestDeleteMaterial = (meetingId, material, trigger) => {
    deleteTriggerRef.current = trigger || null;
    setDeleteTarget({ meetingId, material });
  };

  const confirmDeleteMaterial = () => {
    if (!deleteTarget) return;
    const { meetingId, material } = deleteTarget;
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === meetingId
          ? {
              ...meeting,
              materials: meeting.materials.filter((item) => item.id !== material.id),
              materialsCount: Math.max(0, meeting.materialsCount - 1),
            }
          : meeting
      )
    );
    setDeleteTarget(null);
    showToast(`Berkas "${material.name}" berhasil dihapus.`, 'success');
    // Kembalikan fokus ke tombol pemicu agar alur keyboard tidak terputus.
    if (deleteTriggerRef.current) deleteTriggerRef.current.focus();
    deleteTriggerRef.current = null;
  };

  const cancelDeleteMaterial = () => {
    setDeleteTarget(null);
    if (deleteTriggerRef.current) deleteTriggerRef.current.focus();
    deleteTriggerRef.current = null;
  };

  // ── Alur unggah materi (Layar 5) ──────────────────────────────────────────
  const requestUploadMaterial = (meeting) => {
    setUploadTarget({ meeting });
  };

  const closeUploadMaterial = () => setUploadTarget(null);

  const handleUploadedMaterial = (meetingId, material) => {
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === meetingId
          ? {
              ...meeting,
              materials: [...meeting.materials, material],
              materialsCount: meeting.materialsCount + 1,
            }
          : meeting
      )
    );
    setUploadTarget(null);
    showToast(`Berkas "${material.name}" berhasil ditambahkan ke pertemuan.`, 'success');
  };

  // ── Unduhan terproteksi (Layar 6, state 2 & 3) ────────────────────────────
  const handleDownloadMaterial = (meetingId, material) => {
    clearTimeout(downloadTimeoutRef.current);
    clearInterval(downloadIntervalRef.current);

    // Guard otorisasi nyata: hanya dosen pengampu mata kuliah ini yang boleh
    // mengunduh berkasnya. Bila `?course=` menunjuk kelas milik dosen lain,
    // permintaan ditolak 403 — sama seperti RBAC peran di AppShell.
    const authorized = course.nidn === SIGNED_IN_LECTURER_NIDN;
    setDownloadState({ material, meetingId, phase: authorized ? 'verifying' : 'denied', progress: 0 });

    if (!authorized) {
      showToast('Akses unduhan ditolak: Anda bukan dosen pengampu kelas ini.', 'info');
      return;
    }

    downloadTimeoutRef.current = setTimeout(() => {
      let progress = 0;
      setDownloadState((prev) => (prev ? { ...prev, phase: 'progress', progress } : prev));
      downloadIntervalRef.current = setInterval(() => {
        progress += 20;
        if (progress >= 100) {
          clearInterval(downloadIntervalRef.current);
          downloadIntervalRef.current = null;
          setDownloadState((prev) => (prev ? { ...prev, phase: 'done', progress: 100 } : prev));
          showToast(`Berkas "${material.name}" berhasil diunduh.`, 'success');
          return;
        }
        setDownloadState((prev) => (prev ? { ...prev, progress } : prev));
      }, 180);
    }, 550);
  };

  const dismissDownloadState = () => {
    clearTimeout(downloadTimeoutRef.current);
    clearInterval(downloadIntervalRef.current);
    downloadTimeoutRef.current = null;
    downloadIntervalRef.current = null;
    setDownloadState(null);
  };

  const revealMeeting = (meetingId) => {
    setExpanded((prev) => new Set(prev).add(meetingId));
    setActiveMeetingId(meetingId);
    // Di layar lebar panel kontrol sudah sticky di kanan, jadi tidak perlu
    // melompat. Di layar sempit panel ada di bawah 16 pertemuan — gulir ke sana.
    if (typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches) {
      const node = document.getElementById('session-control-panel');
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Metrik kehadiran diturunkan dari satu sumber (presenceFor) agar angka pada
  // kartu ringkasan, matriks, dan panel sesi selalu konsisten.
  const attendanceRows = useMemo(
    () =>
      ENROLLED_STUDENTS.map((student, index) => {
        const cells = meetings.map((meeting) => presenceFor(index, meeting.number, course.currentMeeting));
        const recorded = cells.filter((status) => status !== 'BELUM');
        const present = cells.filter((status) => status === 'HADIR').length;
        const percentage = recorded.length > 0 ? Math.round((present / recorded.length) * 100) : 0;
        return { ...student, cells, present, recorded: recorded.length, percentage };
      }),
    [meetings, course.currentMeeting]
  );

  const classAttendancePct = useMemo(() => {
    const totalRecorded = attendanceRows.reduce((sum, row) => sum + row.recorded, 0);
    const totalPresent = attendanceRows.reduce((sum, row) => sum + row.present, 0);
    return totalRecorded > 0 ? Math.round((totalPresent / totalRecorded) * 100) : 0;
  }, [attendanceRows]);

  const eligibleCount = attendanceRows.filter((row) => row.percentage >= 70).length;
  const activeMeeting = meetings.find((meeting) => meeting.id === activeMeetingId) || meetings[0];
  const activeSessionState = (activeMeeting && sessionStates[activeMeeting.id]) || 'NOT_OPENED';
  // Pertemuan UTS/UAS tidak punya sesi presensi perkuliahan — jangan tawarkan
  // tombol buka sesi pada minggu evaluasi.
  const activeIsExam = Boolean(activeMeeting && (activeMeeting.number === 8 || activeMeeting.number === 16));
  const activeLiveAttendance = useMemo(() => {
    if (!activeMeeting) return { present: 0, total: ENROLLED_STUDENTS.length };
    const columnIndex = activeMeeting.number - 1;
    let present = 0;
    attendanceRows.forEach((row) => {
      if (row.cells[columnIndex] === 'HADIR') present += 1;
    });
    return { present, total: ENROLLED_STUDENTS.length };
  }, [activeMeeting, attendanceRows]);

  // Rincian status pertemuan aktif, diturunkan dari matriks yang sama sehingga
  // panel sesi dan tabel rekap tidak pernah menampilkan angka berbeda.
  const activeBreakdown = useMemo(() => {
    const counts = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0 };
    if (!activeMeeting) return counts;
    const columnIndex = activeMeeting.number - 1;
    attendanceRows.forEach((row) => {
      const status = row.cells[columnIndex];
      if (status && status in counts) counts[status] += 1;
    });
    return counts;
  }, [activeMeeting, attendanceRows]);

  const totalSks = course.sks;
  const progressPct = Math.round((course.currentMeeting / course.totalMeetings) * 100);

  const tabClass = (tab) =>
    `pb-3 text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer border-b-2 ${
      activeTab === tab
        ? 'text-mvp-primary-strong font-bold border-mvp-primary'
        : 'text-mvp-muted hover:text-mvp-ink font-medium border-transparent'
    }`;

  return (
    <AppShell
      activeRole="dosen"
      onRoleChange={onRoleChange}
      activeNavPath="kelola-kelas"
      onNavChange={onNavigate}
    >
      <div className="flex flex-col w-full pb-16 space-y-6 pt-2 max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toast.visible && (
          <div className="fixed top-5 right-5 z-[9999]" role="status" aria-live="polite">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
                toast.type === 'success'
                  ? 'bg-mvp-success-tint text-mvp-success-strong border-mvp-success/40'
                  : 'bg-mvp-card text-mvp-ink border-mvp-line'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {toast.type === 'success' ? 'check_circle' : 'info'}
              </span>
              <span className="font-label-md text-label-md">{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
                aria-label="Tutup notifikasi"
                className="p-1 rounded hover:opacity-75"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* BREADCRUMB */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md flex-wrap"
        >
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('dasbor-dosen')}
            className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Dasbor</span>
          </button>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('kelas-diampu')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Kelas Diampu
          </button>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <span className="text-on-surface font-semibold truncate max-w-xs md:max-w-none">
            {course.name} ({course.classGroup})
          </span>
          <span className="px-2 py-0.5 rounded bg-mvp-primary-soft text-mvp-primary-strong text-xs font-bold">
            Mode Kelola
          </span>
        </nav>

        {/* CLASS HEADER CARD */}
        <section className="bg-mvp-card rounded-xl shadow-xl p-6 md:p-8 text-mvp-ink">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-mvp-primary-tint text-mvp-primary-strong font-mono text-xs font-bold">
                  {course.classGroup}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-mvp-subtle text-mvp-body text-xs font-semibold">
                  {totalSks} SKS • Teori &amp; Praktik
                </span>
                <span className="px-2.5 py-1 rounded-md bg-mvp-success-soft text-mvp-success-strong text-xs font-semibold">
                  Reguler Pagi
                </span>
                <span className="px-2.5 py-1 rounded-md bg-mvp-subtle text-mvp-body text-xs font-medium">
                  Kode MK: {course.code}
                </span>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-headline-lg font-bold text-mvp-ink tracking-tight">
                  {course.name}
                </h1>
                <p className="text-mvp-muted text-body-sm mt-1 truncate">
                  Dosen Pengampu: {course.lecturer} • NIDN {course.nidn}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-1 text-xs text-mvp-body">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-mvp-primary-strong">group</span>
                  <span>
                    {ENROLLED_STUDENTS.length} Mahasiswa Terdaftar{' '}
                    <span className="text-mvp-muted">(Maks: 40)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-mvp-warning-ink">calendar_month</span>
                  <span>{course.semester}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-mvp-primary-strong">auto_stories</span>
                  <span>{course.totalMeetings} Pertemuan (SN-Dikti OBE)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-mvp-success-ink">schedule</span>
                  <span className="truncate">{course.schedule}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap lg:flex-col xl:flex-row items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('unggah-materi')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-mvp-subtle hover:bg-mvp-line text-mvp-body font-label-md transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span>Unggah Materi</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('rekap-kehadiran')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-mvp-subtle hover:bg-mvp-line text-mvp-body font-label-md transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">table_chart</span>
                <span>Rekap &amp; Nilai</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('pemeriksaan-tugas')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-mvp-primary hover:bg-mvp-primary-hover text-white font-label-md font-semibold shadow-md transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                <span>Periksa Tugas</span>
              </button>
            </div>
          </div>

          {/* TABS */}
          <div
            role="tablist"
            aria-label="Navigasi kelola kelas"
            className="flex items-center gap-6 mt-6 pt-4 border-t border-mvp-line overflow-x-auto"
          >
            {[
              { key: 'pertemuan', icon: 'view_timeline', label: `Pertemuan (${course.totalMeetings} Sesi)` },
              { key: 'rekap', icon: 'how_to_reg', label: `Rekap Kehadiran (${ENROLLED_STUDENTS.length} Mhs)` },
              { key: 'mahasiswa', icon: 'group', label: 'Daftar Mahasiswa' },
              { key: 'bobot', icon: 'assessment', label: 'Bobot & Penilaian' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={tabClass(tab.key)}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ═════ TAB 1: PERTEMUAN ═════ */}
        {activeTab === 'pertemuan' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Kolom kiri: akordeon 16 pertemuan */}
            <div className="flex-1 w-full space-y-4 min-w-0">
              <div className="bg-mvp-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="material-symbols-outlined text-mvp-primary-strong text-[20px]">account_tree</span>
                  <span className="font-title-md text-title-md text-mvp-ink font-semibold">
                    Silabus &amp; Sesi Perkuliahan
                  </span>
                  <span className="text-xs bg-mvp-primary-soft text-mvp-primary-strong px-2.5 py-0.5 rounded-full font-bold">
                    {course.currentMeeting} / {course.totalMeetings} Terlaksana
                  </span>
                  <span className="text-xs text-mvp-muted">OBE-Compliant · {progressPct}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAllAccordions(true)}
                    className="text-mvp-body hover:text-mvp-primary-strong text-xs px-2.5 py-1.5 rounded bg-mvp-subtle hover:bg-mvp-line transition-colors cursor-pointer"
                  >
                    Perluas Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllAccordions(false)}
                    className="text-mvp-body hover:text-mvp-primary-strong text-xs px-2.5 py-1.5 rounded bg-mvp-subtle hover:bg-mvp-line transition-colors cursor-pointer"
                  >
                    Tutup Semua
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {meetings.map((meeting) => {
                  const tag = MEETING_TAG(meeting.number);
                  const isOpen = expanded.has(meeting.id);
                  const isExam = meeting.number === 8 || meeting.number === 16;
                  const sessionState = sessionStates[meeting.id] || 'NOT_OPENED';
                  const panelId = `meeting-panel-${meeting.id}`;

                  return (
                    <div
                      key={meeting.id}
                      id={`meeting-${meeting.id}`}
                      className={`rounded-xl bg-mvp-card text-mvp-ink overflow-hidden transition-all ${
                        sessionState === 'OPEN'
                          ? 'shadow-xl border-l-4 border-l-mvp-primary'
                          : 'shadow-sm'
                      }`}
                    >
                      <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                              sessionState === 'OPEN'
                                ? 'bg-mvp-primary text-white'
                                : meeting.status === 'HADIR'
                                  ? 'bg-mvp-success-tint text-mvp-success-strong'
                                  : 'bg-mvp-subtle text-mvp-muted'
                            }`}
                          >
                            P{meeting.number}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-mvp-ink truncate">
                                {meeting.title.replace(/^P\d+\s•\s/, '')}
                              </span>
                              <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${tag.className}`}>
                                {tag.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-mvp-muted">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">description</span>
                                {meeting.materials.length} Materi
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">fact_check</span>
                                {sessionState === 'OPEN'
                                  ? 'Sesi dibuka'
                                  : sessionState === 'CLOSED'
                                    ? 'Presensi ditutup'
                                    : 'Belum dibuka'}
                              </span>
                              <span>•</span>
                              <span>{meeting.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!isExam && (
                            <button
                              type="button"
                              onClick={() => setEditingMeeting(meeting)}
                              className="px-2.5 py-1 rounded bg-mvp-subtle hover:bg-mvp-line text-mvp-body text-xs transition-colors cursor-pointer"
                            >
                              Ubah
                            </button>
                          )}
                          {!isExam && (
                            <button
                              type="button"
                              onClick={() => onNavigate && onNavigate('manajemen-materi')}
                              className="px-2.5 py-1 rounded bg-mvp-primary-soft text-mvp-primary-strong hover:bg-mvp-primary-tint text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Materi
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleAccordion(meeting.id)}
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            aria-label={`Toggle detail P${meeting.number}`}
                            className="p-1 rounded text-mvp-muted hover:text-mvp-ink hover:bg-mvp-subtle transition-colors cursor-pointer"
                          >
                            <span
                              className={`material-symbols-outlined text-[20px] transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            >
                              expand_more
                            </span>
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div
                          id={panelId}
                          className="px-4 pb-4 pt-1 border-t border-mvp-line bg-mvp-page/60 space-y-4"
                        >
                          <p className="text-xs text-mvp-body leading-relaxed">{meeting.description}</p>

                          {isExam ? (
                            <div className="p-4 rounded-xl bg-mvp-subtle text-xs text-mvp-body flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] text-mvp-warning-ink">
                                info
                              </span>
                              <span>
                                Lembar ujian tersedia pada tahap evaluasi. Materi dan sesi presensi tidak
                                berlaku untuk pertemuan ujian.
                              </span>
                            </div>
                          ) : (
                            <>
                              {meeting.materials.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-bold text-mvp-ink flex items-center gap-2">
                                    <span className="material-symbols-outlined text-mvp-primary-strong text-[18px]">
                                      folder_open
                                    </span>
                                    <span>Materi Pembelajaran ({meeting.materials.length} Berkas)</span>
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {meeting.materials.map((material) => (
                                      <div
                                        key={material.id}
                                        className="p-3 rounded-xl bg-mvp-subtle flex items-center justify-between gap-3"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="w-9 h-9 rounded-lg bg-mvp-card text-mvp-danger-ink flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[20px]">
                                              {material.type === 'pdf' ? 'picture_as_pdf' : 'description'}
                                            </span>
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-xs font-bold text-mvp-ink truncate">
                                              {material.name}
                                            </p>
                                            <p className="text-[11px] text-mvp-muted">{material.size}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => handleDownloadMaterial(meeting.id, material)}
                                            aria-label={`Unduh ${material.name}`}
                                            title="Berkas terproteksi — diverifikasi melalui sesi Anda"
                                            className="p-1.5 rounded text-mvp-body hover:text-mvp-primary-strong hover:bg-mvp-card transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-mvp-primary/60"
                                          >
                                            <span className="material-symbols-outlined text-[16px]">download</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(event) =>
                                              requestDeleteMaterial(meeting.id, material, event.currentTarget)
                                            }
                                            aria-label={`Hapus ${material.name}`}
                                            className="p-1.5 rounded text-mvp-muted hover:text-mvp-danger-strong hover:bg-mvp-card transition-colors cursor-pointer"
                                          >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => revealMeeting(meeting.id)}
                                  className="px-3 py-1.5 rounded-lg bg-mvp-card border border-mvp-line text-mvp-body hover:text-mvp-primary-strong text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Kelola Sesi Presensi
                                </button>
                                <button
                                  type="button"
                                  onClick={() => requestUploadMaterial(meeting)}
                                  className="px-3 py-1.5 rounded-lg bg-mvp-card border border-mvp-line text-mvp-body hover:text-mvp-primary-strong text-xs font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-mvp-primary/60"
                                >
                                  Unggah Materi
                                </button>
                              </div>

                              {downloadState && downloadState.meetingId === meeting.id && (
                                <DownloadStatusCard
                                  state={downloadState}
                                  onDismiss={dismissDownloadState}
                                  onBackToDashboard={() => onNavigate && onNavigate('dasbor-dosen')}
                                />
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kolom kanan: panel kontrol sesi presensi */}
            <div id="session-control-panel" className="w-full lg:w-96 shrink-0 lg:sticky lg:top-20 space-y-4">
              <div className="bg-mvp-card rounded-xl shadow-xl p-5 space-y-4 text-mvp-ink">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          activeSessionState === 'OPEN'
                            ? 'bg-mvp-success animate-pulse'
                            : activeSessionState === 'CLOSED'
                              ? 'bg-mvp-muted'
                              : 'bg-mvp-warning'
                        }`}
                      />
                      <h2 className="font-title-md text-mvp-ink font-bold">
                        Kontrol Presensi {activeMeeting ? `P${activeMeeting.number}` : ''}
                      </h2>
                    </div>
                    <p className="text-[11px] text-mvp-muted mt-0.5">
                      {course.name} ({course.classGroup})
                    </p>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold ${
                      activeSessionState === 'OPEN'
                        ? 'bg-mvp-success-tint text-mvp-success-strong'
                        : activeSessionState === 'CLOSED'
                          ? 'bg-mvp-subtle text-mvp-muted'
                          : 'bg-mvp-warning-tint text-mvp-warning-ink'
                    }`}
                  >
                    {activeSessionState === 'OPEN'
                      ? 'DIBUKA'
                      : activeSessionState === 'CLOSED'
                        ? 'DITUTUP'
                        : 'BELUM DIBUKA'}
                  </span>
                </div>

                {/* Pemilih pertemuan */}
                <div>
                  <label htmlFor="active-meeting-select" className="sr-only">
                    Pilih pertemuan
                  </label>
                  <select
                    id="active-meeting-select"
                    value={activeMeeting ? activeMeeting.id : ''}
                    onChange={(event) => setActiveMeetingId(event.target.value)}
                    className="w-full bg-mvp-subtle text-mvp-ink text-xs rounded-lg px-3 py-2 border border-mvp-line cursor-pointer focus:outline-none focus:ring-2 focus:ring-mvp-primary/50"
                  >
                    {meetings.map((meeting) => (
                      <option key={meeting.id} value={meeting.id}>
                        P{meeting.number} — {meeting.title.replace(/^P\d+\s•\s/, '')}
                      </option>
                    ))}
                  </select>
                </div>

                {!activeIsExam && activeSessionState === 'OPEN' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-mvp-success-tint">
                      <span className="flex items-center gap-2 text-xs font-bold text-mvp-success-strong">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mvp-success opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-mvp-success" />
                        </span>
                        Sesi Presensi Aktif
                      </span>
                      <span className="text-[11px] font-mono text-mvp-success-strong">
                        Toleransi 15 menit
                      </span>
                    </div>

                    <div className="bg-mvp-subtle rounded-xl p-4 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-bold text-mvp-ink">{activeLiveAttendance.present}</span>
                          <span className="text-base text-mvp-muted"> / {activeLiveAttendance.total}</span>
                        </div>
                        <span className="text-xs font-bold text-mvp-success-strong">
                          {Math.round((activeLiveAttendance.present / activeLiveAttendance.total) * 100)}% Hadir
                        </span>
                      </div>
                      <p className="text-[11px] text-mvp-body">
                        Mahasiswa sudah mengisi kehadiran pertemuan ini.
                      </p>
                      <div className="w-full h-2.5 rounded-full bg-mvp-line overflow-hidden">
                        <div
                          className="h-full bg-mvp-success rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round(
                              (activeLiveAttendance.present / activeLiveAttendance.total) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSession(activeMeeting.id)}
                      className="w-full py-2.5 rounded-lg bg-mvp-danger hover:bg-mvp-danger-strong text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      <span>Tutup Sesi Presensi</span>
                    </button>
                  </div>
                )}

                {activeIsExam ? (
                  <div className="p-4 rounded-lg bg-mvp-warning-soft text-center space-y-2">
                    <span className="material-symbols-outlined text-[28px] text-mvp-warning-ink">quiz</span>
                    <p className="text-sm font-semibold text-mvp-ink">Pekan Evaluasi</p>
                    <p className="text-[11px] text-mvp-muted leading-relaxed">
                      P{activeMeeting.number} adalah pekan {activeMeeting.number === 8 ? 'Ujian Tengah Semester' : 'Ujian Akhir Semester'}.
                      Presensi perkuliahan tidak dibuka pada pekan evaluasi.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('rekap-kehadiran')}
                      className="w-full py-2 rounded-lg bg-mvp-card border border-mvp-line text-mvp-body hover:text-mvp-primary-strong text-xs font-semibold transition-colors mt-2 cursor-pointer"
                    >
                      Lihat Rekap Kehadiran
                    </button>
                  </div>
                ) : activeSessionState === 'NOT_OPENED' && (
                  <div className="p-4 rounded-lg bg-mvp-subtle text-center space-y-2">
                    <span className="material-symbols-outlined text-[28px] text-mvp-warning-ink">lock_clock</span>
                    <p className="text-sm font-semibold text-mvp-ink">Presensi Belum Dibuka</p>
                    <p className="text-[11px] text-mvp-muted leading-relaxed">
                      Batas toleransi default 15 menit dengan verifikasi geolokasi / IP kampus.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleToggleSession(activeMeeting.id)}
                      className="w-full py-2 rounded-lg bg-mvp-primary hover:bg-mvp-primary-hover text-white text-sm font-semibold transition-colors mt-2 cursor-pointer"
                    >
                      Buka Sesi Presensi
                    </button>
                  </div>
                )}

                {!activeIsExam && activeSessionState === 'CLOSED' && (
                  <div className="p-4 rounded-lg bg-mvp-subtle text-center space-y-2">
                    <span className="material-symbols-outlined text-[28px] text-mvp-success-ink">
                      check_circle
                    </span>
                    <p className="text-sm font-semibold text-mvp-ink">Sesi Selesai &amp; Terkunci</p>
                    <p className="text-[11px] text-mvp-muted">
                      {activeBreakdown.HADIR} Hadir • {activeBreakdown.SAKIT} Sakit •{' '}
                      {activeBreakdown.IZIN} Izin • {activeBreakdown.ALPA} Alpa
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('daftar-hadir-koreksi')}
                      className="w-full py-2 rounded-lg bg-mvp-card border border-mvp-line text-mvp-body hover:text-mvp-primary-strong text-xs font-semibold transition-colors mt-2 cursor-pointer"
                    >
                      Koreksi Manual Kehadiran
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleSession(activeMeeting.id)}
                      className="w-full py-2 rounded-lg bg-mvp-primary-soft text-mvp-primary-strong hover:bg-mvp-primary-tint text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Buka Ulang Sesi
                    </button>
                  </div>
                )}
              </div>

              {/* Ringkasan kehadiran kelas */}
              <div className="bg-mvp-card rounded-xl p-5 space-y-3 shadow-sm text-mvp-ink">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-mvp-muted uppercase tracking-wider">
                    Rasio Kehadiran Kelas
                  </span>
                  <span className="material-symbols-outlined text-mvp-success-ink text-[18px]">analytics</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-mvp-ink">{classAttendancePct}%</span>
                  <span className="text-xs font-semibold text-mvp-success-strong">
                    {eligibleCount} / {ENROLLED_STUDENTS.length} Aman (≥70%)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('rekap')}
                  className="w-full py-2 rounded-lg bg-mvp-primary-soft text-mvp-primary-strong hover:bg-mvp-primary-tint text-xs font-semibold transition-colors cursor-pointer"
                >
                  Lihat Matriks {course.totalMeetings} Pertemuan
                </button>
              </div>

              <div className="bg-mvp-card rounded-xl p-5 space-y-2 text-mvp-ink shadow-sm">
                <div className="flex items-center gap-2 text-mvp-body text-xs font-semibold">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  <span>Catatan Dosen Pengampu</span>
                </div>
                <p className="text-[11px] text-mvp-muted leading-relaxed">
                  Toleransi keterlambatan baku SPADA UPGRIS adalah 15 menit. Mahasiswa yang mengisi
                  presensi di luar radius lab atau jaringan WiFi kampus akan ditandai label{' '}
                  <span className="text-mvp-body font-medium">Mobile</span> untuk ditinjau saat
                  evaluasi kehadiran mingguan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═════ TAB 2: REKAP KEHADIRAN ═════ */}
        {activeTab === 'rekap' && (
          <div className="bg-mvp-card rounded-xl shadow-lg p-6 text-mvp-ink space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-mvp-ink">Matriks Kehadiran {course.totalMeetings} Pertemuan</h2>
                <p className="text-xs text-mvp-muted">
                  Rasio kelas {classAttendancePct}% • {eligibleCount} dari {ENROLLED_STUDENTS.length}{' '}
                  mahasiswa memenuhi ambang 70%.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('rekap-kehadiran')}
                className="px-3 py-1.5 rounded-lg bg-mvp-primary hover:bg-mvp-primary-hover text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                <span>Buka Rekap Lengkap</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-mvp-subtle text-mvp-body font-bold border-b border-mvp-line">
                    <th className="py-2.5 px-3 sticky left-0 bg-mvp-subtle">NIM</th>
                    <th className="py-2.5 px-3 sticky left-24 bg-mvp-subtle">Nama</th>
                    {meetings.map((meeting) => (
                      <th
                        key={meeting.id}
                        className={`py-2.5 px-2 text-center ${
                          meeting.number === 8
                            ? 'bg-mvp-warning-tint text-mvp-warning-ink'
                            : meeting.number === 16
                              ? 'bg-mvp-danger-tint text-mvp-danger-strong'
                              : ''
                        }`}
                      >
                        P{meeting.number}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-center">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mvp-line text-mvp-body">
                  {attendanceRows.map((row) => (
                    <tr key={row.nim}>
                      <td className="py-2 px-3 font-mono text-[11px]">{row.nim}</td>
                      <td className="py-2 px-3 font-medium text-mvp-ink whitespace-nowrap">{row.name}</td>
                      {row.cells.map((status, index) => {
                        const style = PRESENCE_STYLE[status];
                        return (
                          <td key={`${row.nim}-${index}`} className="py-2 px-2 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold ${style.className}`}
                              title={`P${index + 1}: ${style.label}`}
                            >
                              {style.label.charAt(0)}
                            </span>
                          </td>
                        );
                      })}
                      <td
                        className={`py-2 px-3 text-center font-bold ${
                          row.percentage >= 70 ? 'text-mvp-success-strong' : 'text-mvp-danger-strong'
                        }`}
                      >
                        {row.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-mvp-line text-[11px] text-mvp-muted">
              {Object.entries(PRESENCE_STYLE).map(([key, style]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${style.className}`}
                  >
                    {style.label.charAt(0)}
                  </span>
                  <span>{style.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ═════ TAB 3: DAFTAR MAHASISWA ═════ */}
        {activeTab === 'mahasiswa' && (
          <div className="bg-mvp-card rounded-xl shadow-lg p-6 text-mvp-ink space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-mvp-ink">Mahasiswa Terdaftar</h2>
                <p className="text-xs text-mvp-muted">
                  {ENROLLED_STUDENTS.length} mahasiswa ter-enroll pada {course.name} ({course.classGroup}).
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-mvp-subtle text-mvp-body text-xs font-semibold">
                Kapasitas 40 • Sisa {Math.max(0, 40 - ENROLLED_STUDENTS.length)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-mvp-subtle text-mvp-body font-bold border-b border-mvp-line">
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">NIM</th>
                    <th className="py-2.5 px-3">Nama Mahasiswa</th>
                    <th className="py-2.5 px-3 text-center">Sesi Tercatat</th>
                    <th className="py-2.5 px-3 text-center">Persentase</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mvp-line text-mvp-body">
                  {attendanceRows.map((row, index) => (
                    <tr key={row.nim}>
                      <td className="py-2.5 px-3 text-mvp-muted">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{row.nim}</td>
                      <td className="py-2.5 px-3 font-medium text-mvp-ink">{row.name}</td>
                      <td className="py-2.5 px-3 text-center">
                        {row.present} / {row.recorded}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-center font-bold ${
                          row.percentage >= 70 ? 'text-mvp-success-strong' : 'text-mvp-danger-strong'
                        }`}
                      >
                        {row.percentage}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            row.percentage >= 70
                              ? 'bg-mvp-success-tint text-mvp-success-strong'
                              : 'bg-mvp-danger-tint text-mvp-danger-strong'
                          }`}
                        >
                          {row.percentage >= 70 ? 'Aman' : 'Perlu Perhatian'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═════ TAB 4: BOBOT & PENILAIAN ═════ */}
        {activeTab === 'bobot' && (
          <div className="bg-mvp-card rounded-xl shadow-lg p-6 text-mvp-ink space-y-4">
            <div>
              <h2 className="text-lg font-bold text-mvp-ink">Bobot &amp; Komponen Penilaian OBE</h2>
              <p className="text-xs text-mvp-muted">
                Konfigurasi bobot akhir semester untuk {course.name} ({course.classGroup}).
              </p>
            </div>

            <div className="space-y-3">
              {ASSESSMENT_WEIGHTS.map((item) => (
                <div key={item.code} className="p-4 rounded-xl bg-mvp-subtle space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-mvp-ink">{item.label}</p>
                      <p className="text-[11px] text-mvp-muted">{item.cpmk}</p>
                    </div>
                    <span className="text-sm font-bold text-mvp-primary-strong">{item.weight}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-mvp-line overflow-hidden">
                    <div
                      className="h-full bg-mvp-primary rounded-full"
                      style={{ width: `${item.weight}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-mvp-primary-soft">
              <span className="text-sm font-bold text-mvp-ink">Total Bobot</span>
              <span className="text-sm font-bold text-mvp-primary-strong">
                {ASSESSMENT_WEIGHTS.reduce((sum, item) => sum + item.weight, 0)}%
              </span>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-mvp-warning-soft text-mvp-warning-ink text-[11px]">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>
                Ambang batas kehadiran 70% diberlakukan sebagai syarat akses ujian pada tahap evaluasi
                UTS/UAS.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Edit Topik Pertemuan */}
      {editingMeeting && (
        <EditMeetingModal
          meeting={editingMeeting}
          onSave={handleSaveTopic}
          onClose={() => setEditingMeeting(null)}
        />
      )}

      {/* MODAL: Konfirmasi Hapus Materi */}
      {deleteTarget && (
        <DeleteMaterialDialog
          material={deleteTarget.material}
          onConfirm={confirmDeleteMaterial}
          onCancel={cancelDeleteMaterial}
        />
      )}

      {/* MODAL: Unggah Materi dengan 6 state validasi berkas */}
      {uploadTarget && (
        <UploadMaterialModal
          meeting={uploadTarget.meeting}
          course={course}
          onClose={closeUploadMaterial}
          onUploaded={handleUploadedMaterial}
        />
      )}
    </AppShell>
  );
}

function EditMeetingModal({ meeting, onSave, onClose }) {
  const titleId = `edit-meeting-title-${meeting.id}`;
  const [title, setTitle] = useState(meeting.title.replace(/^P\d+\s•\s/, ''));
  const [description, setDescription] = useState(meeting.description);

  return (
    <div className="fixed inset-0 z-[9999] bg-overlay backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-mvp-card rounded-2xl max-w-lg w-full p-6 border border-mvp-line shadow-2xl text-mvp-ink"
      >
        <h3 id={titleId} className="text-lg font-bold text-mvp-ink mb-1">
          Ubah Topik Pertemuan {meeting.number}
        </h3>
        <p className="text-xs text-mvp-muted mb-4">
          Perbarui judul materi dan capaian pembelajaran sesuai Rencana Pembelajaran Semester.
        </p>

        <div className="space-y-3">
          <div>
            <label htmlFor="edit-meeting-title" className="block text-[11px] uppercase font-bold text-mvp-muted mb-1">
              Judul Pertemuan
            </label>
            <input
              id="edit-meeting-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full bg-mvp-page text-mvp-ink p-2.5 rounded-lg border border-mvp-line focus:outline-none focus:ring-2 focus:ring-mvp-primary/50 text-sm"
            />
          </div>
          <div>
            <label htmlFor="edit-meeting-desc" className="block text-[11px] uppercase font-bold text-mvp-muted mb-1">
              Capaian Pembelajaran (Sub-CPMK)
            </label>
            <textarea
              id="edit-meeting-desc"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full bg-mvp-page text-mvp-ink p-2.5 rounded-lg border border-mvp-line focus:outline-none focus:ring-2 focus:ring-mvp-primary/50 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-mvp-subtle hover:bg-mvp-line text-mvp-body text-sm font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onSave(meeting.id, `P${meeting.number} • ${title}`, description)}
            className="px-4 py-2 rounded-lg bg-mvp-primary hover:bg-mvp-primary-hover text-white text-sm font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteMaterialDialog({ material, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-overlay backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-material-title"
        className="bg-mvp-card rounded-2xl max-w-md w-full p-6 border border-mvp-line shadow-2xl text-mvp-ink"
      >
        <div className="w-12 h-12 rounded-full bg-mvp-danger-tint text-mvp-danger-ink flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[24px]">delete</span>
        </div>

        <h3 id="delete-material-title" className="text-lg font-bold text-mvp-ink mb-2">
          Hapus Materi Pembelajaran?
        </h3>
        <p className="text-xs text-mvp-body leading-relaxed mb-4">
          Materi <strong>&quot;{material.name}&quot;</strong> akan dihapus permanen dan tidak dapat
          diakses lagi oleh mahasiswa yang terdaftar.
        </p>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-mvp-warning-tint text-mvp-warning-ink text-[11px] mb-5">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          <span>Tindakan ini tidak dapat dibatalkan.</span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-mvp-subtle hover:bg-mvp-line text-mvp-body text-sm font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-mvp-danger hover:bg-mvp-danger-strong text-white text-sm font-bold shadow-md transition-colors cursor-pointer"
          >
            Ya, Hapus Materi
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * DownloadStatusCard — Layar 6 state 2 & 3.
 *
 * 'denied'  → kartu inline 403 (bukan halaman penuh) sesuai spesifikasi desain.
 * 'verifying' / 'progress' → baris materi berubah jadi indikator progres
 *   dengan ikon shield, teks "Mengunduh... N%" dan progress bar tipis.
 * 'done' → konfirmasi ringkas yang bisa ditutup.
 */
function DownloadStatusCard({ state, onDismiss, onBackToDashboard }) {
  const { material, phase, progress } = state;

  if (phase === 'denied') {
    return (
      <div
        role="alert"
        className="rounded-xl border border-mvp-danger bg-mvp-danger-soft p-4 space-y-2"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-mvp-danger-strong">lock</span>
          <p className="text-sm font-bold text-mvp-danger-strong">Akses Unduhan Ditolak</p>
        </div>
        <p className="text-xs text-mvp-body leading-relaxed">
          Akun Anda bukan dosen pengampu kelas ini, sehingga berkas materi tidak dapat diunduh.
        </p>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-3 py-1.5 rounded-lg bg-mvp-card border border-mvp-danger text-mvp-danger-strong text-xs font-semibold transition-colors cursor-pointer"
        >
          Kembali ke Dasbor
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-mvp-success/40 bg-mvp-success-soft p-3 flex items-center gap-3"
      >
        <span className="material-symbols-outlined text-[20px] text-mvp-success-strong">
          check_circle
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-mvp-success-strong">Unduhan selesai</p>
          <p className="text-[11px] text-mvp-body truncate">{material.name}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Tutup status unduhan"
          className="p-1 rounded text-mvp-body hover:text-mvp-ink hover:bg-mvp-card transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-mvp-line bg-mvp-card p-3 space-y-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="material-symbols-outlined text-[18px] text-mvp-primary-strong animate-pulse">
          shield
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-mvp-ink truncate">
            {phase === 'verifying' ? 'Memverifikasi sesi…' : `Mengunduh… ${progress}%`}
          </p>
          <p className="text-[11px] text-mvp-muted truncate" title="Berkas terproteksi — diverifikasi melalui sesi Anda">
            {material.name} • Berkas terproteksi
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Batalkan unduhan"
          className="p-1 rounded text-mvp-muted hover:text-mvp-danger-strong transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
      <div
        className="w-full h-1.5 rounded-full bg-mvp-line overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Progres unduh berkas"
      >
        <div
          className="h-full bg-mvp-primary rounded-full transition-all duration-200"
          style={{ width: `${phase === 'verifying' ? 5 : progress}%` }}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {phase === 'verifying' ? 'Memverifikasi sesi unduhan' : `Progres unduh ${progress} persen`}
      </p>
    </div>
  );
}

/**
 * UploadMaterialModal — Layar 5 (DESIGN_INSTRUCTIONS_MVP2_UIUX.md §5.2).
 *
 * Merender enam state validasi berkas secara eksplisit:
 *   idle (default), drag-over, error-type, error-size, uploading, ready (success).
 * Dropzone bisa difokus keyboard dan seluruh pesan galat memakai role="alert"
 * dengan ikon, bukan hanya warna.
 */
function UploadMaterialModal({ meeting, course, onClose, onUploaded }) {
  const titleId = `upload-material-title-${meeting.id}`;
  const fileInputRef = useRef(null);
  const uploadTimeoutRef = useRef(null);
  const uploadIntervalRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null); // 'type' | 'size'
  const [phase, setPhase] = useState('idle'); // idle | uploading | ready
  const [progress, setProgress] = useState(0);

  // Bersihkan timer bila modal ditutup di tengah proses unggah.
  useEffect(() => {
    return () => {
      clearTimeout(uploadTimeoutRef.current);
      clearInterval(uploadIntervalRef.current);
    };
  }, []);

  const resetFile = () => {
    clearTimeout(uploadTimeoutRef.current);
    clearInterval(uploadIntervalRef.current);
    uploadTimeoutRef.current = null;
    uploadIntervalRef.current = null;
    setFile(null);
    setError(null);
    setPhase('idle');
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateAndStage = (candidate) => {
    clearTimeout(uploadTimeoutRef.current);
    clearInterval(uploadIntervalRef.current);
    setFile(candidate);
    setProgress(0);

    const extension = `.${candidate.name.split('.').pop().toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError('type');
      setPhase('idle');
      return;
    }
    if (candidate.size > MAX_UPLOAD_BYTES) {
      setError('size');
      setPhase('idle');
      return;
    }

    setError(null);
    setPhase('uploading');

    let current = 0;
    uploadIntervalRef.current = setInterval(() => {
      current = Math.min(100, current + 20);
      setProgress(current);
      if (current >= 100) {
        clearInterval(uploadIntervalRef.current);
        uploadIntervalRef.current = null;
        uploadTimeoutRef.current = setTimeout(() => setPhase('ready'), 220);
      }
    }, 160);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const candidate = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (candidate) validateAndStage(candidate);
  };

  const handleFileSelect = (event) => {
    const candidate = event.target.files && event.target.files[0];
    if (candidate) validateAndStage(candidate);
  };

  const handleOpenPicker = () => {
    if (phase === 'uploading') return;
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const canSubmit = phase === 'ready' && title.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onUploaded(meeting.id, {
      id: `${meeting.id}-m${Date.now()}`,
      name: title.trim(),
      size: formatBytes(file.size),
      type: file.name.split('.').pop().toLowerCase(),
    });
  };

  const dropzoneTone = error
    ? 'border-mvp-danger bg-mvp-danger-soft'
    : dragActive
      ? 'border-mvp-primary bg-mvp-primary-soft'
      : 'border-mvp-line bg-mvp-page hover:border-mvp-primary/60 hover:bg-mvp-subtle';

  return (
    <div className="fixed inset-0 z-[9999] bg-overlay backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-mvp-card rounded-2xl max-w-2xl w-full p-6 border border-mvp-line shadow-2xl text-mvp-ink my-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id={titleId} className="text-lg font-bold text-mvp-ink">
              Unggah Materi Baru
            </h3>
            <p className="text-xs text-mvp-muted mt-0.5">
              Pertemuan {meeting.number} • {course.name} ({course.classGroup})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog unggah materi"
            className="p-1 rounded text-mvp-muted hover:text-mvp-ink hover:bg-mvp-subtle transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <label
              htmlFor="upload-material-title"
              className="block text-[11px] uppercase font-bold text-mvp-muted mb-1"
            >
              Judul Materi <span className="text-mvp-danger-ink">*</span>
            </label>
            <input
              id="upload-material-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Contoh: Modul 3 — Analisis Kebutuhan Sistem"
              className="w-full bg-mvp-page text-mvp-ink p-2.5 rounded-lg border border-mvp-line focus:outline-none focus:ring-2 focus:ring-mvp-primary/50 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="upload-material-desc"
              className="block text-[11px] uppercase font-bold text-mvp-muted mb-1"
            >
              Deskripsi Materi <span className="text-mvp-muted font-medium normal-case">(opsional)</span>
            </label>
            <textarea
              id="upload-material-desc"
              rows={2}
              maxLength={300}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Keterangan singkat isi berkas…"
              className="w-full bg-mvp-page text-mvp-ink p-2.5 rounded-lg border border-mvp-line focus:outline-none focus:ring-2 focus:ring-mvp-primary/50 text-sm resize-none"
            />
            <p className="text-[11px] text-mvp-muted text-right mt-1">{description.length} / 300</p>
          </div>

          {/* DROPZONE — 6 state validasi */}
          <div
            onClick={handleOpenPicker}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleOpenPicker();
              }
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Area unggah berkas, tekan Enter untuk memilih berkas"
            className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-mvp-primary/60 ${dropzoneTone}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />

            {phase === 'idle' && !error && (
              <div className="space-y-2">
                <span className="material-symbols-outlined text-[36px] text-mvp-primary-strong">
                  cloud_upload
                </span>
                <p className="text-sm font-semibold text-mvp-ink">
                  {dragActive
                    ? 'Lepaskan berkas di sini'
                    : 'Tarik & lepas berkas di sini, atau klik untuk memilih'}
                </p>
                <p className="text-xs text-mvp-muted">Maksimal 10MB per berkas</p>
                <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                  {EXTENSION_BADGES.map((ext) => (
                    <span
                      key={ext}
                      className="px-2 py-0.5 rounded bg-mvp-subtle text-mvp-body text-[11px] font-mono font-semibold"
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error === 'type' && (
              <div role="alert" className="space-y-2">
                <span className="material-symbols-outlined text-[32px] text-mvp-danger-strong">
                  error
                </span>
                <p className="text-sm font-bold text-mvp-danger-strong">Format Berkas Tidak Didukung</p>
                <p className="text-xs text-mvp-body leading-relaxed">
                  Format berkas tidak didukung. Harap unggah file berformat .pdf, .docx, .xlsx, atau
                  .zip.
                </p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    resetFile();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-mvp-card border border-mvp-line text-mvp-body text-xs font-semibold transition-colors cursor-pointer"
                >
                  Pilih Berkas Lain
                </button>
              </div>
            )}

            {error === 'size' && (
              <div role="alert" className="space-y-2">
                <span className="material-symbols-outlined text-[32px] text-mvp-danger-strong">
                  file_upload_off
                </span>
                <p className="text-sm font-bold text-mvp-danger-strong">Ukuran Berkas Melebihi Batas</p>
                <p className="text-xs text-mvp-body leading-relaxed">
                  Ukuran berkas melebihi batas maksimal yang diizinkan (maks. 10MB).
                </p>
                <p className="text-xs font-mono text-mvp-danger-strong">
                  {formatBytes(file ? file.size : 0)} / 10 MB
                </p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    resetFile();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-mvp-card border border-mvp-line text-mvp-body text-xs font-semibold transition-colors cursor-pointer"
                >
                  Pilih Berkas Lain
                </button>
              </div>
            )}

            {phase === 'uploading' && file && (
              <div className="space-y-2">
                <span className="material-symbols-outlined text-[32px] text-mvp-primary-strong">
                  cloud_upload
                </span>
                <p className="text-sm font-semibold text-mvp-ink">Mengunggah berkas…</p>
                <div className="max-w-sm mx-auto text-left">
                  <div className="flex items-center justify-between text-[11px] text-mvp-body mb-1">
                    <span className="font-mono truncate">{file.name}</span>
                    <span className="font-bold text-mvp-primary-strong">{progress}%</span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full bg-mvp-line overflow-hidden"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                    aria-label="Progres unggah berkas"
                  >
                    <div
                      className="h-full bg-mvp-primary rounded-full transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-mvp-muted mt-1">{formatBytes(file.size)}</p>
                </div>
                <p className="sr-only" aria-live="polite">
                  Progres unggah {progress} persen
                </p>
              </div>
            )}

            {phase === 'ready' && file && (
              <div className="space-y-2" role="status" aria-live="polite">
                <span className="material-symbols-outlined text-[32px] text-mvp-success-strong">
                  check_circle
                </span>
                <p className="text-sm font-bold text-mvp-success-strong">
                  Berkas siap diunggah ({formatBytes(file.size)})
                </p>
                <p className="text-xs text-mvp-body font-mono truncate">{file.name}</p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    resetFile();
                  }}
                  className="text-xs font-semibold text-mvp-primary-strong underline cursor-pointer"
                >
                  Ganti Berkas
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-5 mt-5 border-t border-mvp-line">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-mvp-subtle hover:bg-mvp-line text-mvp-body text-sm font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-4 py-2 rounded-lg text-white text-sm font-bold shadow-md transition-colors flex items-center gap-1.5 ${
              canSubmit
                ? 'bg-mvp-primary hover:bg-mvp-primary-hover cursor-pointer'
                : 'bg-mvp-muted opacity-60 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">upload</span>
            <span>Unggah Materi</span>
          </button>
        </div>
      </div>
    </div>
  );
}