const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../../frontend/administration-portal/index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const oldStepperHtml = `          <div class="stepper-step active" data-exit-tab="request" onclick="portalApp.switchExitTab('request')">
            <div class="stepper-circle">1</div>
            <div class="stepper-content">
              <span class="stepper-title">1. Exit Request</span>
              <span class="stepper-status">Initiation</span>
            </div>
          </div>

          <div class="stepper-step" data-exit-tab="parent" onclick="portalApp.switchExitTab('parent')">
            <div class="stepper-circle">2</div>
            <div class="stepper-content">
              <span class="stepper-title">2. Parent Verification</span>
              <span class="stepper-status">Documents</span>
            </div>
          </div>

          <div class="stepper-step" data-exit-tab="clearance" onclick="portalApp.switchExitTab('clearance')">
            <div class="stepper-circle">3</div>
            <div class="stepper-content">
              <span class="stepper-title">3. Department Clearance</span>
              <span class="stepper-status">4 Units</span>
            </div>
          </div>

          <div class="stepper-step" data-exit-tab="conduct" onclick="portalApp.switchExitTab('conduct')">
            <div class="stepper-circle">4</div>
            <div class="stepper-content">
              <span class="stepper-title">4. Academic &amp; Conduct</span>
              <span class="stepper-status">Evaluation</span>
            </div>
          </div>

          <div class="stepper-step" data-exit-tab="tc" onclick="portalApp.switchExitTab('tc')">
            <div class="stepper-circle">5</div>
            <div class="stepper-content">
              <span class="stepper-title">5. Executive Approval</span>
              <span class="stepper-status">Official Docket</span>
            </div>
          </div>

          <div class="stepper-step" data-exit-tab="audit" onclick="portalApp.switchExitTab('audit')">
            <div class="stepper-circle">6</div>
            <div class="stepper-content">
              <span class="stepper-title">6. TC Issuance &amp; Exit</span>
              <span class="stepper-status">Zero Deletion</span>
            </div>
          </div>`;

const newStepperHtml = `          <div class="stepper-step active" data-exit-tab="request" onclick="portalApp.switchExitTab('request')">
            <div class="stepper-circle">1</div>
            <div class="stepper-content">
              <span class="stepper-title">Exit Request</span>
              <span class="stepper-status">Initiation</span>
            </div>
          </div>

          <div class="stepper-step" data-exit-tab="parent" onclick="portalApp.switchExitTab('parent')">
            <div class="stepper-circle">2</div>
            <div class="stepper-content">
              <span class="stepper-title">Parent Verification</span>
              <span class="stepper-status">Documents</span>
            </div>
          </div>

          <div class="stepper-step" data-exit-tab="clearance" onclick="portalApp.switchExitTab('clearance')">
            <div class="stepper-circle">3</div>
            <div class="stepper-content">
              <span class="stepper-title">Department Clearance</span>
              <span class="stepper-status">4 Units</span>
            </div>
          </div>

          <div class="stepper-step" data-exit-tab="conduct" onclick="portalApp.switchExitTab('conduct')">
            <div class="stepper-circle">4</div>
            <div class="stepper-content">
              <span class="stepper-title">Academic &amp; Conduct</span>
              <span class="stepper-status">Evaluation</span>
            </div>
          </div>

          <div class="stepper-step" data-exit-tab="tc" onclick="portalApp.switchExitTab('tc')">
            <div class="stepper-circle">5</div>
            <div class="stepper-content">
              <span class="stepper-title">Executive Approval</span>
              <span class="stepper-status">Official Docket</span>
            </div>
          </div>

          <div class="stepper-step" data-exit-tab="audit" onclick="portalApp.switchExitTab('audit')">
            <div class="stepper-circle">6</div>
            <div class="stepper-content">
              <span class="stepper-title">TC Issuance &amp; Exit</span>
              <span class="stepper-status">Zero Deletion</span>
            </div>
          </div>`;

if (htmlContent.includes(oldStepperHtml)) {
  htmlContent = htmlContent.replace(oldStepperHtml, newStepperHtml);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('Successfully updated stepper titles in index.html');
} else {
  console.log('Stepper HTML in index.html was not matching oldStepperHtml, checking...');
}

