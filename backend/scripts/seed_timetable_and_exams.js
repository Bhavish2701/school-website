const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/srividya_school_db';

const Timetable = require('../src/models/timetable.model');
const Substitution = require('../src/models/substitution.model');
const { Exam, ExamSchedule } = require('../src/models/exam.model');
const { User } = require('../src/models/user.model');

async function seed() {
  await mongoose.connect(uri);
  console.log('[Seed] Connected to MongoDB');

  const principal = await User.findOne({ role: 'PRINCIPAL' }) || await User.findOne({ username: 'principal' });
  const createdBy = principal ? principal._id : new mongoose.Types.ObjectId();

  await Timetable.deleteMany({ className: 'Class X-A' });
  console.log('[Seed] Cleared previous Class X-A timetable records');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const periodsTemplate = [
    {
      periodNumber: 1,
      periodName: 'Period 1',
      startTime: '09:00 AM',
      endTime: '09:45 AM',
      startMinutes: 540,
      endMinutes: 585,
      subject: 'Mathematics',
      teacher: 'Sri P. Satyanarayana',
      room: 'Room 204',
      wing: 'High School',
      isBreak: false,
    },
    {
      periodNumber: 2,
      periodName: 'Period 2',
      startTime: '09:45 AM',
      endTime: '10:30 AM',
      startMinutes: 585,
      endMinutes: 630,
      subject: 'Physical Science',
      teacher: 'Sri Navva Anand (VP)',
      room: 'Room 204',
      wing: 'High School',
      isBreak: false,
    },
    {
      periodNumber: 3,
      periodName: 'Period 3',
      startTime: '10:30 AM',
      endTime: '11:15 AM',
      startMinutes: 630,
      endMinutes: 675,
      subject: 'English Language',
      teacher: 'Ms. Anjali (VIII-A)',
      room: 'Room 204',
      wing: 'High School',
      isBreak: false,
    },
    {
      periodNumber: 4,
      periodName: 'Period 4',
      startTime: '11:15 AM',
      endTime: '12:00 PM',
      startMinutes: 675,
      endMinutes: 720,
      subject: 'Social Studies',
      teacher: 'Sri R. Venkata Ramana',
      room: 'Room 204',
      wing: 'High School',
      isBreak: false,
    },
    {
      periodNumber: 5,
      periodName: 'Period 5',
      startTime: '12:45 PM',
      endTime: '01:30 PM',
      startMinutes: 765,
      endMinutes: 810,
      subject: 'Telugu (1st Lang)',
      teacher: 'Sri S. Ramana Murthy',
      room: 'Room 204',
      wing: 'High School',
      isBreak: false,
    },
    {
      periodNumber: 6,
      periodName: 'Period 6',
      startTime: '01:30 PM',
      endTime: '02:15 PM',
      startMinutes: 810,
      endMinutes: 855,
      subject: 'Biology & EVS',
      teacher: 'Smt. S. Lakshmi',
      room: 'Room 204',
      wing: 'High School',
      isBreak: false,
    },
    {
      periodNumber: 7,
      periodName: 'Period 7',
      startTime: '02:15 PM',
      endTime: '03:00 PM',
      startMinutes: 855,
      endMinutes: 900,
      subject: 'Computer Science',
      teacher: 'Sri D. Srinivas (Lab)',
      room: 'Computer Lab 108',
      wing: 'High School',
      isBreak: false,
    },
    {
      periodNumber: 8,
      periodName: 'Period 8',
      startTime: '03:00 PM',
      endTime: '03:45 PM',
      startMinutes: 900,
      endMinutes: 945,
      subject: 'Games & PET',
      teacher: 'Sri M. Sridhar',
      room: 'Sports Ground',
      wing: 'High School',
      isBreak: false,
    },
  ];

  const timetableEntries = [];
  for (const day of days) {
    for (const p of periodsTemplate) {
      timetableEntries.push({
        schoolId: 'SRIVIDYA-EM-01',
        academicYear: '2025-2026',
        className: 'Class X-A',
        section: 'A',
        day,
        periodNumber: p.periodNumber,
        periodName: p.periodName,
        startTime: p.startTime,
        endTime: p.endTime,
        startMinutes: p.startMinutes,
        endMinutes: p.endMinutes,
        subject: p.subject,
        teacher: p.teacher,
        room: p.room,
        wing: p.wing,
        isBreak: false,
        status: 'ACTIVE',
      });
    }
  }

  await Timetable.insertMany(timetableEntries);
  console.log(`[Seed] Inserted ${timetableEntries.length} timetable periods for Class X-A.`);

  await Substitution.deleteMany({});
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  const sub = await Substitution.create({
    substitutionId: 'SUB-2026-002',
    date: todayUtc,
    academicYear: '2025-2026',
    className: 'Class IX-A',
    room: 'Science Lab 1',
    periodNumber: 3,
    periodName: 'Period 3 & Period 6',
    time: '10:30 – 11:15 AM & 01:30 – 02:15 PM',
    originalSubject: 'Physics',
    topic: 'Ray Optics Numerical Problem Set 4 (AP SCERT Ch. 7)',
    absentTeacher: 'Sri K. Rajesh',
    absentTeacherDept: 'Physical Science',
    absentReason: 'on Medical Leave',
    substituteTeacher: 'Smt. M. Lakshmi',
    substituteSubject: 'General Science',
    substituteRole: 'Biology HOD / Composite Lab In-Charge',
    status: 'CONFIRMED',
    approvedBy: 'Principal Smt. Gorle Varalakshmi',
  });
  console.log('[Seed] Inserted active substitution:', sub.substitutionId);

  await Exam.deleteMany({});
  console.log('[Seed] Cleared previous exam records');

  const examsData = [
    {
      name: 'Quarterly Summative Assessment (SA-1)',
      examType: 'SUMMATIVE_1',
      academicYear: '2025-2026',
      startDate: new Date('2026-09-24T00:00:00.000Z'),
      endDate: new Date('2026-09-30T23:59:59.000Z'),
      classes: ['Classes I to X'],
      description: 'State Board Prescribed Mid-Term',
      timings: '09:30 AM – 12:30 PM',
      subjectsCovered: 'All Core Subjects (Telugu, Hindi, English, Maths, Science, Social)',
      hallTicketStatus: 'Hall Tickets Generated',
      actionLabel: 'View Datesheet',
      isPublished: true,
      status: 'COMPLETED',
      createdBy,
    },
    {
      name: 'Science Olympiad & National Talent Search',
      examType: 'OTHER',
      academicYear: '2025-2026',
      startDate: new Date('2026-10-15T00:00:00.000Z'),
      endDate: new Date('2026-10-17T23:59:59.000Z'),
      classes: ['Classes VI to X'],
      description: 'Inter-School Competitive Benchmark',
      timings: '02:00 PM – 04:00 PM',
      subjectsCovered: 'Physics, Chemistry, Biology & Logical Reasoning',
      hallTicketStatus: 'Nominations Finalized (68 Students)',
      actionLabel: 'Student List',
      isPublished: true,
      status: 'COMPLETED',
      createdBy,
    },
    {
      name: 'Half-Yearly Examinations & Practicals',
      examType: 'SUMMATIVE_2',
      academicYear: '2025-2026',
      startDate: new Date('2026-11-10T00:00:00.000Z'),
      endDate: new Date('2026-11-18T23:59:59.000Z'),
      classes: ['Classes I to X'],
      description: 'Board Assessment & Lab Practical Marks',
      timings: '09:30 AM – 12:30 PM',
      subjectsCovered: 'Theory + Science & Computer Practical Viva',
      hallTicketStatus: 'Syllabus 60% Target Met',
      actionLabel: 'Blueprints',
      isPublished: true,
      status: 'UPCOMING',
      createdBy,
    },
    {
      name: 'Class X SSC Board Pre-Final Exam 1',
      examType: 'MID_TERM',
      academicYear: '2025-2026',
      startDate: new Date('2026-12-08T00:00:00.000Z'),
      endDate: new Date('2026-12-14T23:59:59.000Z'),
      classes: ['Class X-A (45 Students)'],
      description: 'Simulated AP Board Pattern Examination',
      timings: '09:30 AM – 12:45 PM',
      subjectsCovered: 'Complete 100% SSC Board Syllabus',
      hallTicketStatus: 'Question Papers in Moderation',
      actionLabel: 'Seating Plan',
      isPublished: true,
      status: 'UPCOMING',
      createdBy,
    },
    {
      name: 'Class X SSC Board Pre-Final Exam 2',
      examType: 'MID_TERM',
      academicYear: '2025-2026',
      startDate: new Date('2027-01-18T00:00:00.000Z'),
      endDate: new Date('2027-01-25T23:59:59.000Z'),
      classes: ['Class X-A'],
      description: 'Pre-Board Model Examination',
      timings: '09:30 AM – 12:45 PM',
      subjectsCovered: 'Full AP SSC Model Papers (Pre-Board)',
      hallTicketStatus: 'Blueprints Approved',
      actionLabel: 'View Datesheet',
      isPublished: true,
      status: 'UPCOMING',
      createdBy,
    },
    {
      name: 'AP SSC Annual Board Public Examinations',
      examType: 'ANNUAL',
      academicYear: '2025-2026',
      startDate: new Date('2027-03-15T00:00:00.000Z'),
      endDate: new Date('2027-03-30T23:59:59.000Z'),
      classes: ['Class X-A'],
      description: 'State Board Prescribed Annual Public Examination',
      timings: '09:30 AM – 12:45 PM',
      subjectsCovered: 'First Language to Social Studies (AP SSC Board)',
      hallTicketStatus: 'Board Roll Numbers Allotted',
      actionLabel: 'View Datesheet',
      isPublished: true,
      status: 'UPCOMING',
      createdBy,
    },
  ];

  await Exam.insertMany(examsData);
  console.log(`[Seed] Inserted ${examsData.length} examinations (2 completed, 4 upcoming).`);

  await mongoose.disconnect();
  console.log('[Seed] Seeding completed successfully.');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
