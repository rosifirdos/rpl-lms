/**
 * Konstanta akademik E-Learning Kampus
 * Sumber kebenaran tunggal untuk konfigurasi akademik
 * FR-050: Admin dapat mengonfigurasi ambang kehadiran (default 70%)
 */

export const ACADEMIC = {
  // Struktur perkuliahan (BR-004)
  TOTAL_MEETINGS: 16,
  EXAM_MEETINGS: {
    8: 'UTS',   // Pertemuan 8: Ujian Tengah Semester
    16: 'UAS',  // Pertemuan 16: Ujian Akhir Semester
  },

  // Kebijakan kehadiran (FR-050)
  DEFAULT_ATTENDANCE_THRESHOLD: 70, // Persentase kehadiran minimal (%)

    // Generator untuk struktur 16 pertemuan
  generate16Meetings() {
    const meetings = [];
    for (let i = 1; i <= this.TOTAL_MEETINGS; i++) {
      const isExam = !!this.EXAM_MEETINGS[i];
      const examType = this.EXAM_MEETINGS[i] || 'NONE';
      const title = isExam
        ? `Pertemuan ${i}: ${examType === 'UTS' ? 'Evaluasi Tengah Semester (UTS)' : 'Evaluasi Akhir Semester (UAS)'}`
        : `Pertemuan ${i}`;

      meetings.push({
        meeting_number: i,
        title,
        description: isExam
          ? `Ujian ${examType === 'UTS' ? 'Tengah' : 'Akhir'} Semester`
          : `Sesi pembelajaran perkuliahan pertemuan ke-${i}`,
        is_exam: isExam,
        exam_type: examType,
        is_published: true,
      });
    }
    return meetings;
  },
};
