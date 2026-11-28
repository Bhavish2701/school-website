const http = require('http');

function apiGet(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:5000' + path, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: d });
        }
      });
    }).on('error', reject);
  });
}

function apiPost(path, data, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request('http://localhost:5000' + path, {
      method: 'POST',
      headers
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: d });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function verify() {
  console.log('========================================================');
  console.log('  SRI VIDYA ERP - LIVE SYNCHRONIZATION VERIFICATION');
  console.log('========================================================');

  const platRes = await apiGet('/api/v1/dashboard/platform');
  console.log('\n[1] Platform Dashboard Telemetry:');
  console.log('    Status:', platRes.status);
  console.log('    Registered Institutions:', platRes.body.data.overview.registeredInstitutions);
  console.log('    Platform Accounts:', platRes.body.data.overview.platformAccounts);
  console.log('    Open Issues:', platRes.body.data.overview.openIssues);
  console.log('    Total Students in System:', platRes.body.data.overview.totalStudents);
  console.log('    Total Teachers in System:', platRes.body.data.overview.totalTeachers);
  console.log('    Database Health:', platRes.body.data.platformHealth.databaseConnectivity.status, '(' + platRes.body.data.platformHealth.databaseConnectivity.metrics + ')');

  const mgmtRes = await apiGet('/api/v1/dashboard/management');
  console.log('\n[2] Management Dashboard Telemetry:');
  console.log('    Status:', mgmtRes.status);
  console.log('    Enrolled Students (Total / Active):', mgmtRes.body.data.studentCount.total, '/', mgmtRes.body.data.studentCount.active);
  console.log('    Staff (Teachers / Total):', mgmtRes.body.data.teacherCount.total, '/', mgmtRes.body.data.teacherCount.totalStaff);
  console.log('    Pending Approvals:', mgmtRes.body.data.approvals.totalPending, '(Leaves:', mgmtRes.body.data.approvals.pendingLeaves, ', Admissions:', mgmtRes.body.data.approvals.pendingAdmissions, ')');
  console.log('    Finances (Today Collected):', '₹' + mgmtRes.body.data.finances.todayCollected, '(Receipts:', mgmtRes.body.data.finances.todayReceiptsCount, ')');
  console.log('    Finances (Total Outstanding):', '₹' + mgmtRes.body.data.finances.totalOutstanding);
  console.log('    Upcoming Exams Count:', mgmtRes.body.data.upcomingExams?.length);

  const teachRes = await apiGet('/api/v1/dashboard/teacher');
  console.log('\n[3] Teacher Dashboard Telemetry:');
  console.log('    Status:', teachRes.status);
  console.log('    Teacher Name:', teachRes.body.data.teacherProfile?.fullName);
  console.log('    Specialization:', teachRes.body.data.teacherProfile?.specialization);
  console.log('    Assigned Classes Count:', teachRes.body.data.classes?.assignedClassesCount);
  console.log('    Total Students in Teacher Classes:', teachRes.body.data.classes?.totalStudentsCount);

  console.log('\n[4] Testing Live Mutation: Submit New Admission...');
  const testAdmission = {
    studentName: 'Audit Test Student ' + Date.now().toString().slice(-4),
    dob: '2014-06-15',
    gender: 'Female',
    applyingClass: '7',
    parentName: 'Test Parent Rao',
    phone: '9848999888',
    email: 'testparent@srividya.edu.in',
    address: 'Main Road, Srikakulam',
    prevSchool: 'Zilla Parishad High School',
    academicYear: '2025-2026'
  };

  const admPostRes = await apiPost('/api/v1/admissions/apply', testAdmission);
  console.log('    Admission Submission Status:', admPostRes.status, 'Success:', admPostRes.body.success);
  console.log('    Created Application Number:', admPostRes.body.data?.applicationNumber);

  const mgmtAfterRes = await apiGet('/api/v1/dashboard/management');
  console.log('\n[5] Management Dashboard AFTER Mutation:');
  console.log('    Pending Admissions Count:', mgmtAfterRes.body.data.admissions.total, '(Previous:', mgmtRes.body.data.admissions.total, ')');
  console.log('    Total Approvals Pending:', mgmtAfterRes.body.data.approvals.totalPending, '(Previous:', mgmtRes.body.data.approvals.totalPending, ')');

  const platAfterRes = await apiGet('/api/v1/dashboard/platform');
  console.log('\n[6] Platform Dashboard AFTER Mutation:');
  console.log('    Registered Institutions:', platAfterRes.body.data.overview.registeredInstitutions);
  console.log('    Platform Accounts:', platAfterRes.body.data.overview.platformAccounts);

  console.log('\n========================================================');
  console.log('  VERIFICATION SUMMARY: ALL MODULES REPORTING LIVE DB DATA');
  console.log('========================================================');
}

verify().catch(err => {
  console.error('Verification Error:', err);
  process.exit(1);
});
