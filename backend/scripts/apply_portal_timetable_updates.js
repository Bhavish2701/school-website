const fs = require('fs');
const path = require('path');

const portalPath = path.join(__dirname, '../../frontend/js/portal.js');
let content = fs.readFileSync(portalPath, 'utf8');

const oldTimetableSection = `  // Dashboard Dynamic Timetable Period Definitions
  const DASHBOARD_PERIODS = [
    { id: 1, num: 'Period 1', time: '09:00 – 09:45 AM', start: 540, end: 585, subj: 'Mathematics', teacher: 'Sri P. Satyanarayana' },
    { id: 2, num: 'Period 2', time: '09:45 – 10:30 AM', start: 585, end: 630, subj: 'Physical Science', teacher: 'Sri Navva Anand (VP)' },
    { id: 3, num: 'Period 3', time: '10:30 – 11:15 AM', start: 630, end: 675, subj: 'English Language', teacher: 'Ms. Anjali (VIII-A)' },
    { id: 4, num: 'Period 4', time: '11:15 AM – 12:00 PM', start: 675, end: 720, subj: 'Social Studies', teacher: 'Sri R. Venkata Ramana' },
    { id: 5, num: 'Period 5', time: '12:45 – 01:30 PM', start: 765, end: 810, subj: 'Telugu (1st Lang)', teacher: 'Sri S. Ramana Murthy' },
    { id: 6, num: 'Period 6', time: '01:30 – 02:15 PM', start: 810, end: 855, subj: 'Biology & EVS', teacher: 'Smt. S. Lakshmi' },
    { id: 7, num: 'Period 7', time: '02:15 – 03:00 PM', start: 855, end: 900, subj: 'Computer Science', teacher: 'Sri D. Srinivas (Lab)' },
    { id: 8, num: 'Period 8', time: '03:00 – 03:45 PM', start: 900, end: 945, subj: 'Games & PET', teacher: 'Sri M. Sridhar' }
  ];

  let lastRenderedPeriodMinute = -1;`;

