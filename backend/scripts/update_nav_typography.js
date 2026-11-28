const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../../frontend/css/portal.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const targetBlock = `/* 3. Modern Segmented Tab Strip Controller */
.tab-strip,
#teachersTabStrip,
#studentsTabStrip,
#academicTabStrip,
#feeTabStrip {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  background: var(--color-bg-subtle, #f1f5f9) !important;
  border: 1px solid var(--color-border, #e2e8f0) !important;
  border-radius: 12px !important;
  padding: 5px !important;
  margin-bottom: 1.5rem !important;
  max-width: 100% !important;
  overflow-x: auto !important;
  scrollbar-width: none !important;
  -webkit-overflow-scrolling: touch !important;
  border-bottom: 1px solid var(--color-border, #e2e8f0) !important;
}

.tab-strip::-webkit-scrollbar,
#teachersTabStrip::-webkit-scrollbar,
#studentsTabStrip::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tab-strip .tab-btn,
#teachersTabStrip .tab-btn,
#studentsTabStrip .tab-btn,
.tab-btn {
  height: 38px !important;
  min-height: 38px !important;
  padding: 0 16px !important;
  border: none !important;
  background: transparent !important;
  font-weight: 500 !important;
  font-size: 0.85rem !important;
  color: var(--color-text-muted, #64748b) !important;
  cursor: pointer !important;
  border-radius: 8px !important;
  margin-bottom: 0 !important;
  border-bottom: none !important;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  text-decoration: none !important;
}

.tab-strip .tab-btn i,
#teachersTabStrip .tab-btn i,
#studentsTabStrip .tab-btn i,
.tab-btn i {
  font-size: 0.95rem !important;
  opacity: 0.85 !important;
}

.tab-strip .tab-btn:hover,
#teachersTabStrip .tab-btn:hover,
#studentsTabStrip .tab-btn:hover,
.tab-btn:hover {
  color: var(--color-text-dark, #0f172a) !important;
  background: rgba(255, 255, 255, 0.8) !important;
}

.tab-strip .tab-btn.active,
#teachersTabStrip .tab-btn.active,
#studentsTabStrip .tab-btn.active,
.tab-btn.active {
  color: var(--color-primary, #1d4ed8) !important;
  background: var(--color-bg-surface, #ffffff) !important;
  font-weight: 600 !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04) !important;
  border-bottom: none !important;
  margin-bottom: 0 !important;
}`;

const replacementBlock = `/* 3. Modern Segmented Tab Strip Controller - Institutional Bold Typography */
.tab-strip,
#teachersTabStrip,
#studentsTabStrip,
#academicTabStrip,
#feeTabStrip {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  background: #f1f5f9 !important;
  border: 1px solid #dce4f0 !important;
  border-radius: 12px !important;
  padding: 5px !important;
  margin-bottom: 1.5rem !important;
  max-width: 100% !important;
  overflow-x: auto !important;
  scrollbar-width: none !important;
  -webkit-overflow-scrolling: touch !important;
  box-sizing: border-box !important;
}

.tab-strip::-webkit-scrollbar,
#teachersTabStrip::-webkit-scrollbar,
#studentsTabStrip::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tab-strip .tab-btn,
#teachersTabStrip .tab-btn,
#studentsTabStrip .tab-btn,
.tab-btn {
  height: 38px !important;
  min-height: 38px !important;
  padding: 0 16px !important;
  border: 1px solid transparent !important;
  background: transparent !important;
  font-family: inherit !important;
  font-weight: 650 !important;
  font-size: 14.5px !important;
  color: #17233f !important;
  cursor: pointer !important;
  border-radius: 9px !important;
  margin-bottom: 0 !important;
  border-bottom: 1px solid transparent !important;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8.5px !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  text-decoration: none !important;
  line-height: 1 !important;
  letter-spacing: -0.01em !important;
  user-select: none !important;
}

.tab-strip .tab-btn i,
#teachersTabStrip .tab-btn i,
#studentsTabStrip .tab-btn i,
.tab-btn i {
  font-size: 14.5px !important;
  color: #17233f !important;
  opacity: 0.9 !important;
  line-height: 1 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: color 0.18s ease, opacity 0.18s ease !important;
}

.tab-strip .tab-btn:hover,
#teachersTabStrip .tab-btn:hover,
#studentsTabStrip .tab-btn:hover,
.tab-btn:hover {
  color: #0f172a !important;
  background: rgba(255, 255, 255, 0.85) !important;
  border-color: rgba(220, 228, 240, 0.8) !important;
}

.tab-strip .tab-btn:hover i,
#teachersTabStrip .tab-btn:hover i,
#studentsTabStrip .tab-btn:hover i,
.tab-btn:hover i {
  color: #0f172a !important;
  opacity: 1 !important;
}

.tab-strip .tab-btn.active,
#teachersTabStrip .tab-btn.active,
#studentsTabStrip .tab-btn.active,
.tab-btn.active {
  color: #214dd8 !important;
  background: #ffffff !important;
  font-weight: 700 !important;
  border: 1px solid rgba(33, 77, 216, 0.18) !important;
  box-shadow: 0 2px 6px -1px rgba(33, 77, 216, 0.14), 0 1px 3px rgba(15, 23, 42, 0.06) !important;
  border-bottom: 1px solid rgba(33, 77, 216, 0.18) !important;
  margin-bottom: 0 !important;
}

.tab-strip .tab-btn.active i,
#teachersTabStrip .tab-btn.active i,
#studentsTabStrip .tab-btn.active i,
.tab-btn.active i {
  color: #214dd8 !important;
  opacity: 1 !important;
  font-size: 15px !important;
}

/* Authoritative High-Contrast Student Management Navigation Bar (#studentsTabStrip) */
#studentsTabStrip {
  background: #f1f5f9 !important;
  border: 1px solid #dce4f0 !important;
  border-radius: 12px !important;
  padding: 5px !important;
  gap: 6px !important;
}

#studentsTabStrip .tab-btn {
  font-size: 14.5px !important;
  font-weight: 650 !important;
  color: #17233f !important;
  padding: 0 16px !important;
  height: 38px !important;
  border-radius: 9px !important;
  border: 1px solid transparent !important;
  letter-spacing: -0.01em !important;
}

#studentsTabStrip .tab-btn i {
  font-size: 14.5px !important;
  color: #17233f !important;
  opacity: 0.92 !important;
}

#studentsTabStrip .tab-btn:hover {
  color: #0f172a !important;
  background: rgba(255, 255, 255, 0.85) !important;
  border-color: rgba(220, 228, 240, 0.8) !important;
}

#studentsTabStrip .tab-btn:hover i {
  color: #0f172a !important;
  opacity: 1 !important;
}

#studentsTabStrip .tab-btn.active {
  color: #214dd8 !important;
  background: #ffffff !important;
  font-weight: 700 !important;
  border: 1px solid rgba(33, 77, 216, 0.2) !important;
  box-shadow: 0 2px 6px -1px rgba(33, 77, 216, 0.15), 0 1px 3px rgba(15, 23, 42, 0.08) !important;
}

#studentsTabStrip .tab-btn.active i {
  color: #214dd8 !important;
  opacity: 1 !important;
  font-size: 15px !important;
}`;

