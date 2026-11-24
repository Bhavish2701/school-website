const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../../frontend/css/portal.css');
let css = fs.readFileSync(cssPath, 'utf8');

const targetStart = '/* AP Board Transfer Certificate Printable Sheet Preview */';
const targetEnd = '/* 5. Modal Action Footer - Structured Two-Row Layout */';

const startIdx = css.indexOf(targetStart);
const endIdx = css.indexOf(targetEnd);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find CSS boundaries in portal.css');
  process.exit(1);
}

const newTcCsa = `/* ==========================================================================
   OFFICIAL AP BOARD STATUTORY TRANSFER CERTIFICATE (TC) SPECIFICATION
   Institutional A4 Portrait Layout &bull; Authentic Legal School Document
   ========================================================================== */

.exit-tc-sheet-wrapper {
  background: #252e3e;
  padding: 1.75rem 1rem;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  overflow-x: auto;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
}

.exit-tc-sheet {
  width: 100%;
  max-width: 820px;
  min-height: 1120px;
  background: #ffffff;
  color: #0f172a;
  padding: 10px;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.45);
  position: relative;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
}

/* Institutional Double Border Frame */
.exit-tc-outer-frame {
  border: 3px solid #1e3a8a;
  padding: 4px;
  border-radius: 4px;
  background: #ffffff;
}

.exit-tc-inner-frame {
  border: 1.2px solid #60a5fa;
  padding: 18px 22px 14px 22px;
  position: relative;
  background: #ffffff;
  overflow: hidden;
}

/* Subtle Institutional Background Watermark */
.exit-tc-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-28deg);
  opacity: 0.038;
  pointer-events: none;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}

.tc-watermark-emblem {
  width: 320px;
  height: 320px;
  object-fit: contain;
  filter: grayscale(100%);
}

.tc-watermark-text {
  font-family: 'Cinzel', serif;
  font-size: 3rem;
  font-weight: 900;
  color: #1e3a8a;
  text-align: center;
  white-space: nowrap;
  letter-spacing: 2px;
  margin-top: 10px;
}

/* 1. Official Header */
.exit-tc-official-header {
  position: relative;
  z-index: 1;
}

.tc-statutory-topline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 5px;
  margin-bottom: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #1e3a8a;
  letter-spacing: 0.5px;
}

.tc-statutory-badge {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 0.68rem;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.tc-brand-grid {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.tc-logo-col {
  flex-shrink: 0;
}

.tc-official-logo {
  width: 68px;
  height: 68px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #1e3a8a;
  box-shadow: 0 2px 6px rgba(30, 58, 138, 0.2);
}

.tc-brand-center {
  flex: 1;
  text-align: center;
}

.tc-institution-name {
  font-family: 'Cinzel', 'Plus Jakarta Sans', serif;
  font-size: 1.35rem;
  font-weight: 900;
  color: #0b1d3a;
  letter-spacing: 0.8px;
  margin: 0 0 3px 0;
  line-height: 1.2;
}

.tc-recognition-text {
  font-size: 0.78rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 2px;
}

.tc-campus-address {
  font-size: 0.74rem;
  color: #334155;
  margin-bottom: 2px;
}

.tc-contact-line {
  font-size: 0.70rem;
  color: #64748b;
  margin-bottom: 5px;
}

.tc-statutory-numbers {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
}

.tc-stat-pill {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 3px;
  padding: 1px 7px;
  font-size: 0.68rem;
  color: #1e293b;
}

.tc-crest-col {
  flex-shrink: 0;
}

.tc-official-round-emblem {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px dashed #1e3a8a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #1e3a8a;
  font-size: 1.25rem;
  background: #f0f7ff;
}

.tc-official-round-emblem span {
  font-size: 0.52rem;
  font-weight: 800;
  margin-top: 2px;
  letter-spacing: 0.5px;
}

.tc-header-separator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0 10px 0;
}

.tc-sep-line {
  flex: 1;
  height: 1.5px;
  background: linear-gradient(90deg, rgba(30, 58, 138, 0.1), rgba(30, 58, 138, 0.8), rgba(30, 58, 138, 0.1));
}

.tc-sep-diamond {
  color: #1e3a8a;
  font-size: 0.75rem;
}

/* 2. Certificate Heading */
.tc-heading-section {
  text-align: center;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
}

.tc-title-banner-wrap {
  display: inline-block;
  text-align: center;
}

.tc-doc-type {
  display: block;
  font-size: 0.65rem;
  font-weight: 800;
  color: #1e3a8a;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.tc-heading-title {
  font-family: 'Cinzel', serif;
  font-size: 1.3rem;
  font-weight: 900;
  color: #0b1d3a;
  letter-spacing: 2.5px;
  margin: 1px 0 2px 0;
  border-bottom: 2px solid #1e3a8a;
  display: inline-block;
  padding: 0 16px 2px 16px;
}

.tc-doc-rules {
  display: block;
  font-size: 0.68rem;
  color: #475569;
  font-style: italic;
  margin-top: 2px;
}

/* 3. Metadata Four-Pillar Grid */
.tc-metadata-four-pillar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 6px 10px;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.tc-meta-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tc-meta-label {
  font-size: 0.64rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.tc-meta-val {
  font-size: 0.82rem;
  color: #0b1d3a;
  font-weight: 800;
}

/* 4. Particulars Table (21 Prescribed Items) */
.tc-particulars-wrapper {
  position: relative;
  z-index: 1;
  margin-bottom: 10px;
}

.tc-particulars-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.79rem;
  line-height: 1.35;
}

.tc-particulars-table tr {
  border-bottom: 1px solid rgba(226, 232, 240, 0.85);
}

.tc-particulars-table tr:last-child {
  border-bottom: none;
}

.tc-col-idx {
  width: 24px;
  font-weight: 700;
  color: #1e3a8a;
  vertical-align: top;
  padding: 3.5px 2px;
  text-align: right;
}

.tc-col-field {
  width: 46%;
  font-weight: 600;
  color: #1e293b;
  vertical-align: top;
  padding: 3.5px 6px 3.5px 6px;
}

.tc-col-colon {
  width: 10px;
  font-weight: 700;
  color: #64748b;
  vertical-align: top;
  padding: 3.5px 2px;
  text-align: center;
}

.tc-col-data {
  width: 50%;
  vertical-align: top;
  padding: 3.5px 4px;
  font-weight: 600;
  color: #0f172a;
}

.tc-val-highlight {
  font-weight: 800;
  color: #0b1d3a;
  letter-spacing: 0.2px;
}

.tc-aadhaar-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 1px 6px;
  border-radius: 3px;
  margin-left: 8px;
  font-size: 0.70rem;
}

.tc-aadhaar-label {
  color: #64748b;
  font-weight: 600;
}

.tc-aadhaar-val {
  color: #1e3a8a;
}

.tc-ident-lines div {
  padding: 1px 0;
  color: #1e293b;
  font-weight: 600;
}

/* 5. Statutory Declaration Box */
.tc-statutory-declaration-box {
  position: relative;
  z-index: 1;
  background: #f8fafc;
  border: 1px solid #bfdbfe;
  border-left: 4px solid #1d4ed8;
  border-radius: 4px;
  padding: 7px 12px;
  margin: 8px 0 12px 0;
  display: flex;
  gap: 10px;
  align-items: center;
}

.tc-declaration-icon {
  font-size: 1.15rem;
  color: #1d4ed8;
  flex-shrink: 0;
}

.tc-declaration-text {
  font-size: 0.72rem;
  color: #1e293b;
  line-height: 1.35;
  font-style: italic;
}

.tc-declaration-text strong {
  font-style: normal;
  color: #0b1d3a;
  display: block;
  margin-bottom: 1px;
}

/* 6. Signatories & Official School Seal */
.tc-signatories-grid {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 10px;
  padding-top: 6px;
  border-top: 1px dashed #cbd5e1;
}

.tc-sign-column {
  width: 30%;
  box-sizing: border-box;
}

.tc-signature-space {
  height: 38px;
  display: flex;
  align-items: flex-end;
}

.tc-sign-column.text-center .tc-signature-space {
  justify-content: center;
}

.tc-sign-column.text-end .tc-signature-space {
  justify-content: flex-end;
}

.tc-signed-name {
  font-family: 'EB Garamond', 'Times New Roman', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e3a8a;
}

.tc-signed-cursive {
  font-family: 'Cinzel', cursive, serif;
  font-size: 1rem;
  font-weight: 800;
  color: #0b1d3a;
  font-style: italic;
}

.tc-signature-line {
  width: 100%;
  height: 1px;
  background: #334155;
  margin: 3px 0 4px 0;
}

.tc-sign-role {
  display: block;
  font-size: 0.76rem;
  font-weight: 800;
  color: #0b1d3a;
  text-transform: uppercase;
}

.tc-sign-title {
  font-size: 0.74rem;
  color: #1e293b;
  margin-top: 1px;
}

.tc-sign-sub {
  font-size: 0.68rem;
  color: #64748b;
}

.tc-sign-date {
  font-size: 0.68rem;
  color: #475569;
  margin-top: 2px;
  font-weight: 600;
}

/* Authentic Circular Seal */
.tc-circular-seal {
  width: 78px;
  height: 78px;
  border: 2px solid #1e3a8a;
  border-radius: 50%;
  margin: 0 auto;
  padding: 2.5px;
  background: #ffffff;
  box-shadow: 0 0 0 1px rgba(30, 58, 138, 0.2);
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
  padding: 2px;
  box-sizing: border-box;
}

.tc-seal-star-top, .tc-seal-star-bottom {
  font-size: 0.44rem;
  line-height: 1;
}

.tc-seal-school-name {
  font-size: 0.42rem;
  font-weight: 900;
  letter-spacing: 0.3px;
  line-height: 1;
}

.tc-seal-center-emblem {
  font-size: 0.72rem;
  margin: 1px 0;
}

.tc-seal-text-mid {
  font-size: 0.40rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  line-height: 1;
}

.tc-seal-city {
  font-size: 0.38rem;
  font-weight: 800;
  line-height: 1;
}

.tc-seal-caption {
  font-size: 0.64rem;
  font-weight: 700;
  color: #64748b;
  margin-top: 3px;
  text-transform: uppercase;
}

/* 7. Footer Security Bar & Statutory AP Notes */
.tc-footer-security-bar {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #cbd5e1;
  margin-top: 10px;
  padding-top: 6px;
  font-size: 0.64rem;
  color: #475569;
}

.tc-security-left {
  max-width: 60%;
  line-height: 1.3;
}

.tc-statutory-rule-note {
  display: block;
}

.tc-security-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tc-qr-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  padding: 3px 6px;
  border-radius: 4px;
}

.tc-qr-icon {
  font-size: 1.1rem;
  color: #0b1d3a;
}

.tc-qr-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.tc-qr-hash {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.58rem;
  color: #0b1d3a;
}

.tc-qr-url {
  font-size: 0.52rem;
  color: #64748b;
}

.tc-original-tag {
  background: #0b1d3a;
  color: #ffffff;
  padding: 3px 7px;
  border-radius: 3px;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Print Optimization */
@media print {
  @page {
    size: A4 portrait;
    margin: 8mm 6mm;
  }

  body * {
    visibility: hidden;
  }

  #printableExitTC, #printableExitTC * {
    visibility: visible;
  }

  #printableExitTC {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    background: transparent !important;
    padding: 0 !important;
    box-shadow: none !important;
  }

  .exit-tc-sheet {
    max-width: 100% !important;
    box-shadow: none !important;
    padding: 0 !important;
  }

  .exit-tc-outer-frame {
    border: 2px solid #000 !important;
  }

  .exit-tc-inner-frame {
    border: 1px solid #444 !important;
  }
}

`;

css = css.slice(0, startIdx) + newTcCsa + css.slice(endIdx);
fs.writeFileSync(cssPath, css, 'utf8');
console.log('✓ Successfully injected official TC CSS into portal.css');