const newTimetableSection = `  // Dashboard Dynamic Timetable Period Definitions (Fallback when offline/before initial fetch)
  const DASHBOARD_FALLBACK_PERIODS = [
    { id: 1, periodNumber: 1, num: 'Period 1', time: '09:00 – 09:45 AM', startTime: '09:00 AM', endTime: '09:45 AM', start: 540, end: 585, startMinutes: 540, endMinutes: 585, subj: 'Mathematics', teacher: 'Sri P. Satyanarayana' },
    { id: 2, periodNumber: 2, num: 'Period 2', time: '09:45 – 10:30 AM', startTime: '09:45 AM', endTime: '10:30 AM', start: 585, end: 630, startMinutes: 585, endMinutes: 630, subj: 'Physical Science', teacher: 'Sri Navva Anand (VP)' },
    { id: 3, periodNumber: 3, num: 'Period 3', time: '10:30 – 11:15 AM', startTime: '10:30 AM', endTime: '11:15 AM', start: 630, end: 675, startMinutes: 630, endMinutes: 675, subj: 'English Language', teacher: 'Ms. Anjali (VIII-A)' },
    { id: 4, periodNumber: 4, num: 'Period 4', time: '11:15 AM – 12:00 PM', startTime: '11:15 AM', endTime: '12:00 PM', start: 675, end: 720, startMinutes: 675, endMinutes: 720, subj: 'Social Studies', teacher: 'Sri R. Venkata Ramana' },
    { id: 5, periodNumber: 5, num: 'Period 5', time: '12:45 – 01:30 PM', startTime: '12:45 PM', endTime: '01:30 PM', start: 765, end: 810, startMinutes: 765, endMinutes: 810, subj: 'Telugu (1st Lang)', teacher: 'Sri S. Ramana Murthy' },
    { id: 6, periodNumber: 6, num: 'Period 6', time: '01:30 – 02:15 PM', startTime: '01:30 PM', endTime: '02:15 PM', start: 810, end: 855, startMinutes: 810, endMinutes: 855, subj: 'Biology & EVS', teacher: 'Smt. S. Lakshmi' },
    { id: 7, periodNumber: 7, num: 'Period 7', time: '02:15 – 03:00 PM', startTime: '02:15 PM', endTime: '03:00 PM', start: 855, end: 900, startMinutes: 855, endMinutes: 900, subj: 'Computer Science', teacher: 'Sri D. Srinivas (Lab)' },
    { id: 8, periodNumber: 8, num: 'Period 8', time: '03:00 – 03:45 PM', startTime: '03:00 PM', endTime: '03:45 PM', start: 900, end: 945, startMinutes: 900, endMinutes: 945, subj: 'Games & PET', teacher: 'Sri M. Sridhar' }
  ];

  // Live state synchronized from MongoDB Timetable & Exam collections
  let dashboardActiveTimetablePeriods = [];
  let dashboardActiveSubstitution = null;
  let dashboardUpcomingExams = [];
  let lastRenderedPeriodMinute = -1;

  function escapeDashHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderDashboardSubstitutionsLive(activeSub) {
    const alertEl = document.getElementById('dashSubstAlert');
    const contentEl = document.getElementById('dashSubstAlertContent');
    const actionBtn = document.getElementById('dashSubstActionBtn');
    if (!alertEl || !contentEl) return;

    if (activeSub && (activeSub.substituteTeacher || activeSub.substitutionId)) {
      alertEl.style.display = 'flex';
      const periodLabel = activeSub.periodName ? activeSub.periodName : \`Period \${activeSub.periodNumber}\`;
      const timeStr = activeSub.time ? \` (\${activeSub.time})\` : '';
      const subjectStr = activeSub.substituteSubject || activeSub.originalSubject || 'General Science';
      const classStr = activeSub.className ? \` in \${activeSub.className}\` : '';
      const reasonStr = activeSub.reason ? \` {\${activeSub.reason}}\` : '';

      contentEl.innerHTML = \`
        <i class="fa-solid fa-arrows-split-up-and-left" style="font-size: 1.1rem; color: #d97706; margin-right: 0.5rem;"></i>
        <div>
          <strong id="dashSubstAlertTitle">Active Teacher Substitution (\${escapeDashHtml(periodLabel)}\${escapeDashHtml(timeStr)}):</strong>
          <span id="dashSubstAlertDetails">
            <strong>\${escapeDashHtml(activeSub.substituteTeacher)}</strong> (\${escapeDashHtml(subjectStr)}) is substituting for <em>\${escapeDashHtml(activeSub.absentTeacher)}</em>\${escapeDashHtml(reasonStr)}\${escapeDashHtml(classStr)}. Timetable fully adjusted.
          </span>
        </div>
      \`;
      if (actionBtn) {
        actionBtn.style.display = 'inline-flex';
      }
    } else {
      alertEl.style.display = 'none';
      if (actionBtn) actionBtn.style.display = 'none';
    }
  }

  function renderDashboardUpcomingExamsLive(examsList) {
    const tbody = document.getElementById('dashUpcomingExamsTableBody');
    const countEl = document.getElementById('dashUpcomingExamsCount');
    if (!tbody) return;

    const list = Array.isArray(examsList) ? examsList : [];
    if (countEl) {
      countEl.textContent = \`\${list.length} Upcoming Examination\${list.length === 1 ? '' : 's'}\`;
    }

    if (list.length === 0) {
      tbody.innerHTML = \`
        <tr>
          <td colspan="6" class="text-center py-4 text-muted" style="text-align: center; padding: 2rem 1rem; color: #64748b;">
            <i class="fa-solid fa-calendar-check" style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #94a3b8; display: block;"></i>
            No upcoming examinations scheduled for the current academic session.
          </td>
        </tr>
      \`;
      return;
    }

    let rowsHtml = '';
    list.forEach(exam => {
      // 1. Exam Name & Description/Code
      const examName = escapeDashHtml(exam.name || 'Examination');
      const examSub = escapeDashHtml(exam.description || (exam.code ? \`Code: \${exam.code}\` : 'AP Board Assessment'));

      // 2. Eligible Classes
      const classesFormatted = escapeDashHtml(exam.classesFormatted || (Array.isArray(exam.classes) ? exam.classes.join(', ') : 'All Classes'));

      // 3. Dates & Schedule
      const datesFormatted = escapeDashHtml(exam.datesFormatted || 'Schedule Announced Soon');
      const timingsFormatted = escapeDashHtml(exam.timings || '09:30 AM – 12:30 PM');

      // 4. Subjects Covered
      const subjectsFormatted = escapeDashHtml(exam.subjectsCovered || (Array.isArray(exam.subjects) ? exam.subjects.map(s => s.name || s).join(', ') : 'All Core Subjects'));

      // 5. Status / Hall Tickets badge
      let statusBadge = '';
      const statusUpper = (exam.status || 'UPCOMING').toUpperCase();
      const hallStatusUpper = (exam.hallTicketStatus || 'PENDING').toUpperCase();

      if (statusUpper === 'ONGOING') {
        statusBadge = \`<span class="badge" style="background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 600;"><i class="fa-solid fa-play"></i> Ongoing Today</span>\`;
      } else if (statusUpper === 'POSTPONED') {
        statusBadge = \`<span class="badge" style="background: #fffbeb; color: #b45309; border: 1px solid #fde68a; font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 600;"><i class="fa-solid fa-clock-rotate-left"></i> Postponed</span>\`;
      } else if (statusUpper === 'CANCELLED') {
        statusBadge = \`<span class="badge" style="background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 600;"><i class="fa-solid fa-ban"></i> Cancelled</span>\`;
      } else if (hallStatusUpper === 'READY' || hallStatusUpper === 'GENERATED') {
        statusBadge = \`<span class="badge" style="background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 600;"><i class="fa-solid fa-check"></i> Hall Tickets Generated</span>\`;
      } else if (hallStatusUpper === 'FINALIZED') {
        statusBadge = \`<span class="badge" style="background: #fffbeb; color: #b45309; border: 1px solid #fde68a; font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 600;"><i class="fa-solid fa-clock"></i> Nominations Finalized</span>\`;
      } else {
        statusBadge = \`<span class="badge" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 600;"><i class="fa-solid fa-calendar-check"></i> Upcoming Schedule</span>\`;
      }

      // 6. Action Button
      const actionLabel = escapeDashHtml(exam.actionLabel || 'View Datesheet');
      const actionBtnHtml = \`
        <button class="btn btn-secondary btn-xs" onclick="if(window.portalApp&&window.portalApp.navigateTo)window.portalApp.navigateTo('examinations');else navigateTo('examinations');" title="Open Examination Portal">
          \${actionLabel}
        </button>
      \`;

      rowsHtml += \`
        <tr>
          <td>
            <div style="font-weight: 700; color: #1e293b;">\${examName}</div>
            <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">\${examSub}</div>
          </td>
          <td>
            <span class="badge badge-outline-primary" style="font-size: 0.75rem; border: 1px solid #bfdbfe; color: #1d4ed8; background: #f0f7ff; padding: 0.2rem 0.5rem; border-radius: 4px;">
              \${classesFormatted}
            </span>
          </td>
          <td>
            <div style="font-weight: 600; color: #334155;">\${datesFormatted}</div>
            <div style="font-size: 0.75rem; color: #64748b;">\${timingsFormatted}</div>
          </td>
          <td>
            <div style="font-size: 0.8rem; color: #334155; max-width: 280px; line-height: 1.35;">\${subjectsFormatted}</div>
          </td>
          <td>\${statusBadge}</td>
          <td>\${actionBtnHtml}</td>
        </tr>
      \`;
    });

    tbody.innerHTML = rowsHtml;
  }

  async function refreshDashboardTimetableAndExams(isManual = false) {
    const refreshIcon = document.getElementById('dashTimetableRefreshIcon');
    if (refreshIcon) refreshIcon.classList.add('fa-spin');

    try {
      const token = localStorage.getItem('sv_token_access') || sessionStorage.getItem('sv_token_access');
      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};

      const resp = await fetch('/api/v1/dashboard/management', { headers });
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.success && json.data) {
          const data = json.data;
          if (data.timetable) {
            if (Array.isArray(data.timetable.periods) && data.timetable.periods.length > 0) {
              dashboardActiveTimetablePeriods = data.timetable.periods;
            }
            dashboardActiveSubstitution = data.timetable.activeSubstitution || null;
            renderDashboardSubstitutionsLive(dashboardActiveSubstitution);
          }
          if (Array.isArray(data.upcomingExams)) {
            dashboardUpcomingExams = data.upcomingExams;
            renderDashboardUpcomingExamsLive(dashboardUpcomingExams);
          }

          const { weekday, currentMinutes } = getISTDateTime();
          lastRenderedPeriodMinute = -1; // force fresh render
          updateDashboardTimetable(weekday, currentMinutes);

          if (isManual && typeof showToast === 'function') {
            showToast('Timetable & examination calendar synchronized with school database.', 'fa-arrows-rotate');
          }
        }
      }
    } catch (err) {
      console.warn('[Dashboard Timetable/Exams Sync] Error:', err);
    } finally {
      if (refreshIcon) refreshIcon.classList.remove('fa-spin');
    }
  }`;

