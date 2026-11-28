const { User } = require('../models/user.model');
const { Teacher } = require('../models/teacher.model');
const StudentRecord = require('../models/studentRecord.model');

const ensureSeededTeacherProfile = async () => {
  const teacherUser = await User.findOne({ username: 'teacher1' });
  if (!teacherUser) return;
  const existingTeacher = await Teacher.findOne({
    $or: [{ user: teacherUser._id }, { email: teacherUser.email }],
  });
  if (!existingTeacher) {
    await Teacher.create({
      employeeId: 'EMP-2025-001',
      fullName: teacherUser.fullName || 'P. Sunitha (Senior Teacher)',
      gender: 'female',
      qualification: 'M.Sc, B.Ed',
      experienceYears: 8,
      specialization: 'Mathematics',
      email: teacherUser.email,
      phone: teacherUser.phone || '9876543214',
      status: 'ACTIVE',
      user: teacherUser._id,
      assignedClasses:
        Array.isArray(teacherUser.assignedClasses) && teacherUser.assignedClasses.length > 0
          ? teacherUser.assignedClasses.map((ac, idx) => ({
              class: ac.class,
              section: ac.section || 'A',
              subject: ac.subject || 'Mathematics',
              isClassTeacher: idx === 0,
            }))
          : [
              { class: '10', section: 'A', subject: 'Mathematics', isClassTeacher: true },
              { class: '9', section: 'B', subject: 'Mathematics', isClassTeacher: false },
            ],
      assignedSubjects: ['Mathematics'],
    });
  } else if (!existingTeacher.user) {
    existingTeacher.user = teacherUser._id;
    await existingTeacher.save({ validateBeforeSave: false });
  }
};

const seedData = async () => {
  try {
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      const recordCount = await StudentRecord.countDocuments();
      if (recordCount === 0) {
        await seedRecords();
      }
      await ensureSeededTeacherProfile();
      return;
    }

    console.log('[Seed] Seeding initial role accounts and relationship mappings...');

    await User.create({
      username: 'superadmin',
      email: 'superadmin@srividya.edu.in',
      password: 'SuperAdmin@123',
      fullName: 'System Super Administrator',
      role: 'SUPER_ADMIN',
      phone: '9876543210',
    });

    await User.create({
      username: 'principal',
      email: 'principal@srividya.edu.in',
      password: 'Principal@123',
      fullName: 'Smt. Gorle Varalakshmi',
      role: 'PRINCIPAL',
      phone: '9876543211',
    });

    await User.create({
      username: 'viceprincipal',
      email: 'viceprincipal@srividya.edu.in',
      password: 'VicePrincipal@123',
      fullName: 'Sri Navva Anand',
      role: 'VICE_PRINCIPAL',
      phone: '9876543212',
    });

    await User.create({
      username: 'officestaff',
      email: 'office@srividya.edu.in',
      password: 'Office@123',
      fullName: 'M. Ramesh (Office Head)',
      role: 'OFFICE',
      phone: '9876543213',
    });

    await User.create({
      username: 'teacher1',
      email: 'teacher@srividya.edu.in',
      password: 'Teacher@123',
      fullName: 'P. Sunitha (Senior Teacher)',
      role: 'TEACHER',
      phone: '9876543214',
      assignedClasses: [
        { class: '10', section: 'A', subject: 'Mathematics' },
        { class: '9', section: 'B', subject: 'Mathematics' },
      ],
    });

    const parent1 = await User.create({
      username: 'parent1',
      email: 'parent1@srividya.edu.in',
      password: 'Parent@123',
      fullName: 'A. Srinivasa Rao (Parent of Rahul)',
      role: 'PARENT',
      phone: '9876543216',
      children: [],
    });

    const parent2 = await User.create({
      username: 'parent2',
      email: 'parent2@srividya.edu.in',
      password: 'Parent@123',
      fullName: 'B. Venkat (Parent of Priya)',
      role: 'PARENT',
      phone: '9876543217',
      children: [],
    });

    const student1 = await User.create({
      username: 'student1',
      email: 'student1@srividya.edu.in',
      password: 'Student@123',
      fullName: 'A. Rahul (Class 10-A)',
      role: 'STUDENT',
      phone: '9876543215',
      studentProfile: {
        class: '10',
        section: 'A',
        rollNumber: '1001',
        admissionNo: 'ADM-2025-001',
        parentUser: parent1._id,
      },
    });

    const student2 = await User.create({
      username: 'student2',
      email: 'student2@srividya.edu.in',
      password: 'Student@123',
      fullName: 'B. Priya (Class 8-C)',
      role: 'STUDENT',
      phone: '9876543218',
      studentProfile: {
        class: '8',
        section: 'C',
        rollNumber: '8024',
        admissionNo: 'ADM-2025-045',
        parentUser: parent2._id,
      },
    });

    parent1.children = [student1._id];
    await parent1.save({ validateBeforeSave: false });

    parent2.children = [student2._id];
    await parent2.save({ validateBeforeSave: false });

    console.log('[Seed] Users seeded successfully with role relationships.');

    await ensureSeededTeacherProfile();
    await seedRecords(student1, student2);
  } catch (error) {
    console.error(`[Seed Error] Could not seed data: ${error.message}`);
  }
};

const seedRecords = async (s1, s2) => {
  try {
    const student1 = s1 || (await User.findOne({ username: 'student1' }));
    const student2 = s2 || (await User.findOne({ username: 'student2' }));

    if (!student1 || !student2) return;

    await StudentRecord.deleteMany({});

    await StudentRecord.create({
      student: student1._id,
      class: '10',
      section: 'A',
      academicYear: '2025-2026',
      term: 'Term-1',
      attendancePercentage: 96,
      subjects: [
        { subject: 'Mathematics', score: 94, maxScore: 100, grade: 'A+' },
        { subject: 'Science', score: 88, maxScore: 100, grade: 'A' },
        { subject: 'Social Studies', score: 90, maxScore: 100, grade: 'A+' },
        { subject: 'English', score: 92, maxScore: 100, grade: 'A+' },
      ],
      teacherRemarks: 'Excellent analytical aptitude in Mathematics and Science.',
    });

    await StudentRecord.create({
      student: student2._id,
      class: '8',
      section: 'C',
      academicYear: '2025-2026',
      term: 'Term-1',
      attendancePercentage: 92,
      subjects: [
        { subject: 'Mathematics', score: 78, maxScore: 100, grade: 'B+' },
        { subject: 'Science', score: 85, maxScore: 100, grade: 'A' },
        { subject: 'English', score: 88, maxScore: 100, grade: 'A' },
      ],
      teacherRemarks: 'Consistent effort shown across all subjects.',
    });

    console.log('[Seed] Seeded academic records for object-level RBAC testing.');
  } catch (err) {
    console.error(`[Seed Error] Could not seed records: ${err.message}`);
  }
};

module.exports = seedData;
