const fs = require('fs');
const path = require('path');

console.log('--- Implementing Premium Transfer Certificate (TC) Redesign ---');

// 1. Update frontend/administration-portal/index.html
const htmlPath = path.join(__dirname, '../../frontend/administration-portal/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const oldSheetStart = '<!-- AP Board Official Printable Transfer Certificate Sheet Preview -->';
const oldSheetEndTarget = '<!-- PANE 6: AUDIT HISTORY & NOTIFICATIONS LOG -->';

const startIdx = html.indexOf(oldSheetStart);
const endIdx = html.indexOf(oldSheetEndTarget);

if (startIdx === -1 || endIdx === -1) {
  console.error('ERROR: Could not locate printableExitTC boundaries in administration-portal/index.html');
  process.exit(1);
}

// Find the closing </div> of stage 5 tab pane right before PANE 6
const pane5ClosingTarget = '</div>\n        </div>\n\n        <!-- PANE 6: AUDIT HISTORY & NOTIFICATIONS LOG -->';
let replaceEnd = html.indexOf(pane5ClosingTarget, startIdx);
if (replaceEnd === -1) {
  replaceEnd = html.indexOf('</div>\n        </div>\n        <!-- PANE 6', startIdx);
}

console.log(`Found boundaries: start=${startIdx}, end=${replaceEnd}`);

const newTcSheetHtml = `<!-- AP Board Official Printable Transfer Certificate Sheet Preview -->
            <div class="exit-tc-sheet-wrapper" id="printableExitTC">
              <div class="exit-tc-sheet">
                <!-- Double Institutional Border Frame -->
                <div class="exit-tc-outer-frame">
                  <div class="exit-tc-inner-frame">

                    <!-- Watermark -->
                    <div class="exit-tc-watermark">
                      <img src="/assets/images/school-logo.jpg" alt="" class="tc-watermark-emblem">
                      <div class="tc-watermark-text">SRI VIDYA E.M. HIGH SCHOOL</div>
                    </div>

                    <!-- 1. STATUTORY AP GOVT & SCHOOL HEADER -->
                    <header class="exit-tc-official-header">
                      <div class="tc-statutory-topline">
                        <span>GOVERNMENT OF ANDHRA PRADESH &bull; DEPARTMENT OF SCHOOL EDUCATION</span>
                        <span class="tc-statutory-badge">FORM OF TRANSFER CERTIFICATE (APPENDIX 16, RULE 99)</span>
                      </div>

                      <div class="tc-brand-grid">
                        <div class="tc-logo-col">
                          <img src="/assets/images/school-logo.jpg" alt="Sri Vidya High School Emblem" class="tc-official-logo">
                        </div>
                        <div class="tc-brand-center">
                          <h2 class="tc-institution-name">SRI VIDYA ENGLISH MEDIUM HIGH SCHOOL</h2>
                          <div class="tc-recognition-text">
                            Recognised by the Government of Andhra Pradesh &bull; Department of School Education
                          </div>
                          <div class="tc-campus-address">
                            Vidyathe Vijayam Campus, Sriharipuram, Visakhapatnam &ndash; 530011, Andhra Pradesh
                          </div>
                          <div class="tc-contact-line">
                            Phone: +91 93985 78584 &bull; Email: srividyaschools2017@gmail.com &bull; Affiliated to AP SSC Board
                          </div>
                          <div class="tc-statutory-numbers">
                            <span class="tc-stat-pill">School U-DISE Code: <strong>28111500408</strong></span>
                            <span class="tc-stat-pill">Govt. Recognition Order: <strong>Rc.No. 412/A4/2017</strong></span>
                            <span class="tc-stat-pill">School Code: <strong>03042</strong></span>
                          </div>
                        </div>
                        <div class="tc-crest-col">
                          <div class="tc-official-round-emblem">
                            <i class="fa-solid fa-graduation-cap"></i>
                            <span>ESTD 2017</span>
                          </div>
                        </div>
                      </div>

                      <div class="tc-header-separator">
                        <div class="tc-sep-line"></div>
                        <div class="tc-sep-diamond">&#9670;</div>
                        <div class="tc-sep-line"></div>
                      </div>
                    </header>

                    <!-- 2. DOCUMENT HEADING & STATUS BANNER -->
                    <div class="tc-heading-section">
                      <div class="tc-title-banner-wrap">
                        <span class="tc-doc-type">OFFICIAL STATUTORY RECORD</span>
                        <h1 class="tc-heading-title">TRANSFER CERTIFICATE</h1>
                        <span class="tc-doc-rules">(Issued under Andhra Pradesh Integrated Educational Rules &amp; Secondary Education Regulations)</span>
                      </div>
                    </div>

                    <!-- 3. DOCUMENT METADATA FOUR-PILLAR BAR -->
                    <div class="tc-metadata-four-pillar">
                      <div class="tc-meta-box">
                        <span class="tc-meta-label">T.C. Serial Number</span>
                        <strong class="tc-meta-val text-primary font-monospace" id="tcDocSerial">TC-2026-0428</strong>
                      </div>
                      <div class="tc-meta-box">
                        <span class="tc-meta-label">Permanent Admission No.</span>
                        <strong class="tc-meta-val font-monospace" id="tcDocAdmNo">SV-0001</strong>
                      </div>
                      <div class="tc-meta-box">
                        <span class="tc-meta-label">PEN / Student ID</span>
                        <strong class="tc-meta-val font-monospace" id="tcDocPenNo">STU-SV-0001</strong>
                      </div>
                      <div class="tc-meta-box">
                        <span class="tc-meta-label">Date of Certificate Issue</span>
                        <strong class="tc-meta-val" id="tcDocIssueDate">09-Nov-2026</strong>
                      </div>
                    </div>

                    <!-- 4. STATUTORY NUMBERED PARTICULARS TABLE (21 PRESCRIBED ITEMS) -->
                    <div class="tc-particulars-wrapper">
                      <table class="tc-particulars-table">
                        <tbody>
                          <tr>
                            <td class="tc-col-idx">1.</td>
                            <td class="tc-col-field">Name of the Pupil (in Block Letters)</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span class="tc-val-highlight" id="tcDocStudentName">RK. SUNIL</span>
                              <span class="tc-aadhaar-pill" id="tcDocAadhaarWrap">
                                <span class="tc-aadhaar-label">Aadhaar No :</span>
                                <strong class="tc-aadhaar-val font-monospace" id="tcDocAadhaar">XXXX-XXXX-9235</strong>
                              </span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">2.</td>
                            <td class="tc-col-field">Name of the Father / Legal Guardian</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data"><span id="tcDocFatherName">Sri S. Mohan Rao</span></td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">3.</td>
                            <td class="tc-col-field">Name of the Mother</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data"><span id="tcDocMotherName">Smt. S. Parvathi</span></td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">4.</td>
                            <td class="tc-col-field">Nationality, Religion &amp; Mother Tongue</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span id="tcDocNationalityReligion">Indian &bull; Hindu &bull; Mother Tongue: Telugu</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">5.</td>
                            <td class="tc-col-field">Whether candidate belongs to SC / ST / BC / OC / EWS</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span id="tcDocCasteCategory">General / OC (Open Category)</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">6.</td>
                            <td class="tc-col-field">Date of Birth (in figures and words) as per General Admission Register</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span class="tc-val-highlight" id="tcDocDob">15-Jun-2011 (Fifteenth June Two Thousand Eleven)</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">7.</td>
                            <td class="tc-col-field">Class in which the pupil was studying at the time of leaving</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span class="tc-val-highlight" id="tcDocClass">Class X (Tenth Standard) &ndash; Section A</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">8.</td>
                            <td class="tc-col-field">Medium of Instruction</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span id="tcDocMedium">English Medium</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">9.</td>
                            <td class="tc-col-field">Subjects Studied</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span id="tcDocSubjects">1. Telugu (First Lang), 2. Hindi (Second Lang), 3. English (Third Lang), 4. Mathematics, 5. General Science, 6. Social Studies</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">10.</td>
                            <td class="tc-col-field">Whether qualified for promotion to a higher class</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span class="tc-val-highlight text-primary" id="tcDocPromotion">Yes, Qualified for Promotion to Next Higher Class (Class XI / Intermediate 1st Year)</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">11.</td>
                            <td class="tc-col-field">Total Number of School Working Days in Academic Session</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span id="tcDocWorkingDays">182 Working Days</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">12.</td>
                            <td class="tc-col-field">Total Number of Working Days pupil attended school</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span class="tc-val-highlight" id="tcDocLastAttendance">172 Days (94.5% Attendance Standing)</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">13.</td>
                            <td class="tc-col-field">Whether all dues to the School have been settled</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span class="tc-val-highlight text-success" id="tcDocFeeStatus">Yes, All Institutional Dues Settled in Full (Zero Dues Cleared)</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">14.</td>
                            <td class="tc-col-field">Any fee concession availed of; if so, the nature</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span id="tcDocConcession">Nil (Standard Board Tariff Paid in Full)</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">15.</td>
                            <td class="tc-col-field">Date on which pupil actually left the school</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span id="tcDocLeavingDate">08-Nov-2026</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">16.</td>
                            <td class="tc-col-field">Date on which application for Transfer Certificate was received</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span id="tcDocAppDate">09-Nov-2026</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">17.</td>
                            <td class="tc-col-field">Date of Issue of Transfer Certificate</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <strong class="text-primary font-monospace" id="tcDocIssueDateRow">09-Nov-2026</strong>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">18.</td>
                            <td class="tc-col-field">Statutory Reason for Leaving the School</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span class="tc-val-highlight" id="tcDocReason">Parent Job Transfer / Family Relocation</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">19.</td>
                            <td class="tc-col-field">General Conduct &amp; Character Evaluation</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span class="tc-val-highlight text-success" id="tcDocConduct">EXEMPLARY &bull; SATISFACTORY IN ALL RESPECTS</span>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">20.</td>
                            <td class="tc-col-field">Personal Marks of Identification</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <div class="tc-ident-lines" id="tcDocIdentification">
                                <div>(i) A small dark mole on the right side of neck below jawline</div>
                                <div>(ii) A distinct birthmark on the left forearm</div>
                              </div>
                            </td>
                          </tr>

                          <tr>
                            <td class="tc-col-idx">21.</td>
                            <td class="tc-col-field">Any Other Remarks / Statutory Registry Reference</td>
                            <td class="tc-col-colon">:</td>
                            <td class="tc-col-data">
                              <span id="tcDocRemarks">Student record verified with General Admission Register Vol. 3, Page 142. All institutional library books, laboratory items and sports equipment surrendered.</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- 5. STATUTORY DECLARATION -->
                    <div class="tc-statutory-declaration-box">
                      <div class="tc-declaration-icon"><i class="fa-solid fa-scale-balanced"></i></div>
                      <div class="tc-declaration-text">
                        <strong>Institutional Statutory Declaration:</strong>
                        I hereby certify that the particulars furnished above are in accordance with the official School General Admission Register, Tabulation Records, and Attendance Ledgers of Sri Vidya English Medium High School, Visakhapatnam, and that no alteration or omission has been made.
                      </div>
                    </div>

                    <!-- 6. SIGNATORIES & OFFICIAL EMBLEM SEAL BLOCK -->
                    <footer class="tc-signatories-grid">
                      <div class="tc-sign-column text-start">
                        <div class="tc-signature-space">
                          <span class="tc-signed-name">Ch. Venkat</span>
                        </div>
                        <div class="tc-signature-line"></div>
                        <strong class="tc-sign-role">Prepared &amp; Verified By</strong>
                        <div class="tc-sign-title">Head Clerk / Administrative Office</div>
                        <div class="tc-sign-date">Date: <span id="tcDocSignDateClerk">09-Nov-2026</span></div>
                      </div>

                      <div class="tc-sign-column text-center">
                        <div class="tc-circular-seal">
                          <div class="tc-seal-inner-circle">
                            <div class="tc-seal-star-top">&starf; &starf; &starf;</div>
                            <div class="tc-seal-school-name">SRI VIDYA E.M. HIGH SCHOOL</div>
                            <div class="tc-seal-center-emblem"><i class="fa-solid fa-graduation-cap"></i></div>
                            <div class="tc-seal-text-mid">OFFICIAL INSTITUTIONAL SEAL</div>
                            <div class="tc-seal-city">VISAKHAPATNAM &bull; 530011</div>
                            <div class="tc-seal-star-bottom">&starf; EST. 2017 &starf;</div>
                          </div>
                        </div>
                        <div class="tc-seal-caption">Institutional Authority Seal</div>
                      </div>

                      <div class="tc-sign-column text-end">
                        <div class="tc-signature-space">
                          <span class="tc-signed-cursive">G. Varalakshmi</span>
                        </div>
                        <div class="tc-signature-line"></div>
                        <strong class="tc-sign-role">Signature of Head of Institution</strong>
                        <div class="tc-sign-title"><strong>Smt. Gorle Varalakshmi</strong></div>
                        <div class="tc-sign-sub">Executive Principal &amp; Headmistress</div>
                        <div class="tc-sign-date">Official Date: <span id="tcDocSignDatePrinc">09-Nov-2026</span></div>
                      </div>
                    </footer>

                    <!-- 7. SECURITY BARCODE / VERIFICATION HASH & AP RULES NOTICE -->
                    <div class="tc-footer-security-bar">
                      <div class="tc-security-left">
                        <span class="tc-statutory-rule-note">
                          <strong>Note 1:</strong> Transfer Certificate issued under A.P. Educational Rules (Recognised under Andhra Pradesh Educational Institutions Act).<br>
                          <strong>Note 2:</strong> In case the pupil migrates to an institution outside Andhra Pradesh, counter-signature by the District Educational Officer (DEO) may be affixed.
                        </span>
                      </div>
                      <div class="tc-security-right">
                        <div class="tc-qr-badge">
                          <div class="tc-qr-icon"><i class="fa-solid fa-qrcode"></i></div>
                          <div class="tc-qr-meta">
                            <span class="tc-qr-hash">DOC HASH: <span id="tcDocSecurityHash">SV-TC-2026-0001-AUTH</span></span>
                            <span class="tc-qr-url">Verify: srividyaschool.edu.in/verify</span>
                          </div>
                        </div>
                        <div class="tc-original-tag">STATUTORY ORIGINAL DOCUMENT</div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>`;

html = html.slice(0, startIdx) + newTcSheetHtml + html.slice(replaceEnd);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✓ Successfully updated administration-portal/index.html with redesigned Transfer Certificate preview');