if (!content.includes(oldTimetableSection)) {
  console.error('Target oldTimetableSection not found in portal.js');
  process.exit(1);
}
content = content.replace(oldTimetableSection, newTimetableSection);
console.log('✓ Successfully replaced Timetable definitions and added helper functions');

const oldUpdateTimetable = `  function updateDashboardTimetable(weekday, currentMinutes) {
    const pillEl = document.getElementById('activePeriodPill');
    const railEl = document.getElementById('dashPeriodsRail');

    const isSunday = (weekday === 'Sun');
    const isLunchBreak = (!isSunday && currentMinutes >= 720 && currentMinutes < 765);
    const isMorningPrep = (!isSunday && currentMinutes < 540);
    const isRemedial = (!isSunday && currentMinutes >= 945 && currentMinutes < 1020);
    const isDispersed = (!isSunday && currentMinutes >= 1020);

    // Find active period
    const activePeriod = (!isSunday && !isLunchBreak && !isMorningPrep && !isRemedial && !isDispersed)
      ? DASHBOARD_PERIODS.find(p => currentMinutes >= p.start && currentMinutes < p.end)
      : null;

    // Update Header Pill
    if (pillEl) {
      if (isSunday) {
        pillEl.className = 'dash-pill gray';
        pillEl.style.cssText = 'background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;';
        pillEl.innerHTML = '<i class="fa-solid fa-calendar-xmark"></i> Sunday Holiday • Campus Closed';
      } else if (isMorningPrep) {
        pillEl.className = 'dash-pill blue';
        pillEl.style.cssText = '';
        pillEl.innerHTML = '<i class="fa-solid fa-bell"></i> Morning Assembly &amp; Roll Call (08:30 – 09:00 AM) • Next: Period 1 at 09:00 AM';
      } else if (isLunchBreak) {
        pillEl.className = 'dash-pill amber';
        pillEl.style.cssText = 'background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-weight:700;';
        pillEl.innerHTML = '<i class="fa-solid fa-utensils"></i> Lunch Break Active (12:00 – 12:45 PM) • Next: Period 5 at 12:45 PM';
      } else if (activePeriod) {
        pillEl.className = 'dash-pill blue';
        pillEl.style.cssText = '';
        pillEl.innerHTML = \`<i class="fa-solid fa-circle-play"></i> \${activePeriod.num} Active (\${activePeriod.time}) • \${activePeriod.subj}\`;
      } else if (isRemedial) {
        pillEl.className = 'dash-pill emerald';
        pillEl.style.cssText = 'background:#d1fae5; color:#065f46; border:1px solid #a7f3d0;';
        pillEl.innerHTML = '<i class="fa-solid fa-book-reader"></i> Remedial &amp; Special Study Coaching (Class IX &amp; X) • Regular Periods Concluded';
      } else {
        pillEl.className = 'dash-pill gray';
        pillEl.style.cssText = 'background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;';
        pillEl.innerHTML = '<i class="fa-solid fa-school-circle-check"></i> Campus Dispersed • Next Academic Session Tomorrow 09:00 AM';
      }
    }

    // Only re-render cards when minute changes or on initial render
    if (lastRenderedPeriodMinute === currentMinutes && railEl && railEl.children.length > 0) {
      return;
    }
    lastRenderedPeriodMinute = currentMinutes;

    if (!railEl) return;

    // Render Period Cards
    let html = '';
    DASHBOARD_PERIODS.forEach((p, idx) => {
      let cardClass = 'dash-period-card';
      let statusLabel = p.num;

      if (isSunday) {
        statusLabel = \`\${p.num}\`;
      } else if (currentMinutes >= p.start && currentMinutes < p.end) {
        cardClass += ' active';
        statusLabel = \`\${p.num} • LIVE\`;
      } else if (currentMinutes >= p.end) {
        cardClass += ' completed';
        statusLabel = \`\${p.num} <span style="font-size:0.68rem; color:#10b981; font-weight:700; margin-left:3px;"><i class="fa-solid fa-check"></i> Done</span>\`;
      } else {
        // Upcoming
        const isNext = (isLunchBreak && p.id === 5) || (!isLunchBreak && DASHBOARD_PERIODS.find(op => op.id === p.id - 1 && currentMinutes >= op.end && currentMinutes < p.start));
        if (isNext) {
          cardClass += ' next-period';
          statusLabel = \`\${p.num} <span style="font-size:0.65rem; color:#2563eb; font-weight:700;">(Next)</span>\`;
        } else {
          statusLabel = p.num;
        }
      }

      html += \`
        <div class="\${cardClass}">
          <div class="dash-period-num">\${statusLabel}</div>
          <div class="dash-period-time">\${p.time}</div>
          <div class="dash-period-subj">\${p.subj}</div>
          <div class="dash-period-teacher">\${p.teacher}</div>
        </div>
      \`;
    });

    railEl.innerHTML = html;
  }`;

