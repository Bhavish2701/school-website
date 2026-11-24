const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../../frontend/administration-portal/index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

const oldFeeSectionTarget = `            <!-- =================================================================
               SECTION 5: FEE COLLECTION AND OUTSTANDING DUES
               ================================================================= -->
            <div class="dash-section" id="dashSectionFeeDues">
              <div class="dash-section-header">
                <div class="dash-header-title">
                  <div class="dash-header-icon emerald">
                    <i class="fa-solid fa-indian-rupee-sign"></i>
                  </div>
                  <div class="dash-header-text">
                    <h3>Fee Collection &amp; Outstanding Dues Overview</h3>
                    <p>Daily counter takings, Term 2 collection realization, concession audits, and class-wise
                      outstanding dues ledgers.</p>
                  </div>
                </div>
                <div class="dash-header-actions">
                  <button class="btn btn-secondary btn-sm" onclick="portalApp.sendFeeReminders()">
                    <i class="fa-solid fa-paper-plane"></i> Broadcast Fee Reminders
                  </button>
                  <button class="btn btn-secondary btn-sm" onclick="portalApp.navigateTo('fees')">
                    <i class="fa-solid fa-receipt"></i> Open Fee Counter
                  </button>
                </div>
              </div>

              <!-- Financial Intelligence 3-Cards Row -->
              <div class="dash-grid-3" style="margin-bottom: 1.25rem;">
                <div class="dash-fee-card">
                  <div class="dash-fee-icon">
                    <i class="fa-solid fa-cash-register"></i>
                  </div>
                  <div>
                    <div class="dash-fee-num">₹1,42,500</div>
                    <div class="dash-fee-label">Today's Counter Collections</div>
                    <div class="dash-fee-sub">18 Receipts Issued Today (Cash: ₹45K • UPI: ₹97.5K)</div>
                  </div>
                </div>

                <div class="dash-fee-card">
                  <div class="dash-fee-icon blue">
                    <i class="fa-solid fa-chart-pie"></i>
                  </div>
                  <div>
                    <div class="dash-fee-num">₹28.40 Lakh</div>
                    <div class="dash-fee-label">Term 2 Total Collected (87.1%)</div>
                    <div class="dash-fee-sub" style="color: var(--color-primary);">₹32.60L Target • 438 of 500 Cleared
                    </div>
                  </div>
                </div>

                <div class="dash-fee-card">
                  <div class="dash-fee-icon amber">
                    <i class="fa-solid fa-file-invoice-dollar"></i>
                  </div>
                  <div>
                    <div class="dash-fee-num" style="color: #d97706;">₹4.20 Lakh</div>
                    <div class="dash-fee-label">Outstanding Dues (42 Students)</div>
                    <div class="dash-fee-sub" style="color: #d97706;">30 Overdue &gt; 15 Days • Reminders Sent</div>
                  </div>
                </div>
              </div>

              <!-- Top Overdue Dues Ledger -->
              <div style="margin-top: 1rem;">
                <h4
                  style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--color-text-dark, #0f172a);">
                  <i class="fa-solid fa-triangle-exclamation text-amber" style="margin-right: 0.35rem;"></i> High
                  Priority Outstanding Dues Requiring Management Follow-up
                </h4>
                <div class="dash-table-wrap">
                  <table class="dash-table">
                    <thead>
                      <tr>
                        <th>Student &amp; Roll #</th>
                        <th>Class &amp; Section</th>
                        <th>Parent / Guardian</th>
                        <th>Pending Amount</th>
                        <th>Overdue Days</th>
                        <th>Previous Reminder</th>
                        <th style="text-align: right;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>B. Sai Kiran</strong>
                          <div class="dash-entity-sub">Roll #SV-0089</div>
                        </td>
                        <td><span class="dash-pill blue">Class X-A</span></td>
                        <td>
                          <div>Sri B. Prakash</div>
                          <div class="dash-entity-sub"><i class="fa-solid fa-phone"></i> +91 93980 12345</div>
                        </td>
                        <td><strong style="color: #dc2626;">₹12,500</strong></td>
                        <td><span class="dash-pill red">18 Days</span></td>
                        <td>SMS on 18 Oct 2026</td>
                        <td style="text-align: right;">
                          <button class="btn btn-secondary btn-xs"
                            onclick="portalApp.sendFeeReminder('+91 93980 12345', 'B. Sai Kiran', '12,500')">
                            <i class="fa-solid fa-paper-plane"></i> Send SMS
                          </button>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <strong>K. Meghana</strong>
                          <div class="dash-entity-sub">Roll #SV-0174</div>
                        </td>
                        <td><span class="dash-pill blue">Class IX-A</span></td>
                        <td>
                          <div>Sri K. Suresh</div>
                          <div class="dash-entity-sub"><i class="fa-solid fa-phone"></i> +91 94412 88990</div>
                        </td>
                        <td><strong style="color: #dc2626;">₹10,000</strong></td>
                        <td><span class="dash-pill amber">14 Days</span></td>
                        <td>SMS on 20 Oct 2026</td>
                        <td style="text-align: right;">
                          <button class="btn btn-secondary btn-xs"
                            onclick="portalApp.sendFeeReminder('+91 94412 88990', 'K. Meghana', '10,000')">
                            <i class="fa-solid fa-paper-plane"></i> Send SMS
                          </button>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <strong>N. Naveen</strong>
                          <div class="dash-entity-sub">Roll #SV-0255</div>
                        </td>
                        <td><span class="dash-pill blue">Class VII-A</span></td>
                        <td>
                          <div>Sri N. Appa Rao</div>
                          <div class="dash-entity-sub"><i class="fa-solid fa-phone"></i> +91 98485 33441</div>
                        </td>
                        <td><strong style="color: #dc2626;">₹8,500</strong></td>
                        <td><span class="dash-pill red">22 Days</span></td>
                        <td>WhatsApp on 15 Oct 2026</td>
                        <td style="text-align: right;">
                          <button class="btn btn-secondary btn-xs"
                            onclick="portalApp.sendFeeReminder('+91 98485 33441', 'N. Naveen', '8,500')">
                            <i class="fa-solid fa-paper-plane"></i> Send SMS
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>`;

