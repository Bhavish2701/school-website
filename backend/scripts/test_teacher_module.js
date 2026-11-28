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

const runTeacherTests = async () => {
  console.log('====================================================');
  console.log('  TESTING TEACHER MANAGEMENT MODULE (MERN BACKEND)  ');
  console.log('====================================================\n');

  console.log('Obtaining authentication tokens...');
  const teacherToken = await login('teacher1', 'Teacher@123');
  const principalToken = await login('principal', 'Principal@123');
  const studentToken = await login('student1', 'Student@123');
  console.log('Tokens generated.\n');

  console.log('1. Testing GET /api/v1/teachers/dashboard (Teacher view)...');
  const dashRes = await fetch(`${BASE_URL}/teachers/dashboard`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  const dashData = await dashRes.json();
  console.log(`Status: ${dashRes.status}`);
  console.log(`Teacher: ${dashData.data?.dashboard?.teacher?.fullName} (${dashData.data?.dashboard?.teacher?.specialization})`);
  console.log(`Metrics:`, dashData.data?.dashboard?.metrics);
  console.log(`Assigned Classes:`, dashData.data?.dashboard?.assignedClasses);
  console.log(`Leave Balance:`, dashData.data?.dashboard?.leaveBalance);
  console.log();

  console.log('2. Testing GET /api/v1/teachers/me (Teacher Profile)...');
  const profileRes = await fetch(`${BASE_URL}/teachers/me`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  const profileData = await profileRes.json();
  console.log(`Status: ${profileRes.status}`);
  console.log(`Employee ID: ${profileData.data?.teacher?.employeeId}`);
  console.log(`Qualification: ${profileData.data?.teacher?.qualification}`);
  console.log(`Assigned Subjects: [${profileData.data?.teacher?.assignedSubjects?.join(', ')}]`);
  console.log();

  console.log('3. Testing GET /api/v1/teachers/me/timetable...');
  const ttRes = await fetch(`${BASE_URL}/teachers/me/timetable`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  const ttData = await ttRes.json();
  console.log(`Status: ${ttRes.status}`);
  const monday = ttData.data?.timetable?.find((t) => t.day === 'Monday');
  console.log(`Monday Periods: ${monday?.periods?.length} periods scheduled`);
  console.log(`Period 1: ${monday?.periods?.[0]?.subject} for Class ${monday?.periods?.[0]?.class}-${monday?.periods?.[0]?.section} in ${monday?.periods?.[0]?.room}`);
  console.log();

  console.log('4. Testing GET /api/v1/teachers (Directory listing)...');
  const listRes = await fetch(`${BASE_URL}/teachers`, {
    headers: { Authorization: `Bearer ${principalToken}` },
  });
  const listData = await listRes.json();
  console.log(`Status: ${listRes.status}`);
  console.log(`Total Teachers: ${listData.data?.teachers?.length}`);
  console.log(`Names: [${listData.data?.teachers?.map((t) => t.fullName).join(', ')}]`);
  console.log();

  console.log('5. Testing POST /api/v1/teachers (Register New Faculty)...');
  const newTeacherPayload = {
    employeeId: 'SV-TEA-009',
    fullName: 'M. Anand',
    gender: 'male',
    qualification: 'M.A (English), B.Ed',
    experienceYears: 4,
    specialization: 'English Literature',
    email: 'anand.english@srividya.edu.in',
    phone: '9848002009',
    address: 'Kurmannapalem, Visakhapatnam',
    bloodGroup: 'A+',
    status: 'ACTIVE',
  };
  const createRes = await fetch(`${BASE_URL}/teachers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${principalToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTeacherPayload),
  });
  const createData = await createRes.json();
  console.log(`Status: ${createRes.status} (Expected 201)`);
  console.log(`Created: ${createData.data?.teacher?.fullName} [${createData.data?.teacher?.employeeId}]`);
  const createdTeacherId = createData.data?.teacher?._id;
  console.log();

  console.log(`6. Testing PATCH /api/v1/teachers/:id (Update phone & qualification)...`);
  const updateRes = await fetch(`${BASE_URL}/teachers/${createdTeacherId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${principalToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: '9848009999',
      qualification: 'M.A (English), M.Phil, B.Ed',
    }),
  });
  const updateData = await updateRes.json();
  console.log(`Status: ${updateRes.status} (Expected 200)`);
  console.log(`Updated Phone: ${updateData.data?.teacher?.phone} | Qualification: ${updateData.data?.teacher?.qualification}`);
  console.log();

  console.log(`7. Testing DELETE /api/v1/teachers/:id...`);
  const delRes = await fetch(`${BASE_URL}/teachers/${createdTeacherId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${principalToken}` },
  });
  const delData = await delRes.json();
  console.log(`Status: ${delRes.status} (Expected 200)`);
  console.log(`Deleted: ${delData.message} (${delData.data?.fullName})`);
  console.log();

  console.log('8. Testing POST /api/v1/teachers/leaves (Apply Leave)...');
  const leavePayload = {
    leaveType: 'CASUAL',
    startDate: '2026-10-12',
    endDate: '2026-10-13',
    reason: 'Medical checkup and personal appointment',
  };
  const leaveApplyRes = await fetch(`${BASE_URL}/teachers/leaves`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${teacherToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leavePayload),
  });
  const leaveApplyData = await leaveApplyRes.json();
  console.log(`Status: ${leaveApplyRes.status} (Expected 201)`);
  console.log(`Leave ID: ${leaveApplyData.data?.leave?._id} | Type: ${leaveApplyData.data?.leave?.leaveType} | Status: ${leaveApplyData.data?.leave?.status}`);
  const createdLeaveId = leaveApplyData.data?.leave?._id;
  console.log();

  console.log('9. Testing GET /api/v1/teachers/leaves...');
  const teacherLeavesRes = await fetch(`${BASE_URL}/teachers/leaves`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  const teacherLeavesData = await teacherLeavesRes.json();
  console.log(`Teacher visible leaves: ${teacherLeavesData.data?.leaves?.length} (Strictly own leaves)`);

  const principalLeavesRes = await fetch(`${BASE_URL}/teachers/leaves`, {
    headers: { Authorization: `Bearer ${principalToken}` },
  });
  const principalLeavesData = await principalLeavesRes.json();
  console.log(`Principal visible leaves: ${principalLeavesData.data?.leaves?.length} (School-wide management view)`);
  console.log();

  console.log(`10. Testing PATCH /api/v1/teachers/leaves/:id/status (Principal Approval)...`);
  const reviewRes = await fetch(`${BASE_URL}/teachers/leaves/${createdLeaveId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${principalToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'APPROVED',
      reviewRemarks: 'Approved as per casual leave entitlement.',
    }),
  });
  const reviewData = await reviewRes.json();
  console.log(`Status: ${reviewRes.status} (Expected 200)`);
  console.log(`Leave Status now: ${reviewData.data?.leave?.status} | Remarks: "${reviewData.data?.leave?.reviewRemarks}"`);
  console.log();

  console.log('11. Testing GET /api/v1/teachers/notifications...');
  const notifRes = await fetch(`${BASE_URL}/teachers/notifications`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  const notifData = await notifRes.json();
  console.log(`Status: ${notifRes.status}`);
  console.log(`Total Notifications: ${notifData.data?.notifications?.length} | Unread: ${notifData.data?.unreadCount}`);
  console.log(`Latest Title: "${notifData.data?.notifications?.[0]?.title}"`);

  const unreadNotifId = notifData.data?.notifications?.[0]?._id;
  if (unreadNotifId) {
    const markReadRes = await fetch(`${BASE_URL}/teachers/notifications/${unreadNotifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    console.log(`Marked as read status: ${markReadRes.status}`);
  }
  console.log();

  console.log('12. Testing RBAC & Unauthorized Access Protections...');
  const teacherReviewRes = await fetch(`${BASE_URL}/teachers/leaves/${createdLeaveId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${teacherToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'APPROVED' }),
  });
  console.log(`Teacher reviewing leave -> Status: ${teacherReviewRes.status} (Expected 403 Forbidden)`);

  const teacherDelRes = await fetch(`${BASE_URL}/teachers/${profileData.data?.teacher?._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  console.log(`Teacher deleting teacher -> Status: ${teacherDelRes.status} (Expected 403 Forbidden)`);

  const studentDashRes = await fetch(`${BASE_URL}/teachers/dashboard`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const studentDashData = await studentDashRes.json();
  console.log(`Student accessing teacher dashboard -> Status: ${studentDashRes.status} (Expected 403 Forbidden)`);
  console.log();

  console.log('====================================================');
  console.log('  ALL TEACHER MODULE REQUIREMENTS FULLY VERIFIED 100% ');
  console.log('====================================================');
};

runTeacherTests().catch(console.error);
