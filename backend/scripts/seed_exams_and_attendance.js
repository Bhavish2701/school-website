/**
 * Seed Examination Cycles, Schedules, Marks Memos, and Attendance Records
 * For Sri Vidya English Medium High School
 */
const mongoose = require('mongoose');
const config = require('../src/config/env');
const { Exam, ExamSchedule, ExamMark, calculateSubjectGrade, calculateOverallGrade } = require('../src/models/exam.model');
const { Student } = require('../src/models/student.model');
const { Subject } = require('../src/models/subject.model');
const { Teacher } = require('../src/models/teacher.model');
const { User } = require('../src/models/user.model');
const { AttendanceRecord, AttendanceRegister } = require('../src/models/attendance.model');

const seedExamsAndAttendance = async () => {
  await mongoose.connect(config.mongodbUri);
  console.log('[Exam & Attendance Seed] Connected to MongoDB');

  // 1. Resolve Principal / Admin User
  const principalUser = await User.findOne({ role: 'PRINCIPAL' }) || await User.findOne({ username: 'principal' });
  const teacherUser = await User.findOne({ role: 'TEACHER' }) || await User.findOne({ username: 'teacher1' });
  const teacherSunitha = await Teacher.findOne({ fullName: /Sunitha/i });

  const createdBy = principalUser ? principalUser._id : (teacherUser ? teacherUser._id : new mongoose.Types.ObjectId());
  const teacherId = teacherUser ? teacherUser._id : createdBy;

  // Clear existing exam & attendance records
  await Exam.deleteMany({});
  await ExamSchedule.deleteMany({});
  await ExamMark.deleteMany({});
  await AttendanceRecord.deleteMany({});
  await AttendanceRegister.deleteMany({});
  console.log('[Exam & Attendance Seed] Cleared previous exam and attendance records.');

  // 2. Create Examination 1: Quarterly Assessment (SA-1)
  const examSA1 = await Exam.create({
    name: 'Quarterly Assessment (SA-1)',
    examType: 'SUMMATIVE_1',
    academicYear: '2025-2026',
    startDate: new Date('2025-10-06'),
    endDate: new Date('2025-10-16'),
    classes: ['6', '7', '8', '9', '10'],
    description: 'First Summative Assessment covering Term 1 syllabus per AP SSC Board guidelines.',
    isPublished: true,
    publishedAt: new Date('2025-10-25'),
    publishedBy: createdBy,
    status: 'COMPLETED',
    createdBy: createdBy,
  });

  // Create Examination 2: Half-Yearly Examination (SA-2)
  const examSA2 = await Exam.create({
    name: 'Half-Yearly Examination (SA-2)',
    examType: 'SUMMATIVE_2',
    academicYear: '2025-2026',
    startDate: new Date('2025-12-15'),
    endDate: new Date('2025-12-24'),
    classes: ['6', '7', '8', '9', '10'],
    description: 'Mid-term comprehensive cumulative examination.',
    isPublished: false,
    status: 'ONGOING',
    createdBy: createdBy,
  });

  console.log(`[Exam & Attendance Seed] Seeded Exams: "${examSA1.name}" and "${examSA2.name}"`);

  // 3. Resolve All Subjects
  const allSubjects = await Subject.find({});
  const subjectMap = {};
  allSubjects.forEach(s => { subjectMap[s.name] = s; });

  // 4. Create Exam Schedules for Class 10
  const class10Subjects = [
    { subject: 'Telugu (First Language)', date: new Date('2025-10-06'), time: '09:30 AM - 12:45 PM', max: 100, pass: 35 },
    { subject: 'English Language & Literature', date: new Date('2025-10-08'), time: '09:30 AM - 12:45 PM', max: 100, pass: 35 },
    { subject: 'Mathematics', date: new Date('2025-10-10'), time: '09:30 AM - 12:45 PM', max: 100, pass: 35 },
    { subject: 'Physical Science', date: new Date('2025-10-13'), time: '09:30 AM - 12:45 PM', max: 100, pass: 35 },
    { subject: 'Social Studies', date: new Date('2025-10-15'), time: '09:30 AM - 12:45 PM', max: 100, pass: 35 },
    { subject: 'Computer Science & Lab', date: new Date('2025-10-16'), time: '09:30 AM - 12:00 PM', max: 100, pass: 35 },
  ];

  for (const s of class10Subjects) {
    await ExamSchedule.create({
      exam: examSA1._id,
      class: '10',
      section: 'ALL',
      subject: s.subject,
      examDate: s.date,
      startTime: s.time.split(' - ')[0],
      endTime: s.time.split(' - ')[1],
      roomNumber: 'Exam Hall A',
      maxMarks: s.max,
      passMarks: s.pass,
      syllabus: 'Term 1 Prescribed Curriculum Units 1-5'
    });
  }

  // 5. Seed Marks Memos & Student Results for All 9 Students
  const students = await Student.find({}).sort({ class: -1, rollNo: 1 });
  console.log(`[Exam & Attendance Seed] Populating verified marks memos for ${students.length} students...`);

  // Realistic score templates per student
  const studentMarksProfiles = {
    'SV-0001': { // A. Rahul (Class 10-A, Roll 1001) - Top distinction
      scores: [
        { subject: 'Telugu (First Language)', internal: 19, external: 76, remarks: 'Excellent linguistic articulation' },
        { subject: 'English Language & Literature', internal: 19, external: 73, remarks: 'Mastery in prose & creative writing' },
        { subject: 'Mathematics', internal: 20, external: 77, remarks: 'Outstanding precision in algebra & geometry' },
        { subject: 'Physical Science', internal: 19, external: 74, remarks: 'Strong theoretical & experimental grasp' },
        { subject: 'Social Studies', internal: 19, external: 75, remarks: 'Deep historical & civic understanding' },
        { subject: 'Computer Science & Lab', internal: 20, external: 78, remarks: 'Proficient in Python logic & database schema' },
      ],
      remarks: 'Exemplary scholastic diligence, active analytical acumen, and outstanding peer leadership.'
    },
    'SV-0003': { // K. Sai Teja (Class 10-A, Roll 1002) - High First Class
      scores: [
        { subject: 'Telugu (First Language)', internal: 18, external: 68, remarks: 'Good grasp of grammar' },
        { subject: 'English Language & Literature', internal: 17, external: 66, remarks: 'Good communicative writing' },
        { subject: 'Mathematics', internal: 19, external: 71, remarks: 'High proficiency in trigonometry' },
        { subject: 'Physical Science', internal: 18, external: 67, remarks: 'Consistently completes lab assignments' },
        { subject: 'Social Studies', internal: 18, external: 69, remarks: 'Well-structured answers in geography' },
        { subject: 'Computer Science & Lab', internal: 19, external: 72, remarks: 'Good practical coding skills' },
      ],
      remarks: 'Disciplined and attentive student. Exhibits consistent curiosity and strong study habits.'
    },
    'SV-0004': { // M. Divya Bharathi (Class 10-A, Roll 1003) - Distinction
      scores: [
        { subject: 'Telugu (First Language)', internal: 20, external: 77, remarks: 'Flawless handwriting and poetry exposition' },
        { subject: 'English Language & Literature', internal: 20, external: 75, remarks: 'Superb vocabulary & comprehension' },
        { subject: 'Mathematics', internal: 19, external: 74, remarks: 'Rapid problem solving in quadratic equations' },
        { subject: 'Physical Science', internal: 19, external: 73, remarks: 'Neat circuit & ray diagrams' },
        { subject: 'Social Studies', internal: 20, external: 76, remarks: 'Comprehensive answers with timeline references' },
        { subject: 'Computer Science & Lab', internal: 20, external: 76, remarks: 'Exemplary project documentation' },
      ],
      remarks: 'Outstanding dedication, courteous deportment, and remarkable intellectual consistency.'
    },
    'SV-0002': { // B. Priya (Class 8-C, Roll 8024)
      scores: [
        { subject: 'Telugu (First Language)', internal: 18, external: 65, remarks: 'Good reading skills' },
        { subject: 'English Language & Literature', internal: 18, external: 67, remarks: 'Good grammar foundation' },
        { subject: 'Mathematics', internal: 17, external: 63, remarks: 'Shows good understanding of fractions & ratios' },
        { subject: 'Physical Science', internal: 18, external: 66, remarks: 'Actively participates in science exhibitions' },
        { subject: 'Social Studies', internal: 19, external: 68, remarks: 'Detailed map pointing' },
        { subject: 'Computer Science & Lab', internal: 19, external: 70, remarks: 'Proficient in office tools & scratch' },
      ],
      remarks: 'Sincere and eager to learn. Shows steady scholastic improvement.'
    },
    'SV-0005': { // G. Karthik (Class 9-B, Roll 901)
      scores: [
        { subject: 'Telugu (First Language)', internal: 17, external: 62, remarks: 'Good comprehension' },
        { subject: 'English Language & Literature', internal: 17, external: 64, remarks: 'Good speaking skills' },
        { subject: 'Mathematics', internal: 18, external: 69, remarks: 'Strong in polynomials' },
        { subject: 'Physical Science', internal: 17, external: 65, remarks: 'Good laboratory notebook' },
        { subject: 'Social Studies', internal: 17, external: 63, remarks: 'Regular submission of assignments' },
        { subject: 'Computer Science & Lab', internal: 18, external: 68, remarks: 'Good understanding of algorithms' },
      ],
      remarks: 'Capable and disciplined. Recommended to spend more time on science problem solving.'
    },
    'SV-0006': { // V. Siri Varshini (Class 9-B, Roll 902)
      scores: [
        { subject: 'Telugu (First Language)', internal: 19, external: 72, remarks: 'Excellent expression' },
        { subject: 'English Language & Literature', internal: 19, external: 71, remarks: 'Articulate writing' },
        { subject: 'Mathematics', internal: 19, external: 73, remarks: 'Quick grasp of geometry' },
        { subject: 'Physical Science', internal: 18, external: 70, remarks: 'Consistent quiz performance' },
        { subject: 'Social Studies', internal: 19, external: 74, remarks: 'Strong essay answers' },
        { subject: 'Computer Science & Lab', internal: 19, external: 75, remarks: 'Creative web page design' },
      ],
      remarks: 'Bright, proactive student with excellent creative abilities and analytical aptitude.'
    },
    'SV-0007': { // CH. Hemanth (Class 7-A, Roll 701)
      scores: [
        { subject: 'Telugu (First Language)', internal: 17, external: 60, remarks: 'Good spelling' },
        { subject: 'English Language & Literature', internal: 17, external: 62, remarks: 'Punctual with reading logs' },
        { subject: 'Mathematics', internal: 18, external: 66, remarks: 'Good in arithmetic' },
        { subject: 'Physical Science', internal: 17, external: 61, remarks: 'Curious in natural science questions' },
        { subject: 'Social Studies', internal: 17, external: 60, remarks: 'Neat project charts' },
        { subject: 'Computer Science & Lab', internal: 18, external: 67, remarks: 'Fast typing and tool usage' },
      ],
      remarks: 'Enthusiastic and polite student. Shows great promise with continued focus.'
    },
    'SV-0008': { // S. Tanvi Sree (Class 6-A, Roll 601)
      scores: [
        { subject: 'Telugu (First Language)', internal: 19, external: 73, remarks: 'Very neat calligraphy' },
        { subject: 'English Language & Literature', internal: 19, external: 74, remarks: 'Expressive reader' },
        { subject: 'Mathematics', internal: 19, external: 75, remarks: 'Strong mental math skills' },
        { subject: 'Physical Science', internal: 18, external: 71, remarks: 'Good environmental awareness' },
        { subject: 'Social Studies', internal: 19, external: 73, remarks: 'Good interest in civics & community' },
        { subject: 'Computer Science & Lab', internal: 19, external: 76, remarks: 'Enthusiastic computer lab participant' },
      ],
      remarks: 'Delightful student with high academic consistency, neat notebook maintenance and pleasant manners.'
    },
    'SV-0010': { // A. Sneha (Class 6-A, Roll 6015)
      scores: [
        { subject: 'Telugu (First Language)', internal: 18, external: 70, remarks: 'Fluent reading' },
        { subject: 'English Language & Literature', internal: 18, external: 69, remarks: 'Good grammar' },
        { subject: 'Mathematics', internal: 18, external: 72, remarks: 'Good problem solving' },
        { subject: 'Physical Science', internal: 18, external: 68, remarks: 'Active in group experiments' },
        { subject: 'Social Studies', internal: 18, external: 69, remarks: 'Good historical knowledge' },
        { subject: 'Computer Science & Lab', internal: 18, external: 71, remarks: 'Quick learner of graphics software' },
      ],
      remarks: 'Dedicated and obedient student with steady academic growth across all subjects.'
    }
  };

  for (const student of students) {
    const profile = studentMarksProfiles[student.admissionNo] || studentMarksProfiles['SV-0001'];
    const subjectMarks = [];
    let totalObtained = 0;
    let totalMax = 0;
    let totalGradePoints = 0;

    for (const sc of profile.scores) {
      const marksObtained = sc.internal + sc.external;
      const maxMarks = 100;
      const { grade, gradePoint } = calculateSubjectGrade(marksObtained, maxMarks, false);

      totalObtained += marksObtained;
      totalMax += maxMarks;
      totalGradePoints += gradePoint;

      subjectMarks.push({
        subject: sc.subject,
        marksObtained,
        maxMarks,
        passMarks: 35,
        isAbsent: false,
        grade,
        gradePoint,
        remarks: sc.remarks,
        enteredBy: teacherId,
        enteredAt: new Date('2025-10-20'),
      });
    }

    const percentage = Math.round((totalObtained / totalMax) * 1000) / 10;
    const gpa = Math.round((totalGradePoints / subjectMarks.length) * 10) / 10;
    const overallGrade = calculateOverallGrade(percentage);

    await ExamMark.create({
      exam: examSA1._id,
      student: student._id,
      class: student.class,
      section: student.section,
      academicYear: '2025-2026',
      subjectMarks,
      totalMarksObtained: totalObtained,
      totalMaxMarks: totalMax,
      percentage,
      gpa,
      overallGrade,
      resultStatus: 'PASSED',
      classTeacherRemarks: profile.remarks,
      isPublished: true,
    });
  }

  // Calculate and assign class ranks for Class 10
  const class10Marks = await ExamMark.find({ exam: examSA1._id, class: '10' }).sort({ totalMarksObtained: -1 });
  for (let r = 0; r < class10Marks.length; r++) {
    class10Marks[r].rankInClass = r + 1;
    await class10Marks[r].save();
  }

  console.log(`[Exam & Attendance Seed] Assigned ranks for ${class10Marks.length} Class 10 candidates.`);

  // 6. Seed Attendance Records & Register Summaries for 2025-2026
  // Academic calendar: 114 working days in Term 1
  const workingDays = 114;
  console.log('[Exam & Attendance Seed] Seeding attendance summaries & registers...');

  const attendanceProfile = {
    'SV-0001': { present: 110, absent: 4, rate: 96.5 },
    'SV-0002': { present: 108, absent: 6, rate: 94.7 },
    'SV-0003': { present: 109, absent: 5, rate: 95.6 },
    'SV-0004': { present: 112, absent: 2, rate: 98.2 },
    'SV-0005': { present: 107, absent: 7, rate: 93.9 },
    'SV-0006': { present: 111, absent: 3, rate: 97.4 },
    'SV-0007': { present: 106, absent: 8, rate: 93.0 },
    'SV-0008': { present: 112, absent: 2, rate: 98.2 },
    'SV-0010': { present: 110, absent: 4, rate: 96.5 },
  };

  // Seed daily attendance for sample recent days so date queries return live logs
  const dates = [
    new Date('2025-10-13'),
    new Date('2025-10-14'),
    new Date('2025-10-15'),
    new Date('2025-10-16'),
    new Date('2025-10-17')
  ];

  for (const student of students) {
    const prof = attendanceProfile[student.admissionNo] || { present: 108, absent: 6, rate: 94.7 };
    student.attendanceRate = prof.rate;
    student.attendedDays = prof.present;
    student.totalDays = workingDays;
    await student.save();

    for (let d = 0; d < dates.length; d++) {
      await AttendanceRecord.create({
        student: student._id,
        class: student.class,
        section: student.section,
        academicYear: '2025-2026',
        date: dates[d],
        status: (d === 1 && student.admissionNo === 'SV-0007') ? 'ABSENT' : 'PRESENT',
        session: 'FULL_DAY',
        arrivalTime: '08:45 AM',
        markedBy: teacherId,
        markedAt: dates[d],
      });
    }
  }

  // Create an AttendanceRegister for Class 10-A
  await AttendanceRegister.create({
    class: '10',
    section: 'A',
    academicYear: '2025-2026',
    date: new Date('2025-10-17'),
    totalStudents: 3,
    presentCount: 3,
    absentCount: 0,
    lateCount: 0,
    halfDayCount: 0,
    status: 'SUBMITTED',
    takenBy: teacherId,
    submittedAt: new Date('2025-10-17T09:15:00Z'),
  });

  console.log('[Exam & Attendance Seed] Seeding completed successfully!');
  await mongoose.disconnect();
};

seedExamsAndAttendance().catch(err => {
  console.error('[Exam & Attendance Seed ERROR]:', err);
  process.exit(1);
});