const newUpdateTimetable = `  function updateDashboardTimetable(weekday, currentMinutes) {
    const pillEl = document.getElementById('activePeriodPill');
    const railEl = document.getElementById('dashPeriodsRail');

    const periodsToUse = (Array.isArray(dashboardActiveTimetablePeriods) && dashboardActiveTimetablePeriods.length > 0)
      ? dashboardActiveTimetablePeriods
      : DASHBOARD_FALLBACK_PERIODS;

    const isSunday = (weekday === 'Sun');
    const isLunchBreak = (!isSunday && currentMinutes >= 720 && currentMinutes < 765);
    const isMorningPrep = (!isSunday && currentMinutes < 540);
    const isRemedial = (!isSunday && currentMinutes >= 945 && currentMinutes < 1020);
    const isDispersed = (!isSunday && currentMinutes >= 1020);

    // Find active period
    const activePeriod = (!isSunday && !isLunchBreak && !isMorningPrep && !isRemedial && !isDispersed)
      ? periodsToUse.find(p => currentMinutes >= p.start && currentMinutes < p.end)
      : null;

    // Update Header Pill
    if (pillEl) {
      if (isSunday) {
        pillEl.className = 'dash-pill gray';
        pillEl.style.cssText = 'background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;';
        pillEl.innerHTML = '<i class="fa-solid fa-calendar-xmark"></i> Sunday Holiday • Campus Closed';
      } else if (isMorningPrep) {
        pillEl.className = 'dash-pill blue';
        pillEl.style.cssText = '';
        pillEl.innerHTML = '<i class="fa-solid fa-bell"></i> Morning Assembly &amp; Roll Call (08:30 – 09:00 AM) • Next: Period 1 at 09:00 AM';
      } else if (isLunchBreak) {
        pillEl.className = 'dash-pill amber';
        pillEl.style.cssText = 'background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-weight:700;';
        pillEl.innerHTML = '<i class="fa-solid fa-utensils"></i> Lunch Break Active (12:00 – 12:45 PM) • Next: Period 5 at 12:45 PM';
      } else if (activePeriod) {
        pillEl.className = 'dash-pill blue';
        pillEl.style.cssText = '';
        const subNote = activePeriod.isSubstituted ? \` [Sub: \${escapeDashHtml(activePeriod.teacher)}]\` : '';
        pillEl.innerHTML = \`<i class="fa-solid fa-circle-play"></i> \${escapeDashHtml(activePeriod.num)} Active (\${escapeDashHtml(activePeriod.time)}) • \${escapeDashHtml(activePeriod.subj)}\${subNote}\`;
      } else if (isRemedial) {
        pillEl.className = 'dash-pill emerald';
        pillEl.style.cssText = 'background:#d1fae5; color:#065f46; border:1px solid #a7f3d0;';
        pillEl.innerHTML = '<i class="fa-solid fa-book-reader"></i> Remedial &amp; Special Study Coaching (Class IX &amp; X) • Regular Periods Concluded';
      } else {
        pillEl.className = 'dash-pill gray';
        pillEl.style.cssText = 'background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;';
        pillEl.innerHTML = '<i class="fa-solid fa-school-circle-check"></i> Campus Dispersed • Next Academic Session Tomorrow 09:00 AM';
      }
    }

    // Only re-render cards when minute changes or on initial render
    if (lastRenderedPeriodMinute === currentMinutes && railEl && railEl.children.length > 0 && !railEl.querySelector('.text-muted')) {
      return;
    }
    lastRenderedPeriodMinute = currentMinutes;

    if (!railEl) return;

    // Render Period Cards
    let html = '';
    periodsToUse.forEach((p, idx) => {
      let cardClass = 'dash-period-card';
      let statusLabel = p.num;

      if (isSunday) {
        statusLabel = \`\${escapeDashHtml(p.num)}\`;
      } else if (currentMinutes >= p.start && currentMinutes < p.end) {
        cardClass += ' active';
        statusLabel = \`\${escapeDashHtml(p.num)} • LIVE\`;
      } else if (currentMinutes >= p.end) {
        cardClass += ' completed';
        statusLabel = \`\${escapeDashHtml(p.num)} <span style="font-size:0.68rem; color:#10b981; font-weight:700; margin-left:3px;"><i class="fa-solid fa-check"></i> Done</span>\`;
      } else {
        // Upcoming
        const isNext = (isLunchBreak && p.id === 5) || (!isLunchBreak && periodsToUse.find(op => op.id === p.id - 1 && currentMinutes >= op.end && currentMinutes < p.start));
        if (isNext) {
          cardClass += ' next-period';
          statusLabel = \`\${escapeDashHtml(p.num)} <span style="font-size:0.65rem; color:#2563eb; font-weight:700;">(Next)</span>\`;
        } else {
          statusLabel = escapeDashHtml(p.num);
        }
      }

      const teacherDisplay = p.isSubstituted
        ? \`<span style="color:#d97706; font-weight:600;"><i class="fa-solid fa-user-clock" style="font-size:0.75rem;"></i> \${escapeDashHtml(p.teacher)}</span> <span style="font-size:0.68rem; color:#64748b;">(Sub)</span>\`
        : escapeDashHtml(p.teacher);

      html += \`
        <div class="\${cardClass}">
          <div class="dash-period-num">\${statusLabel}</div>
          <div class="dash-period-time">\${escapeDashHtml(p.time)}</div>
          <div class="dash-period-subj">\${escapeDashHtml(p.subj)}</div>
          <div class="dash-period-teacher">\${teacherDisplay}</div>
        </div>
      \`;
    });

    railEl.innerHTML = html;
  }`;

