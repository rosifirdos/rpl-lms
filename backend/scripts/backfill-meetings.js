import { PrismaClient } from '@prisma/client';
import { ACADEMIC } from '../src/constants/academic.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Memulai backfill 16 pertemuan untuk kelas yang sudah ada...');

  // Cari kelas yang belum memiliki pertemuan
  const classesWithoutMeetings = await prisma.class.findMany({
    where: {
      meetings: { none: {} }
    },
    select: { id: true, name: true, academic_year: true, semester: true }
  });

  if (classesWithoutMeetings.length === 0) {
    console.log('✅ Semua kelas sudah memiliki 16 pertemuan.');
    return;
  }

  console.log(`Ditemukan ${classesWithoutMeetings.length} kelas tanpa pertemuan:`);
  classesWithoutMeetings.forEach(c => console.log(`  - ${c.name} (${c.id})`));

  for (const cls of classesWithoutMeetings) {
    const meetings = [];
    for (let i = 1; i <= ACADEMIC.TOTAL_MEETINGS; i++) {
      const isExam = !!ACADEMIC.EXAM_MEETINGS[i];
      const examType = ACADEMIC.EXAM_MEETINGS[i] || 'NONE';
      const title = isExam
        ? `Pertemuan ${i}: ${examType === 'UTS' ? 'Evaluasi Tengah Semester (UTS)' : 'Evaluasi Akhir Semester (UAS)'}`
        : `Pertemuan ${i}`;

      meetings.push({
        class_id: cls.id,
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

    await prisma.meeting.createMany({ data: meetings });
    console.log(`  ✅ ${cls.name}: ${meetings.length} pertemuan dibuat`);
  }

  console.log('\n🎉 Backfill selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Backfill gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
