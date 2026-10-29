import React, { useState, useMemo, useEffect, useRef } from 'react';
import AppShell from '../../components/AppShell';

// Data Rombel Kelas Awal
const INITIAL_CLASSES = [
  {
    id: 'TI-A-RPL',
    name: 'TI-A • Rekayasa Perangkat Lunak',
    lecturer: 'Dr. Awan Rosi, M.Kom.',
    sks: 3,
    semester: 'Semester Ganjil 2026/2027',
    type: 'Reguler Pagi',
    code: 'TIF-301',
    schedule: 'Senin, 08:00 - 10:30 WIB',
    room: 'Lab Komputasi 3 (Gedung B Lt. 3)',
    maxCapacity: 40,
    enrolledInitial: [
      { nim: '24670001', name: 'Dimas Arya Pratama', email: 'dimas.arya@upgris.ac.id', prodi: 'S1 TI (2024)', time: '10 Okt 2026, 09:15', by: 'Oleh Admin Utama', tagType: 'admin' },
      { nim: '24670002', name: 'Ahmad Fauzi', email: 'ahmad.fauzi@upgris.ac.id', prodi: 'S1 TI (2024)', time: '10 Okt 2026, 09:15', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670008', name: 'Siti Nurhaliza', email: 'siti.nur@upgris.ac.id', prodi: 'S1 TI (2024)', time: '11 Okt 2026, 14:20', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670014', name: 'Bagas Saputra', email: 'bagas.s@upgris.ac.id', prodi: 'S1 TI (2024)', time: '11 Okt 2026, 14:22', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670019', name: 'Kevin Sanjaya', email: 'kevin.s@upgris.ac.id', prodi: 'S1 SI (2023 - Ulang)', time: '12 Okt 2026, 10:05', by: 'Oleh Admin Utama', tagType: 'admin' },
      { nim: '24670025', name: 'Rina Wulandari', email: 'rina.w@upgris.ac.id', prodi: 'S1 SI (2024)', time: '12 Okt 2026, 10:07', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670003', name: 'Alif Kurniawan', email: 'alif.k@upgris.ac.id', prodi: 'S1 TI (2024)', time: '10 Okt 2026, 09:20', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670004', name: 'Bima Satria', email: 'bima.s@upgris.ac.id', prodi: 'S1 TI (2024)', time: '10 Okt 2026, 09:20', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670005', name: 'Cynthia Dewi', email: 'cynthia.d@upgris.ac.id', prodi: 'S1 TI (2024)', time: '10 Okt 2026, 09:22', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670006', name: 'Danang Prasetyo', email: 'danang.p@upgris.ac.id', prodi: 'S1 TI (2024)', time: '10 Okt 2026, 09:25', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670007', name: 'Eka Wijaya', email: 'eka.w@upgris.ac.id', prodi: 'S1 TI (2024)', time: '11 Okt 2026, 10:10', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670009', name: 'Fandi Achmad', email: 'fandi.a@upgris.ac.id', prodi: 'S1 TI (2024)', time: '11 Okt 2026, 14:25', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670010', name: 'Gilang Ramadhan', email: 'gilang.r@upgris.ac.id', prodi: 'S1 TI (2024)', time: '11 Okt 2026, 14:30', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670011', name: 'Hafiz Baihaqi', email: 'hafiz.b@upgris.ac.id', prodi: 'S1 TI (2024)', time: '11 Okt 2026, 14:32', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670012', name: 'Indah Puspita', email: 'indah.p@upgris.ac.id', prodi: 'S1 TI (2024)', time: '11 Okt 2026, 14:35', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670013', name: 'Joko Susilo', email: 'joko.s@upgris.ac.id', prodi: 'S1 TI (2024)', time: '11 Okt 2026, 14:40', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670015', name: 'Kurnia Mega', email: 'kurnia.m@upgris.ac.id', prodi: 'S1 TI (2024)', time: '11 Okt 2026, 15:00', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670016', name: 'Lukman Hakim', email: 'lukman.h@upgris.ac.id', prodi: 'S1 TI (2024)', time: '11 Okt 2026, 15:05', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670017', name: 'Mega Utami', email: 'mega.u@upgris.ac.id', prodi: 'S1 TI (2024)', time: '11 Okt 2026, 15:10', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670018', name: 'Naufal Farhan', email: 'naufal.f@upgris.ac.id', prodi: 'S1 TI (2024)', time: '11 Okt 2026, 15:15', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670020', name: 'Oki Setiawan', email: 'oki.s@upgris.ac.id', prodi: 'S1 TI (2024)', time: '12 Okt 2026, 10:10', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670021', name: 'Panji Gumilang', email: 'panji.g@upgris.ac.id', prodi: 'S1 TI (2024)', time: '12 Okt 2026, 10:15', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670022', name: 'Qonita Az-Zahra', email: 'qonita.a@upgris.ac.id', prodi: 'S1 TI (2024)', time: '12 Okt 2026, 10:20', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670023', name: 'Raditya Dika', email: 'raditya.d@upgris.ac.id', prodi: 'S1 TI (2024)', time: '12 Okt 2026, 10:25', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670024', name: 'Salma Salsabila', email: 'salma.s@upgris.ac.id', prodi: 'S1 TI (2024)', time: '12 Okt 2026, 10:30', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670026', name: 'Taufik Hidayat', email: 'taufik.h@upgris.ac.id', prodi: 'S1 TI (2024)', time: '12 Okt 2026, 11:00', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670027', name: 'Umar Bakri', email: 'umar.b@upgris.ac.id', prodi: 'S1 TI (2024)', time: '12 Okt 2026, 11:15', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670028', name: 'Vina Panduwinata', email: 'vina.p@upgris.ac.id', prodi: 'S1 TI (2024)', time: '12 Okt 2026, 11:30', by: 'Auto BR-002', tagType: 'system' }
    ]
  },
  {
    id: 'TI-B-RPL',
    name: 'TI-B • Rekayasa Perangkat Lunak',
    lecturer: 'Dr. Awan Rosi, M.Kom.',
    sks: 3,
    semester: 'Semester Ganjil 2026/2027',
    type: 'Reguler Siang',
    code: 'TIF-301',
    schedule: 'Rabu, 10:30 - 13:00 WIB',
    room: 'Ruang Teori 402 (Gedung Utama Lt. 4)',
    maxCapacity: 40,
    enrolledInitial: [
      { nim: '24670060', name: 'Wawan Hermawan', email: 'wawan.h@upgris.ac.id', prodi: 'S1 TI (2024)', time: '12 Okt 2026, 08:00', by: 'Auto BR-002', tagType: 'system' },
      { nim: '24670061', name: 'Yulia Safitri', email: 'yulia.s@upgris.ac.id', prodi: 'S1 TI (2024)', time: '12 Okt 2026, 08:15', by: 'Auto BR-002', tagType: 'system' }
    ]
  },
  {
    id: 'TI-A-BD',
    name: 'TI-A • Basis Data Terdistribusi',
    lecturer: 'M. Nur Arifin, M.T.',
    sks: 3,
    semester: 'Semester Ganjil 2026/2027',
    type: 'Reguler Pagi',
    code: 'TIF-204',
    schedule: 'Selasa, 08:00 - 10:30 WIB',
    room: 'Lab Database (Gedung B Lt. 2)',
    maxCapacity: 35,
    enrolledInitial: [
      { nim: '24670001', name: 'Dimas Arya Pratama', email: 'dimas.arya@upgris.ac.id', prodi: 'S1 TI (2024)', time: '09 Okt 2026, 10:00', by: 'Auto BR-002', tagType: 'system' }
    ]
  }
];

// Data Mahasiswa Eligible Awal
const INITIAL_AVAILABLE = [
  { id: '24670031', nim: '24670031', name: 'Putri Ayu Lestari', city: 'Semarang, Jawa Tengah', email: 'putri.ayu@upgris.ac.id', prodi: 'S1 TI', year: '2024', status: 'Aktif' },
  { id: '24670032', nim: '24670032', name: 'Rizky Pratama', city: 'Kudus, Jawa Tengah', email: 'rizky.p@upgris.ac.id', prodi: 'S1 TI', year: '2024', status: 'Aktif' },
  { id: '24670035', nim: '24670035', name: 'Anisa Rahmawati', city: 'Demak, Jawa Tengah', email: 'anisa.r@upgris.ac.id', prodi: 'S1 TI', year: '2024', status: 'Aktif' },
  { id: '24670040', nim: '24670040', name: 'Dwi Cahyo Nugroho', city: 'Kendal, Jawa Tengah', email: 'dwi.cahyo@upgris.ac.id', prodi: 'S1 TI', year: '2024', status: 'Aktif' },
  { id: '24670044', nim: '24670044', name: 'Maya Indah Permata', city: 'Pati, Jawa Tengah', email: 'maya.indah@upgris.ac.id', prodi: 'S1 TI', year: '2024', status: 'Aktif' },
  { id: '24670051', nim: '24670051', name: 'Fajar Ramadhan', city: 'Salatiga, Jawa Tengah', email: 'fajar.r@upgris.ac.id', prodi: 'S1 TI', year: '2024', status: 'Aktif' },
  { id: '24670058', nim: '24670058', name: 'Nadia Eka Putri', city: 'Batang, Jawa Tengah', email: 'nadia.eka@upgris.ac.id', prodi: 'S1 TI', year: '2024', status: 'Aktif' },
  { id: '24670062', nim: '24670062', name: 'Hendra Gunawan', city: 'Pekalongan, Jawa Tengah', email: 'hendra.g@upgris.ac.id', prodi: 'S1 TI', year: '2024', status: 'Aktif' },
  { id: '24670063', nim: '24670063', name: 'Tasya Kamila', city: 'Semarang, Jawa Tengah', email: 'tasya.k@upgris.ac.id', prodi: 'S1 TI', year: '2024', status: 'Aktif' },
  { id: '24670064', nim: '24670064', name: 'Yoga Pratama', city: 'Ungaran, Jawa Tengah', email: 'yoga.p@upgris.ac.id', prodi: 'S1 TI', year: '2024', status: 'Aktif' },
  { id: '23670012', nim: '23670012', name: 'Bayu Tri Laksono', city: 'Solo, Jawa Tengah', email: 'bayu.tri@upgris.ac.id', prodi: 'S1 TI', year: '2023', status: 'Aktif' },
  { id: '23670015', nim: '23670015', name: 'Cahya Ramadhani', city: 'Boyolali, Jawa Tengah', email: 'cahya.r@upgris.ac.id', prodi: 'S1 TI', year: '2023', status: 'Aktif' }
];

// Data Audit Log Sinkronisasi
const INITIAL_AUDIT_LOGS = [
  { id: 'LOG-8821', time: '29 Okt 2026, 08:15 WIB', actor: 'Auto BR-002', event: 'Sinkronisasi Rombel Otomatis TI-A Rekayasa Perangkat Lunak', affected: '24 Mahasiswa', status: 'Berhasil' },
  { id: 'LOG-8819', time: '28 Okt 2026, 14:10 WIB', actor: 'Admin Utama (Dimas)', event: 'Direct Batch Enrollment via CSV Import', affected: '4 Mahasiswa', status: 'Berhasil' },
  { id: 'LOG-8815', time: '28 Okt 2026, 11:02 WIB', actor: 'Admin Utama (Dimas)', event: 'Pencabutan Kepesertaan (Unenroll) NIM: 24670099', affected: '1 Mahasiswa', status: 'Dikeluarkan' },
  { id: 'LOG-8802', time: '27 Okt 2026, 09:00 WIB', actor: 'Sistem SPADA', event: 'Validasi Kuota Kelas & Jadwal Tanpa Bentrok', affected: '48 Kelas', status: 'Sinkron' }
];

export default function DirectEnrollment({ onRoleChange }) {
  // State Rombel Kelas
  const [selectedClassId, setSelectedClassId] = useState('TI-A-RPL');
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [enrolledMap, setEnrolledMap] = useState({
    'TI-A-RPL': INITIAL_CLASSES[0].enrolledInitial,
    'TI-B-RPL': INITIAL_CLASSES[1].enrolledInitial,
    'TI-A-BD': INITIAL_CLASSES[2].enrolledInitial,
  });

  // State Mahasiswa Tersedia & Pilihan Checkbox
  const [availableStudents, setAvailableStudents] = useState(INITIAL_AVAILABLE);
  const [selectedIds, setSelectedIds] = useState([
    '24670031',
    '24670032',
    '24670035',
    '24670040',
    '24670044'
  ]);

  // Filter & Search
  const [enrolledSearch, setEnrolledSearch] = useState('');
  const [enrolledFilterYear, setEnrolledFilterYear] = useState('ALL');
  const [enrolledPage, setEnrolledPage] = useState(1);
  const enrolledPageSize = 6;

  const [availableSearch, setAvailableSearch] = useState('');
  const [filterProdi, setFilterProdi] = useState('S1 TI');
  const [filterYear, setFilterYear] = useState('2024');
  const [filterStatus, setFilterStatus] = useState('Aktif');

  // Modals
  const [unenrollModalStudent, setUnenrollModalStudent] = useState(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const classDropdownRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (classDropdownRef.current && !classDropdownRef.current.contains(e.target)) {
        setClassDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const currentClass = useMemo(() => {
    return INITIAL_CLASSES.find((c) => c.id === selectedClassId) || INITIAL_CLASSES[0];
  }, [selectedClassId]);

  const currentEnrolled = useMemo(() => {
    return enrolledMap[selectedClassId] || [];
  }, [enrolledMap, selectedClassId]);

  const totalEnrolled = currentEnrolled.length;
  const maxCapacity = currentClass.maxCapacity;
  const availableSeats = Math.max(0, maxCapacity - totalEnrolled);
  const capacityPct = Math.min(100, Math.round((totalEnrolled / maxCapacity) * 100));

  // Filter Mahasiswa Terdaftar
  const filteredEnrolled = useMemo(() => {
    return currentEnrolled.filter((st) => {
      const matchSearch =
        st.name.toLowerCase().includes(enrolledSearch.toLowerCase()) ||
        st.nim.includes(enrolledSearch);
      const matchYear =
        enrolledFilterYear === 'ALL' ||
        (enrolledFilterYear === '2024' && st.prodi.includes('2024')) ||
        (enrolledFilterYear === '2023' && st.prodi.includes('2023'));
      return matchSearch && matchYear;
    });
  }, [currentEnrolled, enrolledSearch, enrolledFilterYear]);

  const totalEnrolledPages = Math.ceil(filteredEnrolled.length / enrolledPageSize) || 1;
  const pagedEnrolled = useMemo(() => {
    const start = (enrolledPage - 1) * enrolledPageSize;
    return filteredEnrolled.slice(start, start + enrolledPageSize);
  }, [filteredEnrolled, enrolledPage, enrolledPageSize]);

  useEffect(() => {
    setEnrolledPage(1);
  }, [enrolledSearch, enrolledFilterYear, selectedClassId]);

  // Filter Mahasiswa Tersedia
  const filteredAvailable = useMemo(() => {
    return availableStudents.filter((st) => {
      const matchSearch =
        st.name.toLowerCase().includes(availableSearch.toLowerCase()) ||
        st.nim.includes(availableSearch) ||
        st.city.toLowerCase().includes(availableSearch.toLowerCase());
      const matchProdi = !filterProdi || st.prodi === filterProdi;
      const matchYear = !filterYear || st.year === filterYear;
      const matchStatus = !filterStatus || st.status === filterStatus;
      return matchSearch && matchProdi && matchYear && matchStatus;
    });
  }, [availableStudents, availableSearch, filterProdi, filterYear, filterStatus]);

  const isAllSelected = useMemo(() => {
    if (filteredAvailable.length === 0) return false;
    return filteredAvailable.every((st) => selectedIds.includes(st.id));
  }, [filteredAvailable, selectedIds]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const visibleIds = new Set(filteredAvailable.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const newSet = new Set(selectedIds);
      filteredAvailable.forEach((s) => newSet.add(s.id));
      setSelectedIds(Array.from(newSet));
    }
  };

  const handleToggleSelectStudent = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Batch Enroll
  const handleBatchEnroll = () => {
    if (selectedIds.length === 0) {
      showToast('Pilih mahasiswa yang ingin didaftarkan terlebih dahulu.');
      return;
    }
    if (selectedIds.length > availableSeats) {
      showToast(`Kapasitas rombel tidak mencukupi! Sisa ${availableSeats} kursi, terpilih ${selectedIds.length}.`);
      return;
    }

    const enrolledNow = availableStudents.filter((st) => selectedIds.includes(st.id));
    const formattedEnrolled = enrolledNow.map((st) => ({
      nim: st.nim,
      name: st.name,
      email: st.email,
      prodi: `${st.prodi} (${st.year})`,
      time: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
            new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      by: 'Oleh Admin (Direct Enroll)',
      tagType: 'admin'
    }));

    setEnrolledMap((prev) => ({
      ...prev,
      [selectedClassId]: [...formattedEnrolled, ...(prev[selectedClassId] || [])]
    }));

    setAvailableStudents((prev) => prev.filter((st) => !selectedIds.includes(st.id)));
    const count = selectedIds.length;
    setSelectedIds([]);
    showToast(`Sukses: ${count} mahasiswa berhasil didaftarkan langsung ke ${currentClass.name}!`);
  };

  // Unenroll
  const handleConfirmUnenroll = () => {
    if (!unenrollModalStudent) return;
    const targetNim = unenrollModalStudent.nim;
    const targetStudent = currentEnrolled.find((s) => s.nim === targetNim);

    setEnrolledMap((prev) => ({
      ...prev,
      [selectedClassId]: (prev[selectedClassId] || []).filter((s) => s.nim !== targetNim)
    }));

    if (targetStudent) {
      setAvailableStudents((prev) => {
        if (prev.some((s) => s.nim === targetNim)) return prev;
        return [
          {
            id: targetNim,
            nim: targetNim,
            name: targetStudent.name,
            city: 'Civitas SPADA UPGRIS',
            email: targetStudent.email,
            prodi: targetStudent.prodi.includes('SI') ? 'S1 SI' : 'S1 TI',
            year: targetStudent.prodi.includes('2023') ? '2023' : '2024',
            status: 'Aktif'
          },
          ...prev
        ];
      });
    }

    showToast(`Kepesertaan ${unenrollModalStudent.name} (${targetNim}) berhasil dicabut.`);
    setUnenrollModalStudent(null);
  };

  const handleExportXLSX = () => {
    showToast(`Data ${totalEnrolled} mahasiswa rombel ${currentClass.name} berhasil diekspor ke format XLSX.`);
  };

  const handleProcessCsvImport = () => {
    const dummyNewStudents = [
      { nim: '24670088', name: 'Zulfa Azzahra', email: 'zulfa.a@upgris.ac.id', prodi: 'S1 TI (2024)', time: 'Hari ini', by: 'Impor CSV Admin', tagType: 'admin' },
      { nim: '24670089', name: 'Zidane Al-Faris', email: 'zidane.f@upgris.ac.id', prodi: 'S1 TI (2024)', time: 'Hari ini', by: 'Impor CSV Admin', tagType: 'admin' }
    ];

    if (availableSeats < dummyNewStudents.length) {
      showToast(`Gagal: Sisa kuota (${availableSeats}) tidak mencukupi untuk berkas CSV.`);
      return;
    }

    setEnrolledMap((prev) => ({
      ...prev,
      [selectedClassId]: [...dummyNewStudents, ...(prev[selectedClassId] || [])]
    }));

    setShowCsvModal(false);
    setCsvFile(null);
    showToast(`Berhasil: 2 Mahasiswa dari berkas CSV berhasil di-enroll langsung!`);
  };

  return (
    <AppShell
      activeRole="admin"
      onRoleChange={onRoleChange}
      activeNavPath="direct-enrollment"
    >
      {/* Toast Notifikasi Lokal */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm bg-surface-container-highest text-on-surface px-space-md py-space-sm rounded-xl shadow-2xl border border-primary/40 animate-bounce"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-on-surface-variant hover:text-on-surface p-0.5 rounded"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Top Ambient Glow Decorator */}
      <div className="relative w-full">
        <div className="absolute -top-10 left-1/4 w-96 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-6 right-1/3 w-80 h-28 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* BREADCRUMBS & TOP BAR */}
      <div className="flex flex-col gap-space-xs pt-space-md mb-space-lg">
        <nav className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
          <a className="hover:text-primary transition-colors flex items-center gap-1" href="#dasbor-admin">
            <span className="material-symbols-outlined text-[15px]">home</span>
            <span>Beranda</span>
          </a>
          <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
          <span className="text-on-surface-variant">Administrasi SPADA</span>
          <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
          <span className="text-secondary font-semibold">Direct Enrollment Kelas</span>
        </nav>

        {/* Header Title with Institutional Rule Indicator */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mt-space-xs">
          <div>
            <div className="flex items-center gap-space-sm flex-wrap">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                Pusat Direct Enrollment Mahasiswa
              </h1>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                <span>Aturan BR-002 Aktif</span>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl mt-1">
              Berdasarkan <strong className="text-on-surface font-semibold">Business Rule BR-002</strong>: Penempatan mahasiswa ke rombel kelas dikelola terpusat oleh Admin tanpa pengisian dan persetujuan KRS manual.
            </p>
          </div>

          {/* Quick Action Group */}
          <div className="flex items-center gap-space-sm shrink-0">
            <button
              onClick={() => setShowLogModal(true)}
              className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-all shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span>Log Sinkronisasi</span>
            </button>
            <button
              onClick={() => setShowCsvModal(true)}
              className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-md"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              <span>Impor CSV Massal</span>
            </button>
          </div>
        </div>
      </div>

      {/* CLASS SELECTOR & CAPACITY PROGRESS WIDGET */}
      <section className="w-full bg-surface-container rounded-xl p-space-md shadow-lg mb-space-lg border border-outline-variant/10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-center">
          
          {/* Combobox Selector */}
          <div className="xl:col-span-7 flex flex-col gap-space-sm">
            <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">auto_stories</span>
              Pilih Rombongan Belajar (Rombel) Aktif
            </label>

            <div className="relative w-full" ref={classDropdownRef}>
              <button
                type="button"
                onClick={() => setClassDropdownOpen((prev) => !prev)}
                className="flex items-center justify-between w-full p-space-sm rounded-lg bg-surface-container-high hover:bg-surface-bright cursor-pointer transition-colors shadow-sm text-left border border-outline-variant/10"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">developer_board</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-title-md text-title-md text-on-surface font-semibold truncate">
                      {currentClass.name}
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant truncate">
                      Dosen Pengampu: {currentClass.lecturer} • {currentClass.sks} SKS • {currentClass.semester}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs pl-space-sm shrink-0">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-tertiary-container/30 text-tertiary">
                    {currentClass.type}
                  </span>
                  <span
                    className="material-symbols-outlined text-outline text-[20px] transition-transform duration-200"
                    style={{ transform: classDropdownOpen ? 'rotate(180deg)' : 'none' }}
                  >
                    expand_more
                  </span>
                </div>
              </button>

              {classDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-highest rounded-xl shadow-2xl border border-outline-variant/30 z-30 overflow-hidden">
                  <div className="p-2 text-xs font-semibold uppercase tracking-wider text-outline px-3 border-b border-outline-variant/20">
                    Daftar Kelas Semester Ganjil 2026/2027
                  </div>
                  {INITIAL_CLASSES.map((cls) => {
                    const enrolledCount = (enrolledMap[cls.id] || []).length;
                    const isSelected = cls.id === selectedClassId;
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          setSelectedClassId(cls.id);
                          setClassDropdownOpen(false);
                          showToast(`Rombel dialihkan ke: ${cls.name}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                          isSelected
                            ? 'bg-primary-container/20 text-primary font-bold'
                            : 'hover:bg-surface-container-high text-on-surface'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="material-symbols-outlined text-[20px] text-primary">
                            {isSelected ? 'check_circle' : 'class'}
                          </span>
                          <div className="flex flex-col truncate">
                            <span className="text-sm font-semibold truncate">{cls.name}</span>
                            <span className="text-xs text-on-surface-variant">
                              {cls.lecturer} • {cls.code} • {cls.schedule}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-surface-container text-secondary font-mono">
                          {enrolledCount}/{cls.maxCapacity} mhs
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Secondary Info Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-container-lowest text-on-surface-variant font-caption text-caption font-medium border border-outline-variant/10">
                <span className="material-symbols-outlined text-[15px] text-secondary">tag</span>
                Kode: <span className="text-on-surface font-semibold">{currentClass.code}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-container-lowest text-on-surface-variant font-caption text-caption font-medium border border-outline-variant/10">
                <span className="material-symbols-outlined text-[15px] text-primary">schedule</span>
                Jadwal: <span className="text-on-surface font-semibold">{currentClass.schedule}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-container-lowest text-on-surface-variant font-caption text-caption font-medium border border-outline-variant/10">
                <span className="material-symbols-outlined text-[15px] text-tertiary">meeting_room</span>
                Ruang: <span className="text-on-surface font-semibold">{currentClass.room}</span>
              </span>
            </div>
          </div>

          {/* Capacity Progress Widget */}
          <div className="xl:col-span-5 bg-surface-container-lowest/80 rounded-xl p-space-md flex flex-col justify-between shadow-inner border border-outline-variant/10">
            <div className="flex items-start justify-between mb-2">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Kapasitas Rombel Kelas
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">
                    {totalEnrolled}
                  </span>
                  <span className="font-title-md text-title-md text-outline">
                    / {maxCapacity} Mahasiswa
                  </span>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                    capacityPct >= 100
                      ? 'bg-error-container text-error'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {capacityPct}% Terisi
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold ${
                  availableSeats === 0
                    ? 'bg-error-container/20 text-error'
                    : 'bg-tertiary/15 text-tertiary'
                }`}>
                  <span className="material-symbols-outlined text-[14px]">event_seat</span>
                  <span>{availableSeats === 0 ? 'Kelas Penuh' : `Sisa ${availableSeats} Kursi`}</span>
                </span>
              </div>
            </div>

            <div className="w-full h-3 rounded-full bg-surface-container-highest overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-tertiary transition-all duration-500"
                style={{ width: `${capacityPct}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-1.5 rounded-lg bg-surface-container border border-outline-variant/10">
                <span className="block font-caption text-caption text-outline">Kuota Maks.</span>
                <span className="block font-title-md text-title-md text-on-surface font-semibold">{maxCapacity}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-surface-container border border-outline-variant/10">
                <span className="block font-caption text-caption text-primary">Terisi</span>
                <span className="block font-title-md text-title-md text-primary font-bold">{totalEnrolled}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-surface-container border border-outline-variant/10">
                <span className="block font-caption text-caption text-tertiary">Tersedia</span>
                <span className="block font-title-md text-title-md text-tertiary font-bold">{availableSeats} Kursi</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* TWO-COLUMN DIRECT ENROLLMENT WORKBENCH (50/50 SPLIT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-stretch">
        
        {/* LEFT PANEL: MAHASISWA TERDAFTAR */}
        <div className="bg-surface-container-lowest rounded-xl shadow-xl flex flex-col h-full overflow-hidden border border-outline-variant/15">
          <div className="p-space-md bg-surface-container flex items-center justify-between gap-space-sm border-b border-outline-variant/15">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Mahasiswa Terdaftar</h2>
                  <span className="px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-primary/20 text-primary font-bold">
                    {filteredEnrolled.length} Mahasiswa
                  </span>
                </div>
                <p className="font-caption text-caption text-on-surface-variant">
                  Tercatat memiliki akses otomatis ke LMS kelas ini
                </p>
              </div>
            </div>

            <button
              onClick={handleExportXLSX}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm font-semibold transition-all shadow-sm active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Ekspor XLSX</span>
            </button>
          </div>

          <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm border-b border-outline-variant/10">
            <div className="flex-1 relative flex items-center bg-surface-container-lowest rounded-lg px-3 py-2 shadow-inner border border-outline-variant/15">
              <span className="material-symbols-outlined text-outline mr-2 text-[18px]">search</span>
              <input
                value={enrolledSearch}
                onChange={(e) => setEnrolledSearch(e.target.value)}
                className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder-outline focus:outline-none"
                placeholder="Cari nama atau NIM mahasiswa terdaftar..."
                type="text"
              />
              {enrolledSearch && (
                <button
                  type="button"
                  onClick={() => setEnrolledSearch('')}
                  className="text-outline hover:text-on-surface ml-1"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={enrolledFilterYear}
                onChange={(e) => setEnrolledFilterYear(e.target.value)}
                className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm border-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="ALL">Semua Angkatan</option>
                <option value="2024">Angkatan 2024</option>
                <option value="2023">Angkatan 2023</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto min-h-[380px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">NIM</th>
                  <th className="py-3 px-4 font-semibold">Nama Lengkap</th>
                  <th className="py-3 px-4 font-semibold">Program Studi</th>
                  <th className="py-3 px-4 font-semibold">Waktu Terdaftar</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-body-sm text-body-sm text-on-surface">
                {pagedEnrolled.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-outline">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50 block">search_off</span>
                      Tidak ada mahasiswa terdaftar yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  pagedEnrolled.map((st) => (
                    <tr key={st.nim} className="hover:bg-surface-container-low/70 transition-colors group">
                      <td className="py-3 px-4 font-mono text-[13px] text-secondary font-semibold">
                        {st.nim}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-on-surface">{st.name}</div>
                        <div className="font-caption text-caption text-outline">{st.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded font-caption text-caption ${
                          st.prodi.includes('Ulang')
                            ? 'bg-amber-500/20 text-amber-300 font-semibold'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {st.prodi}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-caption text-caption text-on-surface-variant">
                        <div>{st.time}</div>
                        <span className={st.tagType === 'admin' ? 'text-tertiary font-medium' : 'text-outline'}>
                          {st.by}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setUnenrollModalStudent(st)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-error-container/20 text-error hover:bg-error-container hover:text-on-error transition-all font-label-sm text-label-sm font-semibold active:scale-95"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">person_remove</span>
                          <span>Unenroll</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-space-md bg-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-sm font-body-sm text-body-sm border-t border-outline-variant/15">
            <span className="font-caption text-caption text-outline">
              Menampilkan {filteredEnrolled.length === 0 ? 0 : (enrolledPage - 1) * enrolledPageSize + 1}-
              {Math.min(enrolledPage * enrolledPageSize, filteredEnrolled.length)} dari {filteredEnrolled.length} mahasiswa terdaftar
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={enrolledPage === 1}
                onClick={() => setEnrolledPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>

              {Array.from({ length: totalEnrolledPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setEnrolledPage(pageNum)}
                  className={`w-8 h-8 rounded flex items-center justify-center text-caption font-bold transition-all ${
                    enrolledPage === pageNum
                      ? 'bg-primary-container text-on-primary-container shadow'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-bright'
                  }`}
                  type="button"
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={enrolledPage === totalEnrolledPages}
                onClick={() => setEnrolledPage((p) => Math.min(totalEnrolledPages, p + 1))}
                className="w-8 h-8 rounded flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: MAHASISWA TERSEDIA (ELIGIBLE) */}
        <div className="bg-surface-container-lowest rounded-xl shadow-xl flex flex-col h-full overflow-hidden border border-outline-variant/15">
          <div className="p-space-md bg-surface-container flex items-center justify-between gap-space-sm border-b border-outline-variant/15">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
              </div>
              <div>
                <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Daftar Mahasiswa Tersedia</h2>
                <p className="font-caption text-caption text-on-surface-variant">Civitas akademika belum terdaftar di rombel ini</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              {availableStudents.length} Mahasiswa Memenuhi Syarat
            </span>
          </div>

          <div className="p-space-md bg-surface-container-low flex flex-col gap-space-xs border-b border-outline-variant/10">
            <div className="relative flex items-center bg-surface-container-lowest rounded-lg px-3 py-2 shadow-inner border border-outline-variant/15">
              <span className="material-symbols-outlined text-outline mr-2 text-[18px]">search</span>
              <input
                value={availableSearch}
                onChange={(e) => setAvailableSearch(e.target.value)}
                className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder-outline focus:outline-none"
                placeholder="Cari NIM, Nama Mahasiswa, atau Kota..."
                type="text"
              />
              {availableSearch && (
                <button
                  type="button"
                  onClick={() => setAvailableSearch('')}
                  className="text-outline hover:text-on-surface ml-1"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1 font-caption text-caption">
              {filterProdi ? (
                <span
                  onClick={() => setFilterProdi(filterProdi === 'S1 TI' ? 'S1 SI' : null)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface font-medium cursor-pointer hover:bg-surface-bright transition-colors"
                >
                  <span>Prodi: <strong>{filterProdi}</strong></span>
                  <span className="material-symbols-outlined text-[14px] text-outline">autorenew</span>
                </span>
              ) : (
                <span
                  onClick={() => setFilterProdi('S1 TI')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container text-outline cursor-pointer hover:text-on-surface"
                >
                  + Filter Prodi
                </span>
              )}

              {filterYear ? (
                <span
                  onClick={() => setFilterYear(filterYear === '2024' ? '2023' : null)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface font-medium cursor-pointer hover:bg-surface-bright transition-colors"
                >
                  <span>Angkatan: <strong>{filterYear}</strong></span>
                  <span className="material-symbols-outlined text-[14px] text-outline">autorenew</span>
                </span>
              ) : (
                <span
                  onClick={() => setFilterYear('2024')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container text-outline cursor-pointer hover:text-on-surface"
                >
                  + Filter Angkatan
                </span>
              )}

              <span
                onClick={() => setFilterStatus(filterStatus ? null : 'Aktif')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                  filterStatus
                    ? 'bg-tertiary-container/20 text-tertiary'
                    : 'bg-surface-container text-outline'
                }`}
              >
                <span>Status: <strong>{filterStatus || 'Semua'}</strong></span>
                {filterStatus && <span className="material-symbols-outlined text-[14px]">check</span>}
              </span>

              <button
                onClick={() => {
                  setFilterProdi('S1 TI');
                  setFilterYear('2024');
                  setFilterStatus('Aktif');
                  setAvailableSearch('');
                  showToast('Filter direset ke standar');
                }}
                className="ml-auto text-primary hover:underline font-label-sm text-label-sm"
                type="button"
              >
                Reset Filter
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto min-h-[380px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      aria-label="Pilih Semua Mahasiswa"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded bg-surface-container text-primary-container focus:ring-0 focus:ring-offset-0 cursor-pointer accent-primary"
                      type="checkbox"
                    />
                  </th>
                  <th className="py-3 px-3 font-semibold">NIM</th>
                  <th className="py-3 px-4 font-semibold">Nama Lengkap</th>
                  <th className="py-3 px-3 font-semibold">Prodi</th>
                  <th className="py-3 px-3 font-semibold">Angkatan</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-body-sm text-body-sm text-on-surface">
                {filteredAvailable.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-outline">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50 block">group_off</span>
                      Tidak ada mahasiswa yang memenuhi kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredAvailable.map((st) => {
                    const isChecked = selectedIds.includes(st.id);
                    return (
                      <tr
                        key={st.id}
                        onClick={() => handleToggleSelectStudent(st.id)}
                        className={`cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-primary-container/10 hover:bg-primary-container/15'
                            : 'hover:bg-surface-container-low/70'
                        }`}
                      >
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            checked={isChecked}
                            onChange={() => handleToggleSelectStudent(st.id)}
                            className="w-4 h-4 rounded bg-surface-container text-primary-container focus:ring-0 focus:ring-offset-0 cursor-pointer accent-primary"
                            type="checkbox"
                          />
                        </td>
                        <td className={`py-3 px-3 font-mono text-[13px] ${isChecked ? 'text-primary font-bold' : 'text-outline'}`}>
                          {st.nim}
                        </td>
                        <td className="py-3 px-4">
                          <div className={isChecked ? 'font-semibold text-on-surface' : 'font-medium text-on-surface'}>
                            {st.name}
                          </div>
                          <div className="font-caption text-caption text-outline">{st.city}</div>
                        </td>
                        <td className="py-3 px-3 text-on-surface-variant">{st.prodi}</td>
                        <td className={`py-3 px-3 ${isChecked ? 'font-semibold' : 'text-on-surface-variant'}`}>{st.year}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-tertiary/20 text-tertiary">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> Aktif (Eligible)
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-space-md bg-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-2xl border-t border-outline-variant/15">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-title-md text-title-md font-bold text-secondary">
                  Terpilih: {selectedIds.length} Mahasiswa
                </span>
                {selectedIds.length > availableSeats ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-error/20 text-error">
                    Melebihi Kuota!
                  </span>
                ) : selectedIds.length > 0 ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-tertiary/20 text-tertiary">
                    Kapasitas Aman
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container-high text-outline">
                    Belum Dipilih
                  </span>
                )}
              </div>

              <span className="font-caption text-caption text-on-surface-variant">
                {selectedIds.length > availableSeats ? (
                  <span className="text-error font-medium">
                    Peringatan: Jumlah terpilih ({selectedIds.length}) melebihi sisa kursi ({availableSeats})!
                  </span>
                ) : (
                  <>
                    Sisa kuota setelah enroll: <strong className="text-on-surface font-semibold">{Math.max(0, availableSeats - selectedIds.length)} kursi</strong> ({selectedIds.length} dipilih ≤ {availableSeats} sisa).
                  </>
                )}
              </span>
            </div>

            <button
              disabled={selectedIds.length === 0 || selectedIds.length > availableSeats}
              onClick={handleBatchEnroll}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
              <span>+ Daftarkan Terpilih (Batch Enroll)</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL: UNENROLL CONFIRMATION */}
      {unenrollModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dim/80 backdrop-blur-md p-space-md">
          <div className="w-full max-w-lg bg-surface-container rounded-xl shadow-2xl overflow-hidden border border-outline-variant/30">
            <div className="p-space-md bg-surface-container-high flex items-start gap-space-sm border-b border-outline-variant/20">
              <div className="w-12 h-12 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-[28px]">warning</span>
              </div>
              <div className="flex-1">
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                  Konfirmasi Pencabutan Kepesertaan
                </h3>
                <span className="font-caption text-caption text-outline">
                  Tindakan Administratif Langsung (Direct LMS Unenroll)
                </span>
              </div>
              <button
                onClick={() => setUnenrollModalStudent(null)}
                className="text-outline hover:text-on-surface p-1 rounded"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="p-space-lg flex flex-col gap-space-md">
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Apakah Anda yakin ingin mencabut kepesertaan mahasiswa{' '}
                <strong className="text-on-surface font-semibold text-primary">
                  {unenrollModalStudent.name}
                </strong>{' '}
                (<span className="font-mono text-secondary">{unenrollModalStudent.nim}</span>) dari rombel:
              </p>

              <div className="p-3 rounded-lg bg-surface-container-low flex items-center gap-3 border border-outline-variant/10">
                <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">class</span>
                </div>
                <div>
                  <div className="font-title-md text-title-md text-on-surface font-bold">
                    {currentClass.name}
                  </div>
                  <div className="font-caption text-caption text-on-surface-variant">
                    Dosen: {currentClass.lecturer} • {currentClass.code}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-error-container/20 text-error flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">info</span>
                <p className="font-caption text-caption text-on-error-container leading-snug">
                  <strong>Dampak Tindakan:</strong> Mahasiswa tidak akan dapat lagi mengakses materi pembelajaran, forum diskusi, penyerahan tugas, kuis, dan presensi online di kelas ini.
                </p>
              </div>
            </div>

            <div className="p-space-md bg-surface-container-high flex items-center justify-end gap-space-sm border-t border-outline-variant/20">
              <button
                onClick={() => setUnenrollModalStudent(null)}
                className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors"
                type="button"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmUnenroll}
                className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-error text-on-error font-label-md text-label-md font-bold hover:brightness-110 active:scale-95 transition-all shadow-md"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">person_remove</span>
                <span>Ya, Cabut Kepesertaan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMPOR CSV MASSAL */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dim/80 backdrop-blur-md p-space-md">
          <div className="w-full max-w-xl bg-surface-container rounded-xl shadow-2xl overflow-hidden border border-outline-variant/30">
            <div className="p-space-md bg-surface-container-high flex items-start justify-between border-b border-outline-variant/20">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">publish</span>
                </div>
                <div>
                  <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Impor CSV Mahasiswa Massal</h3>
                  <span className="font-caption text-caption text-outline">Target Rombel: {currentClass.name}</span>
                </div>
              </div>
              <button
                onClick={() => setShowCsvModal(false)}
                className="text-outline hover:text-on-surface p-1 rounded"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="p-space-lg flex flex-col gap-space-md">
              <div className="p-6 border-2 border-dashed border-outline-variant/40 rounded-xl bg-surface-container-low flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-4xl text-primary mb-2">upload_file</span>
                <span className="font-title-md text-sm font-semibold text-on-surface">Pilih atau Seret Berkas CSV ke Sini</span>
                <span className="font-caption text-xs text-outline mt-1">Maksimal ukuran berkas 5MB (.csv, .xlsx)</span>
                <input
                  type="file"
                  accept=".csv, .xlsx"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="hidden"
                  id="csvInputModal"
                />
                <label
                  htmlFor="csvInputModal"
                  className="mt-3 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs text-on-surface font-semibold cursor-pointer"
                >
                  {csvFile ? `Terpilih: ${csvFile.name}` : 'Pilih dari Komputer'}
                </label>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-lowest text-on-surface-variant font-caption text-xs flex items-start gap-2 border border-outline-variant/15">
                <span className="material-symbols-outlined text-secondary text-base shrink-0">info</span>
                <div>
                  <strong>Format Kolom yang Diperlukan:</strong><br />
                  <code>NIM, Nama_Lengkap, Email, Program_Studi, Angkatan</code>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span>Contoh berkas template impor:</span>
                <button
                  type="button"
                  onClick={() => showToast('Mengunduh template_direct_enrollment.csv...')}
                  className="text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Unduh Template CSV
                </button>
              </div>
            </div>

            <div className="p-space-md bg-surface-container-high flex items-center justify-end gap-space-sm border-t border-outline-variant/20">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface font-label-md text-label-md"
                type="button"
              >
                Batal
              </button>
              <button
                onClick={handleProcessCsvImport}
                className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold hover:brightness-110 active:scale-95 shadow-md"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span>Proses Impor (2 Mahasiswa Mock)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG SINKRONISASI */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dim/80 backdrop-blur-md p-space-md">
          <div className="w-full max-w-2xl bg-surface-container rounded-xl shadow-2xl overflow-hidden border border-outline-variant/30">
            <div className="p-space-md bg-surface-container-high flex items-start justify-between border-b border-outline-variant/20">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">history</span>
                </div>
                <div>
                  <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Log Sinkronisasi & Audit Trail BR-002</h3>
                  <span className="font-caption text-caption text-outline">Rekam jejak otomatisasi pendaftaran terpusat</span>
                </div>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-outline hover:text-on-surface p-1 rounded"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="p-space-md max-h-[420px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-high text-outline uppercase tracking-wider">
                    <th className="py-2.5 px-3">ID Log</th>
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Aktor</th>
                    <th className="py-2.5 px-3">Aktivitas</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high text-on-surface">
                  {INITIAL_AUDIT_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-3 font-mono text-secondary font-semibold">{log.id}</td>
                      <td className="py-3 px-3 text-on-surface-variant whitespace-nowrap">{log.time}</td>
                      <td className="py-3 px-3 font-medium">{log.actor}</td>
                      <td className="py-3 px-3">
                        <div className="font-medium">{log.event}</div>
                        <div className="text-[11px] text-outline">Dampak: {log.affected}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          log.status === 'Berhasil' || log.status === 'Sinkron'
                            ? 'bg-tertiary-container/30 text-tertiary'
                            : 'bg-error-container/30 text-error'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-space-md bg-surface-container-high flex items-center justify-between border-t border-outline-variant/20">
              <span className="font-caption text-caption text-outline">Total 4 entri audit terbaru</span>
              <button
                onClick={() => setShowLogModal(false)}
                className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface font-label-md text-xs font-semibold"
                type="button"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