if (!content.includes(oldUpdateTimetable)) {
  console.error('Target oldUpdateTimetable not found in portal.js');
  process.exit(1);
}
content = content.replace(oldUpdateTimetable, newUpdateTimetable);
console.log('✓ Successfully replaced updateDashboardTimetable');

const oldLiveMetricsTail = `    // 7. Live Synced IST Timestamp
    const syncTimeEl = document.getElementById('dashLastSyncTime');
    if (syncTimeEl) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      syncTimeEl.textContent = 'Live Synced: ' + timeStr + ' IST';
    }
  }`;

const newLiveMetricsTail = `    // 7. Live Synced IST Timestamp
    const syncTimeEl = document.getElementById('dashLastSyncTime');
    if (syncTimeEl) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      syncTimeEl.textContent = 'Live Synced: ' + timeStr + ' IST';
    }

    // 8. Timetable & Upcoming Exams Dynamic Real-Time Sync
    if (data.timetable) {
      if (Array.isArray(data.timetable.periods) && data.timetable.periods.length > 0) {
        dashboardActiveTimetablePeriods = data.timetable.periods;
      }
      dashboardActiveSubstitution = data.timetable.activeSubstitution || null;
      renderDashboardSubstitutionsLive(dashboardActiveSubstitution);
      const { weekday, currentMinutes } = getISTDateTime();
      updateDashboardTimetable(weekday, currentMinutes);
    }

    if (Array.isArray(data.upcomingExams)) {
      dashboardUpcomingExams = data.upcomingExams;
      renderDashboardUpcomingExamsLive(dashboardUpcomingExams);
    }
  }`;

