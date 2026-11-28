const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { User } = require('../../src/models/user.model');
const { Student } = require('../../src/models/student.model');
const { Teacher } = require('../../src/models/teacher.model');

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_srividya_2026';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const generateExpiredToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '-10s' }
  );
};

const generateInvalidToken = () => {
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.tamperedsignature';
};

const resetCollections = async (...models) => {
  for (const model of models) {
    if (model && model.deleteMany) {
      await model.deleteMany({});
    }
  }
};

const seedBaseUsers = async () => {
  await resetCollections(User, Student, Teacher);

  const passwordHash = await bcrypt.hash('Test@1234', 10);

  const superAdmin = await User.create({
    username: 'superadmin_test',
    email: 'superadmin_test@srividya.edu.in',
    password: 'Test@1234',
    fullName: 'Super Administrator',
    role: 'SUPER_ADMIN',
  });

  const principal = await User.create({
    username: 'principal_test',
    email: 'principal_test@srividya.edu.in',
    password: 'Test@1234',
    fullName: 'Principal Srividya',
    role: 'PRINCIPAL',
  });

  const office = await User.create({
    username: 'office_test',
    email: 'office_test@srividya.edu.in',
    password: 'Test@1234',
    fullName: 'Office Admin Staff',
    role: 'OFFICE',
  });

  const student1User = await User.create({
    username: 'student1_test',
    email: 'student1_test@srividya.edu.in',
    password: 'Test@1234',
    fullName: 'Rahul Sharma',
    role: 'STUDENT',
    studentProfile: {
      class: '10',
      section: 'A',
      rollNumber: '1001',
      admissionNo: 'ADM-TEST-1001',
    },
  });

  const student2User = await User.create({
    username: 'student2_test',
    email: 'student2_test@srividya.edu.in',
    password: passwordHash,
    fullName: 'Priya Verma',
    role: 'STUDENT',
    studentProfile: {
      class: '8',
      section: 'C',
      rollNumber: '8001',
      admissionNo: 'ADM-TEST-8001',
    },
  });

  const parent1User = await User.create({
    username: 'parent1_test',
    email: 'parent1_test@srividya.edu.in',
    password: passwordHash,
    fullName: 'Mr. Rajesh Sharma',
    role: 'PARENT',
    children: [student1User._id],
  });

  const parent2User = await User.create({
    username: 'parent2_test',
    email: 'parent2_test@srividya.edu.in',
    password: passwordHash,
    fullName: 'Mrs. Sunita Verma',
    role: 'PARENT',
    children: [student2User._id],
  });

  const teacher1User = await User.create({
    username: 'teacher1_test',
    email: 'teacher1_test@srividya.edu.in',
    password: passwordHash,
    fullName: 'Ananya Rao',
    role: 'TEACHER',
    assignedClasses: [
      { class: '10', section: 'A', subject: 'Mathematics' },
    ],
  });

  const teacher2User = await User.create({
    username: 'teacher2_test',
    email: 'teacher2_test@srividya.edu.in',
    password: passwordHash,
    fullName: 'Vikram Joshi',
    role: 'TEACHER',
    assignedClasses: [
      { class: '9', section: 'B', subject: 'Science' },
    ],
  });

  const studentDoc1 = await Student.create({
    admissionNo: 'ADM-TEST-1001',
    fullName: 'Rahul Sharma',
    gender: 'male',
    class: '10',
    section: 'A',
    rollNo: '1001',
    parentName: 'Mr. Rajesh Sharma',
    parentPhone: '9876543210',
    parentUser: parent1User._id,
    user: student1User._id,
    attendancePercentage: 92,
  });

  const studentDoc2 = await Student.create({
    admissionNo: 'ADM-TEST-8001',
    fullName: 'Priya Verma',
    gender: 'female',
    class: '8',
    section: 'C',
    rollNo: '8001',
    parentName: 'Mrs. Sunita Verma',
    parentPhone: '9876543211',
    parentUser: parent2User._id,
    user: student2User._id,
    attendancePercentage: 88,
  });

  await User.updateOne({ _id: parent1User._id }, { $set: { children: [student1User._id, studentDoc1._id] } });
  await User.updateOne({ _id: parent2User._id }, { $set: { children: [student2User._id, studentDoc2._id] } });

  const teacherDoc1 = await Teacher.create({
    employeeId: 'EMP-T1001',
    fullName: 'Ananya Rao',
    gender: 'female',
    email: 'teacher1_test@srividya.edu.in',
    phone: '9876543220',
    user: teacher1User._id,
    assignedClasses: [
      { class: '10', section: 'A', subject: 'Mathematics', isClassTeacher: true },
    ],
    assignedSubjects: ['Mathematics'],
  });

  const teacherDoc2 = await Teacher.create({
    employeeId: 'EMP-T2002',
    fullName: 'Vikram Joshi',
    gender: 'male',
    email: 'teacher2_test@srividya.edu.in',
    phone: '9876543221',
    user: teacher2User._id,
    assignedClasses: [
      { class: '9', section: 'B', subject: 'Science', isClassTeacher: false },
    ],
    assignedSubjects: ['Science'],
  });

  const tokens = {
    superAdmin: generateToken(superAdmin),
    principal: generateToken(principal),
    office: generateToken(office),
    teacher1: generateToken(teacher1User),
    teacher2: generateToken(teacher2User),
    student1: generateToken(student1User),
    student2: generateToken(student2User),
    parent1: generateToken(parent1User),
    parent2: generateToken(parent2User),
  };

  return {
    users: {
      superAdmin,
      principal,
      office,
      teacher1User,
      teacher2User,
      student1User,
      student2User,
      parent1User,
      parent2User,
    },
    students: {
      studentDoc1,
      studentDoc2,
    },
    teachers: {
      teacherDoc1,
      teacherDoc2,
    },
    tokens,
  };
};

module.exports = {
  JWT_SECRET,
  generateToken,
  generateExpiredToken,
  generateInvalidToken,
  resetCollections,
  seedBaseUsers,
};
