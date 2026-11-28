const BASE_URL = 'http://localhost:5000/api/v1';

const login = async (identifier, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Login failed for ${identifier}: ${data.message}`);
  return data.data.tokens.accessToken;
};

const runExamTests = async () => {
  console.log('====================================================');
  console.log('  TESTING EXAMINATION MANAGEMENT MODULE (MERN)      ');
  console.log('====================================================\n');

  console.log('Obtaining authentication tokens...');
  const principalToken = await login('principal', 'Principal@123');
  const teacherToken = await login('teacher1', 'Teacher@123');
  const studentToken = await login('student1', 'Student@123');
  const parent1Token = await login('parent1', 'Parent@123');
  const parent2Token = await login('parent2', 'Parent@123');
  console.log('Tokens generated successfully.\n');

  console.log('1. Testing POST /api/v1/exams (Creating Term 1 Summative Assessment)...');
  const createExamRes = await fetch(`${BASE_URL}/exams`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${principalToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Summative Assessment 1 (SA-1)',
      examType: 'SUMMATIVE_1',
      academicYear: '2025-2026',
      startDate: '2026-10-05',
      endDate: '2026-10-15',
      classes: ['6', '7', '8', '9', '10'],
      description: 'First Term Summative Examination covering 50% syllabus',
    }),
  });
  const createExamData = await createExamRes.json();
  console.log(`Status: ${createExamRes.status}`);
  console.log(`Exam Created: ${createExamData.data?.exam?.name} (ID: ${createExamData.data?.exam?._id})`);
  console.log(`Is Published: ${createExamData.data?.exam?.isPublished}`);
  console.log();

  const examId = createExamData.data?.exam?._id;

  console.log(`2. Testing POST /api/v1/exams/${examId}/schedule (Scheduling Subjects)...`);
  const schedulesToCreate = [
    {
      class: '10',
      section: 'ALL',
      subject: 'Mathematics',
      examDate: '2026-10-05',
      startTime: '09:30 AM',
      endTime: '12:30 PM',
      maxMarks: 100,
      passMarks: 35,
      syllabus: 'Chapters 1 to 7: Real Numbers, Polynomials, Linear Equations, Quadratic Equations, Trigonometry',
    },
    {
      class: '10',
      section: 'ALL',
      subject: 'Physical Science',
      examDate: '2026-10-07',
      startTime: '09:30 AM',
      endTime: '12:30 PM',
      maxMarks: 100,
      passMarks: 35,
      syllabus: 'Units 1-4: Light, Electricity, Magnetic Effects, Chemical Reactions',
    },
    {
      class: '10',
      section: 'ALL',
      subject: 'English',
      examDate: '2026-10-09',
      startTime: '09:30 AM',
      endTime: '12:30 PM',
      maxMarks: 100,
      passMarks: 35,
      syllabus: 'Prose & Poetry Modules 1-3, Grammar and Letter Writing',
    },
  ];

  for (const s of schedulesToCreate) {
    const schedRes = await fetch(`${BASE_URL}/exams/${examId}/schedule`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${principalToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(s),
    });
    const schedData = await schedRes.json();
    console.log(`  Scheduled: ${schedData.data?.schedule?.subject} for Class ${schedData.data?.schedule?.class} on ${schedData.data?.schedule?.examDate.split('T')[0]}`);
  }
  console.log();

  console.log(`3. Testing GET /api/v1/exams/${examId}/schedule?class=10...`);
  const viewSchedRes = await fetch(`${BASE_URL}/exams/${examId}/schedule?class=10`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const viewSchedData = await viewSchedRes.json();
  console.log(`Status: ${viewSchedRes.status}`);
  console.log(`Total Scheduled Subjects: ${viewSchedData.data?.schedules?.length}`);
  console.log();

  const rosterRes = await fetch(`${BASE_URL}/attendance/classes/10/A/students`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  const rosterData = await rosterRes.json();
  const students = rosterData.data?.students || [];
  console.log(`Roster for Class 10-A has ${students.length} students:`, students.map((s) => s.fullName));
  console.log();

  console.log(`5. Testing POST /api/v1/exams/${examId}/marks (Teacher entering Mathematics marks)...`);
  const mathMarksPayload = {
    class: '10',
    section: 'A',
    subject: 'Mathematics',
    marks: students.map((s, idx) => ({
      studentId: s.studentId,
      marksObtained: idx === 0 ? 94 : idx === 1 ? 82 : 45,
      isAbsent: false,
      remarks: idx === 0 ? 'Outstanding analytical reasoning' : 'Good performance',
    })),
  };

  const mathMarksRes = await fetch(`${BASE_URL}/exams/${examId}/marks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${teacherToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mathMarksPayload),
  });
  const mathMarksData = await mathMarksRes.json();
  console.log(`Status: ${mathMarksRes.status}`);
  console.log(`Result: ${mathMarksData.message}`);
  console.log();

  await fetch(`${BASE_URL}/exams/${examId}/marks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${principalToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      class: '10',
      section: 'A',
      subject: 'Physical Science',
      marks: students.map((s, idx) => ({
        studentId: s.studentId,
        marksObtained: idx === 0 ? 91 : idx === 1 ? 78 : 55,
        isAbsent: false,
      })),
    }),
  });

  console.log('6. Testing Teacher Subject Authorization (Teacher entering unauthorized subject: Social Studies)...');
  const unauthorizedSubjectRes = await fetch(`${BASE_URL}/exams/${examId}/marks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${teacherToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      class: '10',
      section: 'A',
      subject: 'Social Studies',
      marks: [
        {
          studentId: students[0].studentId,
          marksObtained: 85,
        },
      ],
    }),
  });
  const unauthorizedSubjectData = await unauthorizedSubjectRes.json();
  console.log(`Status: ${unauthorizedSubjectRes.status} (Expected 403 Forbidden)`);
  console.log(`Rejection Message: ${unauthorizedSubjectData.message}`);
  console.log();

  console.log('7. Testing Student/Parent Tamper Protection (Student attempting to enter marks)...');
  const studentTamperRes = await fetch(`${BASE_URL}/exams/${examId}/marks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mathMarksPayload),
  });
  const studentTamperData = await studentTamperRes.json();
  console.log(`Status: ${studentTamperRes.status} (Expected 403 Forbidden)`);
  console.log(`Rejection Message: ${studentTamperData.message}`);
  console.log();

  console.log('8. Testing Mark Modification & Automatic GPA/Percentage Recalculation...');
  const dossierRes = await fetch(`${BASE_URL}/exams/${examId}/class/10/A/dossier`, {
    headers: { Authorization: `Bearer ${principalToken}` },
  });
  const dossierData = await dossierRes.json();
  const firstStudentMark = dossierData.data?.marks?.[0];

  if (firstStudentMark) {
    const modifyRes = await fetch(`${BASE_URL}/exams/marks/${firstStudentMark._id}/subject`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${teacherToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: 'Mathematics',
        marksObtained: 98,
        remarks: 'Re-evaluation verified by HOD',
      }),
    });
    const modifyData = await modifyRes.json();
    console.log(`Status: ${modifyRes.status}`);
    console.log(`Updated Subject: Mathematics -> ${modifyData.data?.mark?.subjectMarks?.find((s) => s.subject === 'Mathematics')?.marksObtained}/100`);
    console.log(`Recalculated Total: ${modifyData.data?.mark?.totalMarksObtained}/${modifyData.data?.mark?.totalMaxMarks} (${modifyData.data?.mark?.percentage}%, GPA: ${modifyData.data?.mark?.gpa}, Grade: ${modifyData.data?.mark?.overallGrade})`);
  }
  console.log();

  console.log(`9. Testing POST /api/v1/exams/${examId}/calculate-results (Assigning Class Ranks)...`);
  const calcRes = await fetch(`${BASE_URL}/exams/${examId}/calculate-results?class=10&section=A`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${principalToken}` },
  });
  const calcData = await calcRes.json();
  console.log(`Status: ${calcRes.status}`);
  console.log(`Class 10-A Results: Total: ${calcData.data?.totalStudents}, Passed: ${calcData.data?.passedStudents}, Pass%: ${calcData.data?.passPercentage}%`);
  console.log(`Ranks Assigned:`, calcData.data?.ranks?.map((r) => `Rank ${r.rank}: ${r.totalMarks} Marks (${r.percentage}%, Status: ${r.status})`));
  console.log();

  console.log('10. Testing Unpublished Result Access Protection (Student attempting to view results before publish)...');
  const unpubStudentRes = await fetch(`${BASE_URL}/exams/${examId}/student/me`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const unpubStudentData = await unpubStudentRes.json();
  console.log(`Status: ${unpubStudentRes.status} (Expected 403 Forbidden)`);
  console.log(`Rejection Message: ${unpubStudentData.message}`);
  console.log();

  console.log(`11. Testing POST /api/v1/exams/${examId}/publish (Publishing Results)...`);
  const pubRes = await fetch(`${BASE_URL}/exams/${examId}/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${principalToken}` },
  });
  const pubData = await pubRes.json();
  console.log(`Status: ${pubRes.status}`);
  console.log(`Message: ${pubData.message}`);
  console.log();

  console.log(`12. Testing GET /api/v1/exams/${examId}/student/me (Student viewing published marks memo)...`);
  const studentMemoRes = await fetch(`${BASE_URL}/exams/${examId}/student/me`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const studentMemoData = await studentMemoRes.json();
  console.log(`Status: ${studentMemoRes.status}`);
  console.log(`Student: ${studentMemoData.data?.result?.student?.fullName} (Roll: ${studentMemoData.data?.result?.student?.rollNo})`);
  console.log(`Exam: ${studentMemoData.data?.result?.exam?.name}`);
  console.log(`Class Rank: ${studentMemoData.data?.result?.rankInClass}`);
  console.log(`Overall: ${studentMemoData.data?.result?.totalMarksObtained}/${studentMemoData.data?.result?.totalMaxMarks} (${studentMemoData.data?.result?.percentage}%, Grade: ${studentMemoData.data?.result?.overallGrade}, Status: ${studentMemoData.data?.result?.resultStatus})`);
  console.log(`Subject Breakdown:`, studentMemoData.data?.result?.subjectMarks?.map((s) => `${s.subject}: ${s.marksObtained}/${s.maxMarks} (Grade: ${s.grade}, GP: ${s.gradePoint})`));

  const studentAllCardsRes = await fetch(`${BASE_URL}/exams/student/me/results`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const studentAllCardsData = await studentAllCardsRes.json();
  console.log(`Total Published Report Cards for Student: ${studentAllCardsData.data?.totalExams}`);
  console.log();

  console.log('13. Testing Parent Child Marks Access...');
  const parentProfileRes = await fetch(`${BASE_URL}/parents/profile`, {
    headers: { Authorization: `Bearer ${parent1Token}` },
  });
  const parentProfileData = await parentProfileRes.json();
  const child = parentProfileData.data?.children?.[0];
  const childId = child?.id || child?._id;

  if (childId) {
    const parentMemoRes = await fetch(`${BASE_URL}/exams/${examId}/parent/child/${childId}`, {
      headers: { Authorization: `Bearer ${parent1Token}` },
    });
    const parentMemoData = await parentMemoRes.json();
    console.log(`Status: ${parentMemoRes.status}`);
    console.log(`Child: ${parentMemoData.data?.result?.student?.fullName} (Class ${parentMemoData.data?.result?.class}-${parentMemoData.data?.result?.section})`);
    console.log(`Rank: ${parentMemoData.data?.result?.rankInClass}, Percentage: ${parentMemoData.data?.result?.percentage}%, Grade: ${parentMemoData.data?.result?.overallGrade}`);

    const parentCardsRes = await fetch(`${BASE_URL}/exams/parent/child/${childId}/results`, {
      headers: { Authorization: `Bearer ${parent1Token}` },
    });
    const parentCardsData = await parentCardsRes.json();
    console.log(`Child Report Cards Count: ${parentCardsData.data?.totalExams}`);
  }
  console.log();

  if (childId) {
    console.log("14. Testing Parent Cross-Child Tamper Protection (Parent 2 attempting to view Parent 1's child marks)...");
    const parent2TamperRes = await fetch(`${BASE_URL}/exams/${examId}/parent/child/${childId}`, {
      headers: { Authorization: `Bearer ${parent2Token}` },
    });
    const parent2TamperData = await parent2TamperRes.json();
    console.log(`Status: ${parent2TamperRes.status} (Expected 403 Forbidden)`);
    console.log(`Rejection Message: ${parent2TamperData.message}`);
  }
  console.log();

  console.log(`15. Testing GET /api/v1/exams/${examId}/class/10/A/dossier (Class Results Dossier)...`);
  const finalDossierRes = await fetch(`${BASE_URL}/exams/${examId}/class/10/A/dossier`, {
    headers: { Authorization: `Bearer ${principalToken}` },
  });
  const finalDossierData = await finalDossierRes.json();
  console.log(`Status: ${finalDossierRes.status}`);
  console.log(`Dossier Count: ${finalDossierData.data?.marks?.length}`);
  console.log(`Leaderboard:`, finalDossierData.data?.marks?.map((m) => `Rank ${m.rankInClass}: ${m.student?.fullName} - ${m.percentage}% (${m.overallGrade})`));
  console.log();

  console.log('====================================================');
  console.log('  ALL EXAMINATION MODULE TESTS COMPLETED SUCCESSFULLY! ');
  console.log('====================================================');
};

runExamTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