if (!content.includes(oldLiveMetricsTail)) {
  console.error('Target oldLiveMetricsTail not found in portal.js');
  process.exit(1);
}
content = content.replace(oldLiveMetricsTail, newLiveMetricsTail);
console.log('✓ Successfully updated renderDashboardLiveMetrics');

const oldExportTarget = `    // Scholastic Report Card Workflow Exports
    openGenerateReportModal,
    switchReportStage,
    navigateReportStage,
    validateAndProceedToStage4,
    handleReportScopeChange,
    handleReportStudentSelect,
    filterIndividualStudentSearch,
    handleStudentQuickSearch,
    toggleAllStudentSelection,
    handleReportMultiCheckboxChange,
    filterMultiStudentTable,
    handleReportClassChange,
    handleConfigClassChange,
    handleExamCycleChange,
    handleReportTemplateChange,
    validateReportAcademicData,
    populatePreviewStudentPicker,
    handlePreviewStudentChange,
    renderA4ReportCardPreview,
    printReportCardCanvas,
    downloadReportCardPDF,
    submitReportForVerification,
    handlePrincipalReportDecision,
    generateOfficialReportCards,
    toggleOfficialReportPublication,
    refreshReportHistoryTable,
    viewIssuedReportCard,
    saveReportConfigurationDraft,
    submitGenerateReport,
    generateReportCard,
    generateReportCardForStudent,
    generateReportCardForActiveStudent,
  };`;

