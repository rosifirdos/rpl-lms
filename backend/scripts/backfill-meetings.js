import { PrismaClient } from '@prisma/client';
import { ACADEMIC } from '../src/constants/academic.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai backfill 16 pertemuan untuk kelas yang sudah ada...');

  const classesWithoutMeetings = await prisma.class.findMany({
    where: {
      meetings: { none: {} }
    },
    select: { id: true, name: true, academic_year: true, semester: true }
  });

  if (classesWithoutMeetings.length === 0) {
    console.log('Semua kelas sudah memiliki 16 pertemuan.');
    return;
  }

  console.log('Ditemukan ' + classesWithoutMeetings.length + ' kelas tanpa pertemuan:');
  classesWithoutMeetings.forEach(c => console.log('  - ' + c.name + ' (' + c.id + ')'));

  for (const cls of classesWithoutMeetings) {
    const generated = ACADEMIC.generate16Meetings();
    const meetings = generated.map((m) => ({
      class_id: cls.id,
      meeting_number: m.meeting_number,
      title: m.title,
      description: m.description,
      is_exam: m.is_exam,
      exam_type: m.exam_type || 'NONE',
      is_published: m.is_published ?? true,
    }));

    await prisma.meeting.createMany({ data: meetings, skipDuplicates: true });
    console.log('  ' + cls.name + ': ' + meetings.length + ' pertemuan dibuat');
  }

  console.log('Backfill selesai!');
}

main()
  .catch((e) => {
    console.error('Backfill gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