const newFeeSectionContent = `            <!-- =================================================================
               SECTION 5: FEE COLLECTION AND OUTSTANDING DUES
               ================================================================= -->
            <div class="dash-section" id="dashSectionFeeDues">
              <div class="dash-section-header">
                <div class="dash-header-title">
                  <div class="dash-header-icon emerald">
                    <i class="fa-solid fa-indian-rupee-sign"></i>
                  </div>
                  <div class="dash-header-text">
                    <h3>Fee Collection &amp; Outstanding Dues Overview</h3>
                    <p>Daily counter takings, Term 2 collection realization, concession audits, and class-wise
                      outstanding dues ledgers.</p>
                  </div>
                </div>
                <div class="dash-header-actions">
                  <button class="btn btn-secondary btn-sm" id="btnBroadcastFeeReminders" onclick="portalApp.broadcastFeeReminders()">
                    <i class="fa-solid fa-paper-plane" id="dashBroadcastRemindersIcon"></i> Broadcast Fee Reminders
                  </button>
                  <button class="btn btn-secondary btn-sm" onclick="portalApp.navigateTo('fees')">
                    <i class="fa-solid fa-receipt"></i> Open Fee Counter
                  </button>
                  <button class="btn btn-secondary btn-sm" id="btnRefreshFeeDues" onclick="portalApp.refreshDashboardFeeDues(true)" title="Synchronize Financial Ledger">
                    <i class="fa-solid fa-arrows-rotate" id="dashFeeRefreshIcon"></i>
                  </button>
                </div>
              </div>

              <!-- Financial Intelligence 3-Cards Row -->
              <div class="dash-grid-3" style="margin-bottom: 1.25rem;">
                <div class="dash-fee-card">
                  <div class="dash-fee-icon">
                    <i class="fa-solid fa-cash-register"></i>
                  </div>
                  <div>
                    <div class="dash-fee-num" id="dashFeeTodayAmount">₹1,42,500</div>
                    <div class="dash-fee-label">Today's Counter Collections</div>
                    <div class="dash-fee-sub" id="dashFeeTodaySub">2 Receipts Issued Today (Cash: ₹45K • UPI: ₹97.5K)</div>
                  </div>
                </div>

                <div class="dash-fee-card">
                  <div class="dash-fee-icon blue">
                    <i class="fa-solid fa-chart-pie"></i>
                  </div>
                  <div>
                    <div class="dash-fee-num" id="dashFeeTermAmount">₹2.09 Lakh</div>
                    <div class="dash-fee-label" id="dashFeeTermLabel">Term 2 Total Collected (87.1%)</div>
                    <div class="dash-fee-sub" style="color: var(--color-primary);" id="dashFeeTermSub">₹2.40L Target • 6 of 9 Cleared</div>
                  </div>
                </div>

                <div class="dash-fee-card">
                  <div class="dash-fee-icon amber">
                    <i class="fa-solid fa-file-invoice-dollar"></i>
                  </div>
                  <div>
                    <div class="dash-fee-num" style="color: #d97706;" id="dashFeeOutstandingAmount">₹31,000</div>
                    <div class="dash-fee-label" id="dashFeeOutstandingLabel">Outstanding Dues (3 Students)</div>
                    <div class="dash-fee-sub" style="color: #d97706;" id="dashFeeOutstandingSub">2 Overdue &gt; 15 Days • Reminders Sent (3)</div>
                  </div>
                </div>
              </div>

              <!-- Top Overdue Dues Ledger -->
              <div style="margin-top: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                  <h4
                    style="font-size: 0.95rem; font-weight: 700; margin: 0; color: var(--color-text-dark, #0f172a);">
                    <i class="fa-solid fa-triangle-exclamation text-amber" style="margin-right: 0.35rem;"></i> High
                    Priority Outstanding Dues Requiring Management Follow-up
                  </h4>
                  <span class="dash-pill neutral" id="dashFeeDefaultersCount" style="font-size: 0.75rem;">3 Students with Dues</span>
                </div>
                <div class="dash-table-wrap">
                  <table class="dash-table">
                    <thead>
                      <tr>
                        <th>Student &amp; Roll #</th>
                        <th>Class &amp; Section</th>
                        <th>Parent / Guardian</th>
                        <th>Pending Amount</th>
                        <th>Overdue Days</th>
                        <th>Previous Reminder</th>
                        <th style="text-align: right;">Action</th>
                      </tr>
                    </thead>
                    <tbody id="dashFeeDefaultersTableBody">
                      <tr>
                        <td colspan="7" class="text-center py-4 text-muted" style="text-align: center; padding: 2rem 1rem; color: #64748b;">
                          <i class="fa-solid fa-circle-notch fa-spin mr-1"></i> Synchronizing financial ledger...
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>`;

if (!content.includes(oldFeeSectionTarget)) {
  console.error('Target oldFeeSectionTarget not found in index.html');
  process.exit(1);
}

content = content.replace(oldFeeSectionTarget, newFeeSectionContent);
fs.writeFileSync(htmlPath, content, 'utf8');
console.log('✓ Successfully updated fee section in frontend/administration-portal/index.html');