const cssPath = path.join(__dirname, '../../frontend/css/portal.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const startMarker = `/* =========================================================================\n   STUDENT EXIT & TRANSFER CERTIFICATE (TC) MANAGEMENT SYSTEM MODAL`;
const endMarker = `/* =========================================================================\n   CONTROLLED STUDENT ARCHIVAL & RECORD INACTIVATION SYSTEM MODAL`;

const startIdx = cssContent.indexOf(startMarker);
const endIdx = cssContent.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find CSS markers:', { startIdx, endIdx });
  process.exit(1);
}

const newCssBlock = `/* =========================================================================
   STUDENT EXIT & TRANSFER CERTIFICATE (TC) MANAGEMENT SYSTEM MODAL
   Official Institutional Withdrawal, Departmental Clearance & Statutory TC Docket
   ========================================================================= */

/* Backdrop container */
#studentTransferWithdrawalModal.modal-backdrop {
  position: fixed !important;
  inset: 0 !important;
  z-index: 10075 !important;
  background: rgba(15, 23, 42, 0.65) !important;
  backdrop-filter: blur(5px) !important;
  -webkit-backdrop-filter: blur(5px) !important;
  display: none !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 1.5vh 1.5vw !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

#studentTransferWithdrawalModal.modal-backdrop.active,
#studentTransferWithdrawalModal.modal-backdrop.open,
#studentTransferWithdrawalModal.modal-backdrop.show,
#studentTransferWithdrawalModal.modal-backdrop[style*="display: flex"] {
  display: flex !important;
}

/* Modal Dialog Box */
#studentTransferWithdrawalModal .portal-modal,
#studentTransferWithdrawalModal .exit-management-modal-dialog,
#studentExitModalDialog,
.exit-management-modal-dialog {
  width: min(1440px, 96vw) !important;
  max-width: min(1440px, 96vw) !important;
  height: 94vh !important;
  max-height: 94vh !important;
  margin: auto !important;
  display: flex !important;
  flex-direction: column !important;
  background: #ffffff !important;
  border-radius: 20px !important;
  border: 1px solid #dce4f0 !important;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(15, 23, 42, 0.08) !important;
  overflow: hidden !important;
  font-family: inherit;
  box-sizing: border-box !important;
  position: relative !important;
  min-width: 0 !important;
}

[data-theme="dark"] #studentTransferWithdrawalModal .portal-modal,
[data-theme="dark"] #studentTransferWithdrawalModal .exit-management-modal-dialog,
[data-theme="dark"] #studentExitModalDialog,
[data-theme="dark"] .exit-management-modal-dialog {
  background: #0f172a !important;
  border-color: #334155 !important;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
  color: #f1f5f9;
}

/* 1. Modal Institutional Header - Pinned at top */
.exit-modal-header {
  padding: 1rem 1.75rem;
  background: #ffffff;
  border-bottom: 1px solid #dce4f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  position: relative;
  z-index: 20;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 100%;
}

[data-theme="dark"] .exit-modal-header {
  background: #1e293b;
  border-bottom-color: #334155;
}

.exit-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  flex: 1;
}

.exit-header-icon {
  width: 46px;
  height: 46px;
  min-width: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #214dd8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  box-shadow: inset 0 0 0 1px rgba(33, 77, 216, 0.15);
  flex-shrink: 0;
}

[data-theme="dark"] .exit-header-icon {
  background: linear-gradient(135deg, #1e3a8a 0%, #172554 100%);
  color: #60a5fa;
  box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.25);
}

.exit-header-titles {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.exit-header-institution {
  font-size: 0.74rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  line-height: 1.35;
}

[data-theme="dark"] .exit-header-institution {
  color: #94a3b8;
}

.exit-header-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #172033;
  margin: 0.15rem 0 0 0;
  line-height: 1.25;
  white-space: normal;
}

[data-theme="dark"] .exit-header-title {
  color: #f8fafc;
}

.exit-header-subtitle {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0.15rem 0 0 0;
  line-height: 1.35;
  white-space: normal;
}

[data-theme="dark"] .exit-header-subtitle {
  color: #94a3b8;
}

.exit-header-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-shrink: 0;
}

.exit-close-btn {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 10px;
  border: 1px solid #dce4f0;
  background: #f8fafc;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  flex-shrink: 0;
}

.exit-close-btn:hover {
  background: #f1f5f9;
  color: #172033;
  border-color: #cbd5e1;
}

[data-theme="dark"] .exit-close-btn {
  background: #0f172a;
  border-color: #334155;
  color: #94a3b8;
}

[data-theme="dark"] .exit-close-btn:hover {
  background: #1e293b;
  color: #f8fafc;
}

/* Status Pill Variants */
.exit-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.95rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.exit-status-pill.status-draft {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.exit-status-pill.status-submitted,
.exit-status-pill.status-in-progress,
.exit-status-pill.status-verifying {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.exit-status-pill.status-pending,
.exit-status-pill.status-awaiting-approval {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.exit-status-pill.status-approved,
.exit-status-pill.status-tc-generated,
.exit-status-pill.status-completed {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.exit-status-pill.status-rejected,
.exit-status-pill.status-cancelled {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.exit-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: currentColor;
  display: inline-block;
}

/* 2. Student Identity Summary Card - Pinned below header */
.exit-student-summary-card {
  background: #f8fafc;
  border-bottom: 1px solid #dce4f0;
  padding: 0.9rem 1.75rem;
  flex-shrink: 0;
  position: relative;
  z-index: 15;
  box-sizing: border-box;
  width: 100%;
}

[data-theme="dark"] .exit-student-summary-card {
  background: #131c2e;
  border-bottom-color: #334155;
}

.summary-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.summary-student-identity {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-shrink: 0;
}

.summary-avatar {
  width: 46px;
  height: 46px;
  min-width: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #214dd8 0%, #17233f 100%);
  color: #ffffff;
  font-weight: 800;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(33, 77, 216, 0.25);
  flex-shrink: 0;
}

.summary-identity-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-name-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.summary-student-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: #172033;
  margin: 0;
  white-space: nowrap;
}

[data-theme="dark"] .summary-student-name {
  color: #f8fafc;
}

.summary-badge-enrolled {
  background: #ecfdf5;
  color: #15803d;
  border: 1px solid #bbf7d0;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  white-space: nowrap;
}

.summary-badge-type {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  white-space: nowrap;
}

.summary-data-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.65rem 1rem;
  align-items: center;
  flex-grow: 1;
  min-width: 0;
  box-sizing: border-box;
}

.summary-data-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.summary-item-label {
  font-size: 0.68rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.03em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

[data-theme="dark"] .summary-item-label {
  color: #94a3b8;
}

.summary-item-value {
  font-size: 0.86rem;
  font-weight: 700;
  color: #172033;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

[data-theme="dark"] .summary-item-value {
  color: #f1f5f9;
}

.summary-card-bottom {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.55rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.76rem;
  color: #64748b;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
}

[data-theme="dark"] .summary-card-bottom {
  border-top-color: #334155;
  color: #94a3b8;
}

.summary-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
}

.summary-meta-label {
  font-weight: 500;
  color: #64748b;
}

[data-theme="dark"] .summary-meta-label {
  color: #94a3b8;
}

.summary-meta-value {
  font-weight: 700;
  color: #172033;
}

[data-theme="dark"] .summary-meta-value {
  color: #f1f5f9;
}

.summary-meta-divider {
  color: #cbd5e1;
}

/* 3. Workflow Stepper Navigation - Pinned */
.exit-stepper-wrapper {
  background: #ffffff;
  border-bottom: 1px solid #dce4f0;
  padding: 0.65rem 1.75rem;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  overflow-x: auto;
  box-sizing: border-box;
  width: 100%;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.exit-stepper-wrapper::-webkit-scrollbar {
  height: 5px;
}

.exit-stepper-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

[data-theme="dark"] .exit-stepper-wrapper {
  background: #1e293b;
  border-bottom-color: #334155;
  scrollbar-color: #475569 #1e293b;
}

.exit-stepper {
  display: grid;
  grid-template-columns: repeat(6, minmax(130px, 1fr));
  gap: 0.65rem;
  width: 100%;
  min-width: 820px;
  box-sizing: border-box;
  align-items: stretch;
}

.stepper-step {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  min-width: 0;
  box-sizing: border-box;
}

.stepper-step:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

[data-theme="dark"] .stepper-step {
  background: #0f172a;
  border-color: #334155;
}

[data-theme="dark"] .stepper-step:hover {
  background: #1e293b;
  border-color: #475569;
}

.stepper-step.active {
  background: #eff6ff !important;
  border-color: #93c5fd !important;
  box-shadow: 0 2px 8px rgba(33, 77, 216, 0.12) !important;
}

[data-theme="dark"] .stepper-step.active {
  background: rgba(33, 77, 216, 0.15) !important;
  border-color: #3b82f6 !important;
}

.stepper-step.completed {
  background: #f0fdf4 !important;
  border-color: #bbf7d0 !important;
}

[data-theme="dark"] .stepper-step.completed {
  background: rgba(21, 128, 61, 0.15) !important;
  border-color: #15803d !important;
}

.stepper-circle {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  border: 2px solid #cbd5e1;
  font-size: 0.82rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

[data-theme="dark"] .stepper-circle {
  background: #1e293b;
  border-color: #475569;
  color: #94a3b8;
}

.stepper-step.active .stepper-circle {
  background: #214dd8 !important;
  color: #ffffff !important;
  border-color: #214dd8 !important;
  box-shadow: 0 0 0 3px rgba(33, 77, 216, 0.2) !important;
}

.stepper-step.completed .stepper-circle {
  background: #15803d !important;
  color: #ffffff !important;
  border-color: #15803d !important;
}

.stepper-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.stepper-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  line-height: 1.25;
  white-space: normal;
  word-break: break-word;
  transition: color 0.2s ease;
}

[data-theme="dark"] .stepper-title {
  color: #94a3b8;
}

.stepper-step.active .stepper-title {
  color: #214dd8 !important;
  font-weight: 800;
}

[data-theme="dark"] .stepper-step.active .stepper-title {
  color: #60a5fa !important;
}

.stepper-step.completed .stepper-title {
  color: #15803d !important;
  font-weight: 700;
}

.stepper-status {
  font-size: 0.68rem;
  color: #64748b;
  line-height: 1.2;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

[data-theme="dark"] .stepper-status {
  color: #94a3b8;
}

/* 4. Scrollable Modal Form Body */
.exit-modal-body {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem 1.75rem;
  background: #f5f7fb;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.exit-modal-body::-webkit-scrollbar {
  width: 6px;
}

.exit-modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

[data-theme="dark"] .exit-modal-body {
  background: #0b1120;
  scrollbar-color: #475569 #0b1120;
}

.exit-pane {
  display: none;
  animation: exitFadeIn 0.22s ease-in-out;
}

.exit-pane.active {
  display: block;
}

@keyframes exitFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Section Cards inside Panes */
.exit-section-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
}

[data-theme="dark"] .exit-section-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: none;
}

.exit-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

[data-theme="dark"] .exit-card-header {
  border-bottom-color: #334155;
}

.exit-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

[data-theme="dark"] .exit-card-title {
  color: #f1f5f9;
}

/* Exit Type Radio Grid */
.exit-type-radio-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.exit-type-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  position: relative;
  box-sizing: border-box;
}

[data-theme="dark"] .exit-type-card {
  background: #1e293b;
  border-color: #334155;
}

.exit-type-card:hover {
  border-color: #93c5fd;
  background: #f8fafc;
}

[data-theme="dark"] .exit-type-card:hover {
  border-color: #3b82f6;
  background: #172554;
}

.exit-type-card.selected {
  border-color: #214dd8;
  background: #eff6ff;
  box-shadow: 0 0 0 1px #214dd8;
}

[data-theme="dark"] .exit-type-card.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.15);
  box-shadow: 0 0 0 1px #3b82f6;
}

/* Clearance Dashboard KPI Grid */
.exit-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.exit-kpi-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.15rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}

[data-theme="dark"] .exit-kpi-card {
  background: #1e293b;
  border-color: #334155;
}

.exit-kpi-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.exit-kpi-val {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

[data-theme="dark"] .exit-kpi-val {
  color: #f8fafc;
}

.exit-kpi-label {
  font-size: 0.74rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

[data-theme="dark"] .exit-kpi-label {
  color: #94a3b8;
}

/* Department Clearance Cards */
.exit-dept-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1.1rem;
  overflow: hidden;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

[data-theme="dark"] .exit-dept-card {
  background: #1e293b;
  border-color: #334155;
}

.exit-dept-card.cleared {
  border-left: 5px solid #10b981;
}

.exit-dept-card.pending {
  border-left: 5px solid #f59e0b;
}

.exit-dept-card.action-required {
  border-left: 5px solid #ef4444;
}

.exit-dept-card.na {
  border-left: 5px solid #94a3b8;
}

.exit-dept-header {
  padding: 0.9rem 1.25rem;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  gap: 1rem;
  flex-wrap: wrap;
}

[data-theme="dark"] .exit-dept-header {
  background: #172554;
  border-bottom-color: #334155;
}

.exit-dept-title {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f172a;
  margin: 0;
}

[data-theme="dark"] .exit-dept-title {
  color: #f8fafc;
}

.exit-dept-body {
  padding: 1.1rem 1.25rem;
}

/* Accounts Ledger Grid */
.exit-accounts-ledger-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
  margin: 0.75rem 0;
  background: #f8fafc;
  padding: 0.85rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

[data-theme="dark"] .exit-accounts-ledger-grid {
  background: #0f172a;
  border-color: #334155;
}

.exit-ledger-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.exit-ledger-label {
  font-size: 0.72rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
}

.exit-ledger-val {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

[data-theme="dark"] .exit-ledger-val {
  color: #f8fafc;
}

/* AP Board Transfer Certificate Printable Sheet Preview */
.exit-tc-sheet-wrapper {
  background: #525659;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  overflow-x: auto;
}

.exit-tc-sheet {
  width: 100%;
  max-width: 820px;
  min-height: 1050px;
  background: #ffffff;
  color: #111827;
  padding: 2.25rem 2.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  border: 4px double #1e3a8a;
  position: relative;
  font-family: 'Times New Roman', Times, serif;
  box-sizing: border-box;
}

.exit-tc-sheet-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-35deg);
  font-size: 5rem;
  font-weight: 900;
  color: rgba(30, 58, 138, 0.04);
  pointer-events: none;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  white-space: nowrap;
  user-select: none;
}

.exit-tc-institution-title {
  text-align: center;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid #1e3a8a;
  padding-bottom: 0.85rem;
}

.exit-tc-inst-name {
  font-size: 1.55rem;
  font-weight: 900;
  color: #1e3a8a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
  font-family: Arial, sans-serif;
}

.exit-tc-inst-sub {
  font-size: 0.85rem;
  color: #374151;
  margin: 0.25rem 0 0 0;
  font-style: italic;
}

.exit-tc-cert-heading {
  font-size: 1.25rem;
  font-weight: 800;
  text-decoration: underline;
  text-align: center;
  margin: 1.25rem 0 1.5rem 0;
  letter-spacing: 0.08em;
  color: #111827;
}

.exit-tc-fields-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  font-size: 0.94rem;
}

.exit-tc-fields-table td {
  padding: 0.5rem 0.4rem;
  vertical-align: top;
  border-bottom: 1px dotted #9ca3af;
}

.exit-tc-field-label {
  width: 52%;
  font-weight: 600;
  color: #1f2937;
}

.exit-tc-field-val {
  width: 48%;
  font-weight: 700;
  color: #111827;
}

.exit-tc-signatures-grid {
  display: flex;
  justify-content: space-between;
  margin-top: 3.5rem;
  padding-top: 1rem;
}

.exit-tc-sig-block {
  text-align: center;
  width: 220px;
}

.exit-tc-sig-line {
  border-top: 1px solid #111827;
  padding-top: 0.35rem;
  font-size: 0.88rem;
  font-weight: 700;
  text-transform: uppercase;
}

/* 5. Modal Action Footer - Structured Two-Row Layout */
.exit-modal-footer {
  padding: 0.75rem 1.75rem;
  background: #ffffff;
  border-top: 1px solid #dce4f0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  box-sizing: border-box;
  width: 100%;
}

[data-theme="dark"] .exit-modal-footer {
  background: #1e293b;
  border-top-color: #334155;
}

.exit-footer-nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.55rem;
  border-bottom: 1px solid #f1f5f9;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
}

[data-theme="dark"] .exit-footer-nav-row {
  border-bottom-color: #334155;
}

.exit-footer-nav-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
  min-width: 260px;
  max-width: 600px;
}

.exit-stage-indicator {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1e293b;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

[data-theme="dark"] .exit-stage-indicator {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.exit-progress-track {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  min-width: 80px;
}

[data-theme="dark"] .exit-progress-track {
  background: #334155;
}

.exit-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #214dd8 0%, #3b82f6 100%);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.exit-footer-nav-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.exit-footer-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
}

.exit-footer-actions-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.exit-footer-actions-right {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex: 1;
}

/* Responsive Media Queries */
@media (max-width: 1200px) {
  .summary-data-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
  .exit-kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 992px) {
  #studentTransferWithdrawalModal .portal-modal,
  #studentTransferWithdrawalModal .exit-management-modal-dialog,
  #studentExitModalDialog,
  .exit-management-modal-dialog {
    width: 98vw !important;
    max-width: 98vw !important;
    height: 96vh !important;
    max-height: 96vh !important;
    margin: 1vh auto !important;
    border-radius: 14px !important;
  }
  .exit-modal-header {
    padding: 0.85rem 1.25rem !important;
  }
  .exit-student-summary-card {
    padding: 0.85rem 1.25rem !important;
  }
  .summary-card-top {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.75rem !important;
  }
  .summary-data-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    width: 100% !important;
  }
  .exit-stepper-wrapper {
    padding: 0.55rem 1.25rem !important;
  }
  .exit-modal-body {
    padding: 1.25rem !important;
  }
  .exit-modal-footer {
    padding: 0.65rem 1.25rem !important;
  }
}

@media (max-width: 768px) {
  #studentTransferWithdrawalModal.modal-backdrop {
    padding: 0 !important;
  }
  #studentTransferWithdrawalModal .portal-modal,
  #studentTransferWithdrawalModal .exit-management-modal-dialog,
  #studentExitModalDialog,
  .exit-management-modal-dialog {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
  .exit-modal-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.75rem !important;
    padding: 0.75rem 1rem !important;
  }
  .exit-header-left {
    width: 100% !important;
  }
  .exit-header-right {
    width: 100% !important;
    justify-content: space-between !important;
  }
  .summary-data-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  .exit-type-radio-grid {
    grid-template-columns: 1fr !important;
  }
  .exit-kpi-grid {
    grid-template-columns: 1fr !important;
  }
  .exit-footer-nav-row,
  .exit-footer-actions-row {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.65rem !important;
  }
  .exit-footer-nav-left,
  .exit-footer-nav-right,
  .exit-footer-actions-left,
  .exit-footer-actions-right {
    width: 100% !important;
    justify-content: space-between !important;
  }
  .exit-footer-actions-right {
    justify-content: stretch !important;
  }
  .exit-footer-actions-right .btn {
    flex: 1 1 auto !important;
  }
  .exit-tc-sheet {
    padding: 1.25rem 1rem !important;
  }
  .exit-tc-signatures-grid {
    flex-direction: column !important;
    gap: 2rem !important;
    align-items: center !important;
  }
}

@media (max-width: 480px) {
  .summary-data-grid {
    grid-template-columns: 1fr !important;
  }
  .summary-card-bottom {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.35rem !important;
  }
  .summary-meta-divider {
    display: none !important;
  }
}

`;

const before = cssContent.substring(0, startIdx);
const after = cssContent.substring(endIdx);
cssContent = before + newCssBlock + after;

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('Successfully updated portal.css lines 33042-34140!');