const targetDarkBlock = `/* 9. Dark Mode Overrides for Modern System */
[data-theme="dark"] .tab-strip,
[data-theme="dark"] #teachersTabStrip,
[data-theme="dark"] #studentsTabStrip {
  background: #1e293b !important;
  border-color: #334155 !important;
}

[data-theme="dark"] .tab-strip .tab-btn.active,
[data-theme="dark"] #teachersTabStrip .tab-btn.active,
[data-theme="dark"] #studentsTabStrip .tab-btn.active {
  background: #0f172a !important;
  color: #60a5fa !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4) !important;
}`;

const replacementDarkBlock = `/* 9. Dark Mode Overrides for Modern System */
[data-theme="dark"] .tab-strip,
[data-theme="dark"] #teachersTabStrip,
[data-theme="dark"] #studentsTabStrip {
  background: #1e293b !important;
  border-color: #334155 !important;
}

[data-theme="dark"] .tab-strip .tab-btn,
[data-theme="dark"] #teachersTabStrip .tab-btn,
[data-theme="dark"] #studentsTabStrip .tab-btn {
  color: #e2e8f0 !important;
  font-weight: 650 !important;
}

[data-theme="dark"] .tab-strip .tab-btn i,
[data-theme="dark"] #teachersTabStrip .tab-btn i,
[data-theme="dark"] #studentsTabStrip .tab-btn i {
  color: #cbd5e1 !important;
  opacity: 0.95 !important;
}

[data-theme="dark"] .tab-strip .tab-btn:hover,
[data-theme="dark"] #teachersTabStrip .tab-btn:hover,
[data-theme="dark"] #studentsTabStrip .tab-btn:hover {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

[data-theme="dark"] .tab-strip .tab-btn:hover i,
[data-theme="dark"] #teachersTabStrip .tab-btn:hover i,
[data-theme="dark"] #studentsTabStrip .tab-btn:hover i {
  color: #ffffff !important;
  opacity: 1 !important;
}

[data-theme="dark"] .tab-strip .tab-btn.active,
[data-theme="dark"] #teachersTabStrip .tab-btn.active,
[data-theme="dark"] #studentsTabStrip .tab-btn.active {
  background: #0f172a !important;
  color: #60a5fa !important;
  border-color: #2563eb !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4) !important;
  font-weight: 700 !important;
}

[data-theme="dark"] .tab-strip .tab-btn.active i,
[data-theme="dark"] #teachersTabStrip .tab-btn.active i,
[data-theme="dark"] #studentsTabStrip .tab-btn.active i {
  color: #60a5fa !important;
  opacity: 1 !important;
}`;

if (!cssContent.includes(targetBlock)) {
  console.error('Target block not found in portal.css!');
  process.exit(1);
}

cssContent = cssContent.replace(targetBlock, replacementBlock);

if (cssContent.includes(targetDarkBlock)) {
  cssContent = cssContent.replace(targetDarkBlock, replacementDarkBlock);
  console.log('Successfully updated dark mode tab-strip styles.');
}

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('Successfully updated navigation typography in portal.css!');
