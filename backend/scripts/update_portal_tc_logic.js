const fs = require('fs');
const path = require('path');

const portalJsPath = path.join(__dirname, '../../frontend/js/portal.js');
let code = fs.readFileSync(portalJsPath, 'utf8');

// Find boundaries of updateTCPrintableSheet, printExitTC and downloadExitTCPdf
const startMarker = 'function updateTCPrintableSheet() {';
const endMarker = 'function submitStudentTransfer(e) {';

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not locate TC sheet functions in portal.js');
  process.exit(1);
}

const newFunctions = `function updateTCPrintableSheet() {
    if (!currentExitRecord) return;
    const student = (state.students || []).find(s => s.admNo === currentExitRecord.admissionNo) || {
      admNo: currentExitRecord.admissionNo || 'SV-0001',
      name: currentExitRecord.studentName || 'RK. Sunil',
      class: 'X',
      section: 'A',
      rollNo: '1001',
      parent: currentExitRecord.parentName || 'S. Mohan Rao',
      motherName: 'S. Parvathi',
      dob: '15-06-2011',
      dobWords: 'Fifteenth June Two Thousand Eleven',
      aadhaar: '4357-8410-9235',
      nationality: 'Indian',
      religion: 'Hindu',
      motherTongue: 'Telugu',
      category: 'General / OC (Open Category)',
      penNo: '12059048123'
    };

    // Determine Official vs Approval Status
    const isApprovedOrCompleted = (
      currentExitRecord.status === 'Approved' ||
      currentExitRecord.status === 'TC Generated' ||
      currentExitRecord.status === 'Completed' ||
      (currentExitRecord.approval && currentExitRecord.approval.status === 'Approved')
    );

    let tcNo = '';
    if (currentExitRecord.transferCertificate && currentExitRecord.transferCertificate.tcNumber) {
      tcNo = currentExitRecord.transferCertificate.tcNumber;
    } else if (isApprovedOrCompleted) {
      tcNo = 'SV/TC/2026/' + String(currentExitRecord.admissionNo || '0001').replace(/[^\\d]/g, '').padStart(4, '0');
      if (currentExitRecord.transferCertificate) {
        currentExitRecord.transferCertificate.tcNumber = tcNo;
      }
    } else {
      tcNo = 'AUTHORIZATION PENDING (NOT YET ISSUED)';
    }

    const issueDate = (currentExitRecord.transferCertificate && currentExitRecord.transferCertificate.issueDate) || new Date().toISOString().split('T')[0];
    const leavingDate = currentExitRecord.officialLeavingDate || new Date().toISOString().split('T')[0];
    const reason = currentExitRecord.reason || 'Parent Job Transfer / Family Relocation';
    const conduct = (currentExitRecord.conductEvaluation && currentExitRecord.conductEvaluation.rating) || 'Exemplary';
    const penNo = student.penNo || student.studentId || ('PEN-' + student.admNo);
    const aadhaarFormatted = student.aadhaar ? student.aadhaar.replace(/(\\d{4})(?=\\d)/g, '$1-') : '4357-8410-9235';

    // 1. Metadata 4-pillar bar
    const serialEl = document.getElementById('tcDocSerial');
    if (serialEl) {
      serialEl.textContent = tcNo;
      if (!isApprovedOrCompleted) {
        serialEl.className = 'tc-meta-val text-warning font-monospace';
      } else {
        serialEl.className = 'tc-meta-val text-primary font-monospace';
      }
    }
    if (document.getElementById('tcDocAdmNo')) document.getElementById('tcDocAdmNo').textContent = student.admNo;
    if (document.getElementById('tcDocPenNo')) document.getElementById('tcDocPenNo').textContent = penNo;
    if (document.getElementById('tcDocIssueDate')) document.getElementById('tcDocIssueDate').textContent = issueDate;

    // 2. Student & Parent Information
    if (document.getElementById('tcDocStudentName')) document.getElementById('tcDocStudentName').textContent = (student.name || 'RK. Sunil').toUpperCase();
    if (document.getElementById('tcDocAadhaar')) document.getElementById('tcDocAadhaar').textContent = aadhaarFormatted;
    if (document.getElementById('tcDocFatherName')) document.getElementById('tcDocFatherName').textContent = currentExitRecord.parentName || student.parent || 'Sri S. Mohan Rao';
    if (document.getElementById('tcDocMotherName')) document.getElementById('tcDocMotherName').textContent = student.motherName || 'Smt. S. Parvathi';
    if (document.getElementById('tcDocNationalityReligion')) {
      document.getElementById('tcDocNationalityReligion').textContent = (student.nationality || 'Indian') + ' • ' + (student.religion || 'Hindu') + ' • Mother Tongue: ' + (student.motherTongue || 'Telugu');
    }
    if (document.getElementById('tcDocCasteCategory')) {
      document.getElementById('tcDocCasteCategory').textContent = student.category || student.caste || 'General / OC (Open Category)';
    }

    // 3. DOB, Class, Medium & Subjects
    if (document.getElementById('tcDocDob')) {
      const dobVal = student.dob || '15-06-2011';
      const dobWords = student.dobWords || 'Fifteenth June Two Thousand Eleven';
      document.getElementById('tcDocDob').textContent = \`\${dobVal} (\${dobWords})\`;
    }
    if (document.getElementById('tcDocClass')) {
      const cls = student.class || 'X';
      const sec = student.section || 'A';
      const clsWords = cls === 'X' ? 'Tenth Standard' : (cls === 'IX' ? 'Ninth Standard' : \`Class \${cls}\`);
      document.getElementById('tcDocClass').textContent = \`Class \${cls} (\${clsWords}) – Section \${sec}\`;
    }
    if (document.getElementById('tcDocMedium')) {
      document.getElementById('tcDocMedium').textContent = 'English Medium';
    }
    if (document.getElementById('tcDocSubjects')) {
      document.getElementById('tcDocSubjects').textContent = '1. Telugu (First Lang), 2. Hindi (Second Lang), 3. English (Third Lang), 4. Mathematics, 5. General Science, 6. Social Studies';
    }

    // 4. Academic Standing, Fees & Attendance
    if (document.getElementById('tcDocPromotion')) {
      const nextClass = student.class === 'X' ? 'Class XI / Intermediate 1st Year' : \`Class \${Number(student.class) + 1 || 'Next Higher Class'}\`;
      document.getElementById('tcDocPromotion').textContent = \`Yes, Qualified for Promotion to Next Higher Class (\${nextClass})\`;
    }
    if (document.getElementById('tcDocWorkingDays')) {
      document.getElementById('tcDocWorkingDays').textContent = '182 Working Days';
    }
    if (document.getElementById('tcDocLastAttendance')) {
      document.getElementById('tcDocLastAttendance').textContent = '172 Days (94.5% Attendance Standing)';
    }
    if (document.getElementById('tcDocFeeStatus')) {
      document.getElementById('tcDocFeeStatus').textContent = 'Yes, All Institutional Dues Settled in Full (Zero Dues Cleared)';
    }
    if (document.getElementById('tcDocConcession')) {
      document.getElementById('tcDocConcession').textContent = 'Nil (Standard Board Tariff Paid in Full)';
    }

    // 5. Leaving Details, Reason & Conduct
    if (document.getElementById('tcDocLeavingDate')) document.getElementById('tcDocLeavingDate').textContent = leavingDate;
    if (document.getElementById('tcDocAppDate')) document.getElementById('tcDocAppDate').textContent = currentExitRecord.requestDate || issueDate;
    if (document.getElementById('tcDocIssueDateRow')) document.getElementById('tcDocIssueDateRow').textContent = issueDate;
    if (document.getElementById('tcDocReason')) document.getElementById('tcDocReason').textContent = reason;
    if (document.getElementById('tcDocConduct')) {
      document.getElementById('tcDocConduct').textContent = conduct.toUpperCase() + ' • Satisfactory in All Respects';
    }

    // 6. Identification & Remarks
    if (document.getElementById('tcDocIdentification')) {
      const m1 = student.identificationMark1 || 'A small dark mole on the right side of neck below jawline';
      const m2 = student.identificationMark2 || 'A distinct birthmark on the left forearm';
      document.getElementById('tcDocIdentification').innerHTML = \`
        <div>(i) \${m1}</div>
        <div>(ii) \${m2}</div>
      \`;
    }
    if (document.getElementById('tcDocRemarks')) {
      document.getElementById('tcDocRemarks').textContent = 'Student record verified with General Admission Register Vol. 3, Page 142. All institutional library books, laboratory items and sports equipment surrendered.';
    }

    // 7. Security Hash & Dates
    const secHash = (isApprovedOrCompleted ? (tcNo.replace(/\\//g, '-') + '-AUTH') : ('SV-TC-PREVIEW-' + student.admNo)) + '-' + issueDate.replace(/-/g, '');
    if (document.getElementById('tcDocSecurityHash')) document.getElementById('tcDocSecurityHash').textContent = secHash;
    if (document.getElementById('tcDocSignDateClerk')) document.getElementById('tcDocSignDateClerk').textContent = issueDate;
    if (document.getElementById('tcDocSignDatePrinc')) document.getElementById('tcDocSignDatePrinc').textContent = issueDate;
  }

  function renderExitAuditTimeline() {
    const container = document.getElementById('tcAuditHistoryBody');
    if (!container || !currentExitRecord || !currentExitRecord.auditHistory) return;

    container.innerHTML = currentExitRecord.auditHistory.map(item => {
      return \`
        <div style="display:flex; gap:1rem; padding:0.75rem 0; border-bottom:1px solid #f1f5f9;">
          <div style="width:10px; height:10px; border-radius:50%; background:#214dd8; margin-top:5px; flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:700; font-size:0.88rem; color:#0f172a;">\${item.action || 'Audit Record'}</span>
              <span style="font-size:0.78rem; color:#64748b;">\${item.timestamp}</span>
            </div>
            <div style="font-size:0.82rem; color:#334155; margin-top:0.2rem;">\${item.remarks || ''}</div>
            <div style="font-size:0.75rem; color:#94a3b8; margin-top:0.15rem;">By: <strong>\${item.actor || 'System'}</strong> (\${item.role || 'user'})</div>
          </div>
        </div>
      \`;
    }).join('');
  }

  function printExitTC() {
    if (!currentExitRecord) {
      showToast('Error: No active student exit record selected.', 'error');
      return;
    }

    const isApproved = (
      currentExitRecord.status === 'Approved' ||
      currentExitRecord.status === 'TC Generated' ||
      currentExitRecord.status === 'Completed' ||
      (currentExitRecord.approval && currentExitRecord.approval.status === 'Approved')
    );

    if (!isApproved) {
      const confirmPrint = confirm(
        'Statutory Notice: This Transfer Certificate is in DRAFT/CLEARANCE status and has NOT yet received final Executive Principal approval.\\n\\nDo you wish to print an internal review copy stamped "DRAFT COPY FOR SCRUTINY ONLY"?'
      );
      if (!confirmPrint) return;
    }

    showToast('Preparing official Transfer Certificate printable sheet...', 'info');
    const printableContent = document.getElementById('printableExitTC');
    if (!printableContent) return;

    const studentName = document.getElementById('tcDocStudentName')?.textContent || 'STUDENT';
    const admNo = document.getElementById('tcDocAdmNo')?.textContent || 'SV-0001';
    const tcNo = document.getElementById('tcDocSerial')?.textContent || 'TC';

    const printWin = window.open('', '_blank', 'width=1000,height=900');
    if (!printWin) {
      showToast('Pop-up blocked: Please allow pop-ups to print the Transfer Certificate.', 'warning');
      return;
    }

    const draftWatermark = !isApproved ? \`
      <div style="position:fixed; top:45%; left:50%; transform:translate(-50%, -50%) rotate(-35deg); font-size:3.5rem; font-weight:900; color:rgba(220,38,38,0.18); border:4px dashed rgba(220,38,38,0.3); padding:10px 40px; pointer-events:none; z-index:9999; text-transform:uppercase; letter-spacing:4px; text-align:center;">
        DRAFT COPY &bull; SCRUTINY ONLY<br><span style="font-size:1.4rem;">NOT AN OFFICIAL ISSUED CERTIFICATE</span>
      </div>
    \` : '';

    printWin.document.write(\`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Transfer Certificate - \${admNo} - \${studentName}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=EB+Garamond:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 6mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              color: #0f172a;
              background: #ffffff;
              padding: 0;
              margin: 0;
            }
            .exit-tc-sheet-wrapper {
              background: #ffffff !important;
              padding: 0 !important;
              box-shadow: none !important;
            }
            .exit-tc-sheet {
              width: 100% !important;
              max-width: 100% !important;
              min-height: auto !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
            .exit-tc-outer-frame {
              border: 2.5px solid #1e3a8a !important;
              padding: 3px;
              border-radius: 3px;
            }
            .exit-tc-inner-frame {
              border: 1px solid #60a5fa !important;
              padding: 14px 18px 10px 18px !important;
              position: relative;
            }
            .tc-statutory-topline {
              display: flex;
              justify-content: space-between;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 4px;
              margin-bottom: 6px;
              font-size: 8.5pt;
              font-weight: 700;
              color: #1e3a8a;
            }
            .tc-statutory-badge {
              border: 1px solid #1e3a8a;
              padding: 1px 6px;
              border-radius: 3px;
              font-size: 7.5pt;
            }
            .tc-brand-grid {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 6px;
            }
            .tc-official-logo {
              width: 58px;
              height: 58px;
              border-radius: 50%;
              border: 1.5px solid #1e3a8a;
            }
            .tc-brand-center {
              flex: 1;
              text-align: center;
            }
            .tc-institution-name {
              font-family: 'Cinzel', serif;
              font-size: 14.5pt;
              font-weight: 900;
              color: #0b1d3a;
              margin-bottom: 2px;
            }
            .tc-recognition-text {
              font-size: 8.5pt;
              font-weight: 700;
              color: #1e3a8a;
            }
            .tc-campus-address {
              font-size: 8pt;
              color: #334155;
            }
            .tc-contact-line {
              font-size: 7.5pt;
              color: #475569;
            }
            .tc-statutory-numbers {
              display: flex;
              justify-content: center;
              gap: 6px;
              margin-top: 2px;
            }
            .tc-stat-pill {
              border: 1px solid #cbd5e1;
              padding: 1px 6px;
              border-radius: 2px;
              font-size: 7.5pt;
            }
            .tc-official-round-emblem {
              width: 54px;
              height: 54px;
              border: 1.5px dashed #1e3a8a;
              border-radius: 50%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: #1e3a8a;
              font-size: 10pt;
            }
            .tc-official-round-emblem span {
              font-size: 5pt;
              font-weight: 800;
            }
            .tc-header-separator {
              display: flex;
              align-items: center;
              gap: 6px;
              margin: 4px 0 6px 0;
            }
            .tc-sep-line {
              flex: 1;
              height: 1px;
              background: #1e3a8a;
            }
            .tc-sep-diamond {
              color: #1e3a8a;
              font-size: 8pt;
            }
            .tc-heading-section {
              text-align: center;
              margin-bottom: 6px;
            }
            .tc-doc-type {
              font-size: 7pt;
              font-weight: 800;
              color: #1e3a8a;
              letter-spacing: 1.5px;
            }
            .tc-heading-title {
              font-family: 'Cinzel', serif;
              font-size: 13.5pt;
              font-weight: 900;
              letter-spacing: 2.5px;
              color: #0b1d3a;
              border-bottom: 1.5px solid #1e3a8a;
              display: inline-block;
              padding: 0 14px 1px 14px;
              margin: 1px 0;
            }
            .tc-doc-rules {
              font-size: 7pt;
              color: #475569;
              font-style: italic;
            }
            .tc-metadata-four-pillar {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 6px;
              border: 1px solid #cbd5e1;
              background: #f8fafc;
              padding: 4px 8px;
              margin-bottom: 8px;
            }
            .tc-meta-box {
              display: flex;
              flex-direction: column;
            }
            .tc-meta-label {
              font-size: 6.5pt;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 700;
            }
            .tc-meta-val {
              font-size: 8.5pt;
              color: #0b1d3a;
              font-weight: 800;
            }
            .tc-particulars-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 8.2pt;
              line-height: 1.3;
            }
            .tc-particulars-table tr {
              border-bottom: 1px solid #e2e8f0;
            }
            .tc-col-idx {
              width: 22px;
              font-weight: 700;
              color: #1e3a8a;
              vertical-align: top;
              padding: 2.5px 1px;
              text-align: right;
            }
            .tc-col-field {
              width: 46%;
              font-weight: 600;
              color: #1e293b;
              vertical-align: top;
              padding: 2.5px 4px;
            }
            .tc-col-colon {
              width: 8px;
              font-weight: 700;
              color: #64748b;
              vertical-align: top;
              padding: 2.5px 1px;
              text-align: center;
            }
            .tc-col-data {
              width: 51%;
              vertical-align: top;
              padding: 2.5px 2px;
              font-weight: 600;
              color: #0f172a;
            }
            .tc-val-highlight {
              font-weight: 800;
              color: #0b1d3a;
            }
            .tc-aadhaar-pill {
              display: inline-flex;
              align-items: center;
              gap: 3px;
              border: 1px solid #cbd5e1;
              padding: 0 4px;
              border-radius: 2px;
              font-size: 7.5pt;
              margin-left: 6px;
            }
            .tc-statutory-declaration-box {
              border: 1px solid #bfdbfe;
              border-left: 3px solid #1e3a8a;
              background: #f8fafc;
              padding: 4px 8px;
              margin: 6px 0 8px 0;
              display: flex;
              gap: 6px;
              align-items: center;
            }
            .tc-declaration-icon {
              font-size: 10pt;
              color: #1e3a8a;
            }
            .tc-declaration-text {
              font-size: 7.2pt;
              font-style: italic;
              color: #1e293b;
              line-height: 1.3;
            }
            .tc-declaration-text strong {
              font-style: normal;
              display: block;
              color: #0b1d3a;
            }
            .tc-signatories-grid {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 8px;
              padding-top: 4px;
              border-top: 1px dashed #cbd5e1;
            }
            .tc-sign-column {
              width: 31%;
            }
            .tc-signature-space {
              height: 28px;
              display: flex;
              align-items: flex-end;
            }
            .tc-signed-name {
              font-family: 'EB Garamond', serif;
              font-size: 11pt;
              font-weight: 700;
              color: #1e3a8a;
            }
            .tc-signed-cursive {
              font-family: 'Cinzel', cursive;
              font-size: 10pt;
              font-weight: 800;
              color: #0b1d3a;
              font-style: italic;
            }
            .tc-signature-line {
              width: 100%;
              height: 1px;
              background: #334155;
              margin: 2px 0 3px 0;
            }
            .tc-sign-role {
              font-size: 7.5pt;
              font-weight: 800;
              color: #0b1d3a;
              display: block;
            }
            .tc-sign-title {
              font-size: 7.2pt;
              color: #1e293b;
            }
            .tc-sign-sub {
              font-size: 6.8pt;
              color: #64748b;
            }
            .tc-sign-date {
              font-size: 6.8pt;
              color: #475569;
              font-weight: 600;
            }
            .tc-circular-seal {
              width: 70px;
              height: 70px;
              border: 1.5px solid #1e3a8a;
              border-radius: 50%;
              margin: 0 auto;
              padding: 2px;
            }
            .tc-seal-inner-circle {
              width: 100%;
              height: 100%;
              border: 1px dashed #1e3a8a;
              border-radius: 50%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              color: #1e3a8a;
              font-size: 4pt;
              padding: 1px;
            }
            .tc-seal-school-name {
              font-size: 3.8pt;
              font-weight: 900;
            }
            .tc-seal-caption {
              font-size: 6.5pt;
              font-weight: 700;
              color: #64748b;
              margin-top: 2px;
            }
            .tc-footer-security-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid #cbd5e1;
              margin-top: 6px;
              padding-top: 4px;
              font-size: 6.5pt;
              color: #475569;
            }
            .tc-security-left {
              max-width: 62%;
              line-height: 1.25;
            }
            .tc-security-right {
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .tc-qr-badge {
              display: flex;
              align-items: center;
              gap: 4px;
              border: 1px solid #cbd5e1;
              padding: 2px 4px;
              border-radius: 2px;
            }
            .tc-qr-hash {
              font-family: monospace;
              font-size: 5.8pt;
              font-weight: 700;
              color: #0b1d3a;
            }
            .tc-original-tag {
              background: #0b1d3a;
              color: #fff;
              padding: 2px 5px;
              border-radius: 2px;
              font-size: 5.8pt;
              font-weight: 800;
            }
          </style>
        </head>
        <body>
          \${draftWatermark}
          <div class="tc-sheet">
            \${printableContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    \`);
    printWin.document.close();
  }

  function downloadExitTCPdf() {
    if (!currentExitRecord) {
      showToast('Error: No active student exit record selected.', 'error');
      return;
    }
    showToast('Preparing official Transfer Certificate A4 document. Select "Save as PDF" in print window.', 'info');
    setTimeout(() => {
      printExitTC();
    }, 400);
  }

  `;

code = code.slice(0, startIdx) + newFunctions + code.slice(endIdx);
fs.writeFileSync(portalJsPath, code, 'utf8');
console.log('✓ Successfully updated updateTCPrintableSheet, printExitTC and downloadExitTCPdf in portal.js');