const newExportTarget = `    // Scholastic Report Card Workflow Exports
    openGenerateReportModal,
    switchReportStage,
    navigateReportStage,
    validateAndProceedToStage4,
    handleReportScopeChange,
    handleReportStudentSelect,
    filterIndividualStudentSearch,
    handleStudentQuickSearch,
    toggleAllStudentSelection,
    handleReportMultiCheckboxChange,
    filterMultiStudentTable,
    handleReportClassChange,
    handleConfigClassChange,
    handleExamCycleChange,
    handleReportTemplateChange,
    validateReportAcademicData,
    populatePreviewStudentPicker,
    handlePreviewStudentChange,
    renderA4ReportCardPreview,
    printReportCardCanvas,
    downloadReportCardPDF,
    submitReportForVerification,
    handlePrincipalReportDecision,
    generateOfficialReportCards,
    toggleOfficialReportPublication,
    refreshReportHistoryTable,
    viewIssuedReportCard,
    saveReportConfigurationDraft,
    submitGenerateReport,
    generateReportCard,
    generateReportCardForStudent,
    generateReportCardForActiveStudent,

    // Timetable & Upcoming Exams Exports
    renderDashboardUpcomingExamsLive,
    renderDashboardSubstitutionsLive,
    refreshDashboardTimetableAndExams: refreshDashboardTimetableAndExams,
  };`;

if (!content.includes(oldExportTarget)) {
  console.error('Target oldExportTarget not found in portal.js');
  process.exit(1);
}
content = content.replace(oldExportTarget, newExportTarget);
console.log('✓ Successfully added timetable & exam exports to portalApp');

fs.writeFileSync(portalPath, content, 'utf8');
console.log('✓ Successfully written updated portal.js');
