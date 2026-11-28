const path = require('path');
process.env.NODE_PATH = path.join(__dirname, '../backend/node_modules');
require('module').Module._initPaths();

const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const token = jwt.sign(
  { id: '6ade5ef0e346878b9e172e62', role: 'PRINCIPAL' },
  process.env.JWT_SECRET || 'dev_jwt_fallback_secret_key_2026',
  { expiresIn: '1h' }
);

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

function apiPost(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request('http://localhost:5000' + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Content-Length': Buffer.byteLength(postData)
      }
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

function apiPatch(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request('http://localhost:5000' + path, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Content-Length': Buffer.byteLength(postData)
      }
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

async function testAdmissionWorkflow() {
  console.log('--- ADMISSION TO ENROLMENT SYNC TEST ---');

  const admRes = await apiGet('/api/v1/admissions');
  const app = admRes.body.data.applications[0];
  console.log('Target Application:', app.applicationNumber, app.studentName, 'Status:', app.status);

  const patchRes = await apiPatch('/api/v1/admissions/' + app._id + '/status', {
    status: 'APPROVED',
    remarks: 'Documents verified and eligible for enrolment'
  });
  console.log('Approve Status Change:', patchRes.status, 'Success:', patchRes.body?.success);

  const nextAdmNo = 'SV-' + String(Date.now()).slice(-4);
  const enrollRes = await apiPost('/api/v1/admissions/' + app._id + '/enroll', {
    admissionNo: nextAdmNo,
    allocatedClass: app.applyingClass || '7',
    allocatedSection: 'A',
    rollNo: '702'
  });
  console.log('Enrollment API Response:', enrollRes.status, 'Success:', enrollRes.body?.success);

  const mgmt = await apiGet('/api/v1/dashboard/management');
  console.log('Updated Dashboard Student Count:', mgmt.body.data.studentCount);
  console.log('Updated Dashboard Pending Approvals:', mgmt.body.data.approvals.totalPending);
}

testAdmissionWorkflow().catch(console.error);
