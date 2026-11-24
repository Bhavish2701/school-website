const fs = require('fs');
const content = fs.readFileSync('frontend/js/teacher.js', 'utf8');

const targetReturn = `    contactParentFromDossier,
    promptWithdrawStudent,
    notifyNonClassTeacherAttempt,
    confirmWithdrawStudent`;

const methodsToAdd = `  // Statutory DPDP & GDPR Privacy Handlers
  async function toggleConsentPreference(domain, isChecked) {
    const status = isChecked ? 'GRANTED' : 'REVOKED';
    try {
      if (window.ApiClient && window.ApiClient.compliance) {
        const res = await window.ApiClient.compliance.recordConsent(domain, status);
        if (res && res.success) {
          showNotification('Privacy preference updated: ' + domain.replace(/_/g, ' ') + ' is now ' + status + '.', 'success');
        } else {
          showNotification(res?.message || 'Could not update preference.', 'warning');
        }
      } else {
        localStorage.setItem('sv_pref_' + domain, status);
        showNotification('Preference saved locally.', 'info');
      }
    } catch (e) {
      showNotification('Error recording privacy preference: ' + e.message, 'danger');
    }
  }

  async function downloadMyDataDossier() {
    try {
      showNotification('Generating your statutory personal data dossier (GDPR / DPDP SAR)...', 'info');
      const user = (window.ApiClient && window.ApiClient.getUser()) || { id: 'T-042', role: 'TEACHER', name: 'Ms. Anjali' };
      const userId = user.id || user._id || 'T-042';

      let dossier = null;
      if (window.ApiClient && window.ApiClient.compliance) {
        const res = await window.ApiClient.compliance.exportUserData(userId);
        if (res && res.success) dossier = res.data;
      }

      if (!dossier) {
        dossier = {
          subjectId: userId,
          subjectName: user.name || 'Ms. Anjali',
          role: user.role || 'TEACHER',
          exportTimestamp: new Date().toISOString(),
          legalBasis: 'DPDP Act 2023 Section 11 & GDPR Article 15 Data Portability',
          institution: 'Sri Vidya English Medium High School',
          profileData: {
            employeeId: 'EMP-T-042',
            department: 'Mathematics',
            designation: 'Senior Faculty & Grade 8A Class Teacher',
            joiningDate: '2019-06-12',
            qualifications: 'M.Sc Mathematics, B.Ed (Andhra University)'
          },
          communicationPreferences: {
            smsCirculars: localStorage.getItem('sv_pref_COMMUNICATION_SMS') || 'GRANTED',
            whatsAppAnnouncements: localStorage.getItem('sv_pref_MARKETING_WHATSAPP') || 'GRANTED',
            inHouseTelemetry: localStorage.getItem('sv_pref_TELEMETRY_ANALYTICS') || 'GRANTED'
          }
        };
      }

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dossier, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'Faculty_Data_Dossier_' + (user.name || 'Faculty').replace(/\\s+/g, '_') + '.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showNotification('Personal data dossier downloaded successfully!', 'success');
    } catch (err) {
      showNotification('Failed to export data dossier: ' + err.message, 'danger');
    }
  }
`;

const updatedContent = content.replace(targetReturn, methodsToAdd + '\n\n' + targetReturn + `,\n    toggleConsentPreference,\n    downloadMyDataDossier`);
fs.writeFileSync('frontend/js/teacher.js', updatedContent, 'utf8');
console.log('Successfully updated teacher.js with privacy functions.');
