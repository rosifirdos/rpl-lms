/**
 * Konstanta akademik SPADA LMS
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
      const meeting = {
        meeting_number: i,
        title: `Pertemuan ${i}`,
        is_exam: !!this.EXAM_MEETINGS[i],
        exam_type: this.EXAM_MEETINGS[i] || null,
      };
      meetings.push(meeting);
    }
    return meetings;
  },
};
