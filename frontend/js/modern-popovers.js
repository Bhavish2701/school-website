
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ModernPopovers = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let initialized = false;
  let activeTooltip = null;
  let activePopover = null;
  let activeContextMenu = null;
  let activeHoverCard = null;
  let hoverCardTimeout = null;
  let activeBackdrop = null;

  const REACTIONS_LIST = [
    { emoji: '👍', name: 'Like' },
    { emoji: '❤️', name: 'Love' },
    { emoji: '👏', name: 'Celebrate' },
    { emoji: '🌟', name: 'Star' },
    { emoji: '🎯', name: 'Goal' },
    { emoji: '💡', name: 'Insight' }
  ];

  function init(container) {
    const root = container || document;

    initTooltips(root);
    initDropdowns(root);
    initContextMenus(root);
    initInfoCards(root);
    initDatePickers(root);
    initReactions(root);
    initHoverCards(root);
    initShareSheets(root);

    if (!initialized) {
      initialized = true;
      initGlobalListeners();
      observeDynamicContent();
    }
  }

  function initTooltips(root) {
    const targets = root.querySelectorAll('[data-tooltip]');
    targets.forEach(el => {
      if (el.dataset.svTooltipInit) return;
      el.dataset.svTooltipInit = 'true';

      function show(e) {
        if (document.querySelector('.notif-flyout.active')) return;
        const text = el.getAttribute('data-tooltip') || el.getAttribute('title');
        if (!text) return;

        hideTooltip();

        const tip = document.createElement('div');
        tip.className = 'sv-tooltip';
        tip.setAttribute('role', 'tooltip');
        tip.innerHTML = escapeHtml(text) + '<div class="sv-tooltip-arrow"></div>';
        document.body.appendChild(tip);
        activeTooltip = tip;

        const pos = el.getAttribute('data-tooltip-pos') || 'top';
        positionElement(el, tip, pos, 8);

        requestAnimationFrame(() => {
          tip.classList.add('visible');
        });
      }

      function hide() {
        hideTooltip();
      }

      el.addEventListener('mouseenter', show);
      el.addEventListener('mouseleave', hide);
      el.addEventListener('focus', show);
      el.addEventListener('blur', hide);

      el.addEventListener('touchstart', (e) => {
        show(e);
        setTimeout(hide, 2500);
      }, { passive: true });
    });
  }

  function hideTooltip() {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
  }

  function initDropdowns(root) {
    const toggles = root.querySelectorAll(
      '[data-dropdown], [data-bs-toggle="dropdown"], [data-toggle="dropdown"], .sv-dropdown-toggle'
    );

    toggles.forEach(btn => {
      if (btn.dataset.svDropdownInit) return;
      btn.dataset.svDropdownInit = 'true';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const parent = btn.closest('.sv-dropdown, .dropdown');
        const menu = parent ? parent.querySelector('.sv-dropdown-menu, .dropdown-menu') : null;
        if (!menu) return;

        const isCurrentlyOpen = menu.classList.contains('show');
        closeAllDropdowns();

        if (!isCurrentlyOpen) {
          menu.classList.add('show');
          btn.setAttribute('aria-expanded', 'true');

          const rect = menu.getBoundingClientRect();
          if (rect.bottom > window.innerHeight - 10) {
            menu.classList.add('flip-up');
          } else {
            menu.classList.remove('flip-up');
          }

          menu.setAttribute('tabindex', '-1');
          const firstItem = menu.querySelector('.sv-dropdown-item, .dropdown-item, a, button');
          if (firstItem) firstItem.focus();
        }
      });
    });
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.sv-dropdown-menu.show, .dropdown-menu.show').forEach(m => {
      m.classList.remove('show');
      m.classList.remove('flip-up');
    });
    document.querySelectorAll('[data-dropdown][aria-expanded="true"], [data-bs-toggle="dropdown"][aria-expanded="true"]').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function initContextMenus(root) {
    const targets = root.querySelectorAll('[data-context-menu], .context-menu-trigger');
    targets.forEach(target => {
      if (target.dataset.svContextInit) return;
      target.dataset.svContextInit = 'true';

      target.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu(target, e.clientX, e.clientY);
      });

      let touchTimer = null;
      target.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        touchTimer = setTimeout(() => {
          openContextMenu(target, touch.clientX, touch.clientY, true);
        }, 500);
      }, { passive: true });

      target.addEventListener('touchend', () => {
        if (touchTimer) clearTimeout(touchTimer);
      });
      target.addEventListener('touchmove', () => {
        if (touchTimer) clearTimeout(touchTimer);
      });
    });
  }

  function openContextMenu(target, clientX, clientY, isMobile = false) {
    closeAllOverlays();

    const title = target.getAttribute('data-context-title') || 'Quick Actions';
    const menu = document.createElement('div');
    menu.className = 'sv-context-menu';
    if (isMobile || window.innerWidth <= 768) {
      menu.classList.add('mobile-bottom-sheet');
      showBackdrop(() => closeAllOverlays());
    }

    const recordId = target.getAttribute('data-record-id') || target.getAttribute('data-student-id') || '';
    const recordName = target.getAttribute('data-record-name') || target.getAttribute('data-student-name') || 'Item';

    menu.innerHTML = `
      ${isMobile || window.innerWidth <= 768 ? '<div class="sv-sheet-drag-handle"></div>' : ''}
      <div class="sv-context-menu-title">
        <span><i class="fa-solid fa-bolt mr-1"></i> ${escapeHtml(title)}</span>
        <span style="font-size: 0.68rem; color: #94A3B8;">${escapeHtml(recordId || recordName)}</span>
      </div>
      <button type="button" class="sv-context-menu-item" data-action="view">
        <span class="sv-context-menu-item-left"><i class="fa-solid fa-eye"></i> View Details</span>
        <span class="sv-context-menu-shortcut">Enter</span>
      </button>
      <button type="button" class="sv-context-menu-item" data-action="edit">
        <span class="sv-context-menu-item-left"><i class="fa-solid fa-pen-to-square"></i> Edit Record</span>
        <span class="sv-context-menu-shortcut">E</span>
      </button>
      <button type="button" class="sv-context-menu-item" data-action="copy">
        <span class="sv-context-menu-item-left"><i class="fa-solid fa-copy"></i> Copy Identifier</span>
        <span class="sv-context-menu-shortcut">⌘C</span>
      </button>
      <button type="button" class="sv-context-menu-item" data-action="share">
        <span class="sv-context-menu-item-left"><i class="fa-solid fa-share-nodes"></i> Share Link</span>
      </button>
      <div class="sv-dropdown-divider"></div>
      <button type="button" class="sv-context-menu-item sv-dropdown-item danger" data-action="archive">
        <span class="sv-context-menu-item-left"><i class="fa-solid fa-box-archive"></i> Archive Record</span>
      </button>
    `;

    document.body.appendChild(menu);
    activeContextMenu = menu;

    if (!menu.classList.contains('mobile-bottom-sheet')) {
      const menuWidth = 210;
      const menuHeight = 220;
      let x = clientX;
      let y = clientY;

      if (x + menuWidth > window.innerWidth - 10) x = window.innerWidth - menuWidth - 10;
      if (y + menuHeight > window.innerHeight - 10) y = window.innerHeight - menuHeight - 10;

      menu.style.left = `${Math.max(10, x)}px`;
      menu.style.top = `${Math.max(10, y)}px`;
    }

    requestAnimationFrame(() => {
      menu.classList.add('visible');
    });

    menu.querySelectorAll('.sv-context-menu-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        closeAllOverlays();

        if (action === 'copy') {
          copyToClipboard(recordId || recordName);
        } else if (action === 'share') {
          openShareSheet(target);
        }

        target.dispatchEvent(new CustomEvent('sv-context-action', {
          bubbles: true,
          detail: { action, recordId, recordName }
        }));
      });
    });
  }

  function initInfoCards(root) {
    const targets = root.querySelectorAll('[data-info-card]');
    targets.forEach(target => {
      if (target.dataset.svInfoInit) return;
      target.dataset.svInfoInit = 'true';

      target.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (activePopover && activePopover._trigger === target) {
          closeAllOverlays();
          return;
        }

        closeAllOverlays();

        const title = target.getAttribute('data-info-title') || 'Information';
        const content = target.getAttribute('data-info-content') || '';
        const badge = target.getAttribute('data-info-badge') || '';

        const card = document.createElement('div');
        card.className = 'sv-info-card';
        card._trigger = target;
        card.innerHTML = `
          <div class="sv-info-card-header">
            <h4 class="sv-info-card-title"><i class="fa-solid fa-circle-info"></i> ${escapeHtml(title)}</h4>
            <button type="button" class="sv-info-card-close" aria-label="Close">&times;</button>
          </div>
          <div class="sv-info-card-body">
            ${content}
            ${badge ? `<div class="sv-info-card-badge">${escapeHtml(badge)}</div>` : ''}
          </div>
        `;

        document.body.appendChild(card);
        activePopover = card;

        positionElement(target, card, 'bottom', 10);
        requestAnimationFrame(() => card.classList.add('visible'));

        card.querySelector('.sv-info-card-close').addEventListener('click', (ev) => {
          ev.stopPropagation();
          closeAllOverlays();
        });
      });
    });
  }

  function initDatePickers(root) {
    const dateInputs = root.querySelectorAll('[data-datepicker], input.sv-datepicker-input');
    dateInputs.forEach(input => {
      if (input.dataset.svDatepickerInit) return;
      input.dataset.svDatepickerInit = 'true';

      input.addEventListener('click', (e) => {
        e.stopPropagation();
        openDatePicker(input);
      });
    });
  }

  function openDatePicker(input) {
    if (activePopover && activePopover._trigger === input) {
      closeAllOverlays();
      return;
    }

    closeAllOverlays();

    let currentDate = new Date();
    if (input.value) {
      const parts = input.value.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          currentDate = new Date(y, m, d);
        }
      }
    }

    let viewYear = currentDate.getFullYear();
    let viewMonth = currentDate.getMonth();

    const picker = document.createElement('div');
    picker.className = 'sv-datepicker-popover';
    picker._trigger = input;

    function renderCalendar() {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

      let daysHtml = '';

      for (let i = firstDay - 1; i >= 0; i--) {
        daysHtml += `<div class="sv-dp-day other-month">${daysInPrevMonth - i}</div>`;
      }

      const today = new Date();
      const isCurrentMonth = (today.getFullYear() === viewYear && today.getMonth() === viewMonth);

      for (let day = 1; day <= daysInMonth; day++) {
        const isToday = isCurrentMonth && (today.getDate() === day);
        const isSelected = (currentDate.getFullYear() === viewYear && currentDate.getMonth() === viewMonth && currentDate.getDate() === day);

        daysHtml += `
          <div class="sv-dp-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-day="${day}">
            ${day}
          </div>
        `;
      }

      picker.innerHTML = `
        <div class="sv-dp-header">
          <button type="button" class="sv-dp-nav-btn sv-dp-prev" aria-label="Previous Month"><i class="fa-solid fa-chevron-left"></i></button>
          <div class="sv-dp-title">${monthNames[viewMonth]} ${viewYear}</div>
          <button type="button" class="sv-dp-nav-btn sv-dp-next" aria-label="Next Month"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        <div class="sv-dp-grid-weekdays">
          <div class="sv-dp-weekday">Su</div>
          <div class="sv-dp-weekday">Mo</div>
          <div class="sv-dp-weekday">Tu</div>
          <div class="sv-dp-weekday">We</div>
          <div class="sv-dp-weekday">Th</div>
          <div class="sv-dp-weekday">Fr</div>
          <div class="sv-dp-weekday">Sa</div>
        </div>
        <div class="sv-dp-grid-days">
          ${daysHtml}
        </div>
        <div class="sv-dp-footer">
          <button type="button" class="sv-dp-quick-btn sv-dp-today-btn">Today</button>
          <button type="button" class="sv-dp-quick-btn sv-dp-clear-btn" style="color:#DC2626;">Clear</button>
        </div>
      `;

      picker.querySelector('.sv-dp-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        viewMonth--;
        if (viewMonth < 0) {
          viewMonth = 11;
          viewYear--;
        }
        renderCalendar();
      });

      picker.querySelector('.sv-dp-next').addEventListener('click', (e) => {
        e.stopPropagation();
        viewMonth++;
        if (viewMonth > 11) {
          viewMonth = 0;
          viewYear++;
        }
        renderCalendar();
      });

      picker.querySelector('.sv-dp-today-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        selectDate(new Date());
      });

      picker.querySelector('.sv-dp-clear-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        closeAllOverlays();
      });

      picker.querySelectorAll('.sv-dp-day[data-day]').forEach(cell => {
        cell.addEventListener('click', (e) => {
          e.stopPropagation();
          const day = parseInt(cell.dataset.day, 10);
          selectDate(new Date(viewYear, viewMonth, day));
        });
      });
    }

    function selectDate(d) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const formatted = `${dd}/${mm}/${yyyy}`;

      input.value = formatted;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      closeAllOverlays();
    }

    renderCalendar();
    document.body.appendChild(picker);
    activePopover = picker;

    positionElement(input, picker, 'bottom', 6);
    requestAnimationFrame(() => picker.classList.add('visible'));
  }

  function initReactions(root) {
    const targets = root.querySelectorAll('[data-reactions], .sv-reactions-trigger');
    targets.forEach(target => {
      if (target.dataset.svReactionsInit) return;
      target.dataset.svReactionsInit = 'true';

      target.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (activePopover && activePopover._trigger === target) {
          closeAllOverlays();
          return;
        }

        closeAllOverlays();

        const bar = document.createElement('div');
        bar.className = 'sv-reactions-bar';
        bar._trigger = target;

        bar.innerHTML = REACTIONS_LIST.map(r => `
          <button type="button" class="sv-reaction-btn" data-emoji="${r.emoji}" title="${r.name}" aria-label="${r.name}">
            ${r.emoji}
          </button>
        `).join('');

        document.body.appendChild(bar);
        activePopover = bar;

        positionElement(target, bar, 'top', 8);
        requestAnimationFrame(() => bar.classList.add('visible'));

        bar.querySelectorAll('.sv-reaction-btn').forEach(btn => {
          btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const emoji = btn.dataset.emoji;

            let pill = target.parentNode.querySelector(`.sv-reaction-pill[data-emoji="${emoji}"]`);
            if (pill) {
              const countEl = pill.querySelector('.reaction-count');
              let count = parseInt(countEl.textContent, 10) || 1;
              countEl.textContent = count + 1;
            } else {
              pill = document.createElement('span');
              pill.className = 'sv-reaction-pill';
              pill.dataset.emoji = emoji;
              pill.innerHTML = `<span>${emoji}</span> <span class="reaction-count">1</span>`;
              target.parentNode.appendChild(pill);
            }

            target.dispatchEvent(new CustomEvent('sv-reaction-selected', {
              bubbles: true,
              detail: { emoji }
            }));

            closeAllOverlays();
          });
        });
      });
    });
  }

  function initHoverCards(root) {
    const targets = root.querySelectorAll('[data-hover-card]');
    targets.forEach(target => {
      if (target.dataset.svHoverInit) return;
      target.dataset.svHoverInit = 'true';

      function show() {
        if (hoverCardTimeout) clearTimeout(hoverCardTimeout);

        hoverCardTimeout = setTimeout(() => {
          if (activeHoverCard && activeHoverCard._trigger === target) return;
          closeHoverCard();

          const name = target.getAttribute('data-hover-name') || 'Sri Vidya Member';
          const role = target.getAttribute('data-hover-role') || 'Student';
          const sub = target.getAttribute('data-hover-sub') || 'Grade 10A • Roll #14';
          const stat1 = target.getAttribute('data-hover-stat1') || '96%|Attd';
          const stat2 = target.getAttribute('data-hover-stat2') || 'A+|GPA';
          const stat3 = target.getAttribute('data-hover-stat3') || '12|Merits';

          const [s1Val, s1Lbl] = stat1.split('|');
          const [s2Val, s2Lbl] = stat2.split('|');
          const [s3Val, s3Lbl] = stat3.split('|');

          const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

          const card = document.createElement('div');
          card.className = 'sv-hover-card';
          card._trigger = target;

          card.innerHTML = `
            <div class="sv-hover-card-top">
              <div class="sv-hover-avatar">${initials}</div>
              <div class="sv-hover-info">
                <h4 class="sv-hover-name">${escapeHtml(name)}</h4>
                <p class="sv-hover-subtitle">${escapeHtml(sub)}</p>
                <span class="sv-hover-badge ${role.toLowerCase().includes('teacher') ? 'role' : 'active'}">
                  ${escapeHtml(role)}
                </span>
              </div>
            </div>
            <div class="sv-hover-stats">
              <div>
                <div class="sv-hover-stat-val">${escapeHtml(s1Val)}</div>
                <div class="sv-hover-stat-lbl">${escapeHtml(s1Lbl)}</div>
              </div>
              <div>
                <div class="sv-hover-stat-val">${escapeHtml(s2Val)}</div>
                <div class="sv-hover-stat-lbl">${escapeHtml(s2Lbl)}</div>
              </div>
              <div>
                <div class="sv-hover-stat-val">${escapeHtml(s3Val)}</div>
                <div class="sv-hover-stat-lbl">${escapeHtml(s3Lbl)}</div>
              </div>
            </div>
            <div class="sv-hover-actions">
              <button type="button" class="sv-hover-btn sv-hover-btn-primary hover-view-profile">
                <i class="fa-solid fa-address-card"></i> Dossier
              </button>
              <button type="button" class="sv-hover-btn sv-hover-btn-outline hover-quick-msg">
                <i class="fa-solid fa-comment-dots"></i> Message
              </button>
            </div>
          `;

          document.body.appendChild(card);
          activeHoverCard = card;

          positionElement(target, card, 'bottom', 10);
          requestAnimationFrame(() => card.classList.add('visible'));

          card.addEventListener('mouseenter', () => {
            if (hoverCardTimeout) clearTimeout(hoverCardTimeout);
          });
          card.addEventListener('mouseleave', () => {
            scheduleHoverCardClose();
          });

          card.querySelector('.hover-view-profile').addEventListener('click', () => {
            closeHoverCard();
            target.dispatchEvent(new CustomEvent('sv-view-profile', { bubbles: true }));
          });
        }, 220);
      }

      function scheduleHoverCardClose() {
        if (hoverCardTimeout) clearTimeout(hoverCardTimeout);
        hoverCardTimeout = setTimeout(() => {
          closeHoverCard();
        }, 200);
      }

      target.addEventListener('mouseenter', show);
      target.addEventListener('mouseleave', scheduleHoverCardClose);

      target.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          show();
        }
      });
    });
  }

  function closeHoverCard() {
    if (activeHoverCard) {
      activeHoverCard.remove();
      activeHoverCard = null;
    }
  }

  function initShareSheets(root) {
    const targets = root.querySelectorAll('[data-share-sheet], .sv-share-btn');
    targets.forEach(target => {
      if (target.dataset.svShareInit) return;
      target.dataset.svShareInit = 'true';

      target.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openShareSheet(target);
      });
    });
  }

  function openShareSheet(target) {
    if (activePopover && activePopover._trigger === target) {
      closeAllOverlays();
      return;
    }

    closeAllOverlays();

    const title = target.getAttribute('data-share-title') || document.title || 'Sri Vidya ERP Record';
    const url = target.getAttribute('data-share-url') || window.location.href;
    const isMobile = window.innerWidth <= 768;

    const sheet = document.createElement('div');
    sheet.className = 'sv-share-sheet';
    sheet._trigger = target;

    if (isMobile) {
      sheet.classList.add('mobile-bottom-sheet');
      showBackdrop(() => closeAllOverlays());
    }

    sheet.innerHTML = `
      ${isMobile ? '<div class="sv-sheet-drag-handle"></div>' : ''}
      <div class="sv-share-header">
        <h4 class="sv-share-title"><i class="fa-solid fa-share-nodes"></i> Share &amp; Export</h4>
        <button type="button" class="sv-share-close" aria-label="Close">&times;</button>
      </div>
      <div class="sv-share-copy-box">
        <input type="text" class="sv-share-copy-input" readonly value="${escapeHtml(url)}">
        <button type="button" class="sv-share-copy-btn">
          <i class="fa-solid fa-copy"></i> <span>Copy</span>
        </button>
      </div>
      <div class="sv-share-grid">
        <button type="button" class="sv-share-option share-whatsapp">
          <div class="sv-share-icon-circle sv-share-icon-whatsapp"><i class="fa-brands fa-whatsapp"></i></div>
          <span class="sv-share-label">WhatsApp</span>
        </button>
        <button type="button" class="sv-share-option share-print">
          <div class="sv-share-icon-circle sv-share-icon-print"><i class="fa-solid fa-print"></i></div>
          <span class="sv-share-label">Print PDF</span>
        </button>
        <button type="button" class="sv-share-option share-email">
          <div class="sv-share-icon-circle sv-share-icon-email"><i class="fa-solid fa-envelope"></i></div>
          <span class="sv-share-label">Email</span>
        </button>
        <button type="button" class="sv-share-option share-native">
          <div class="sv-share-icon-circle sv-share-icon-device"><i class="fa-solid fa-ellipsis"></i></div>
          <span class="sv-share-label">More</span>
        </button>
      </div>
    `;

    document.body.appendChild(sheet);
    activePopover = sheet;

    if (!isMobile) {
      positionElement(target, sheet, 'bottom', 8);
    }
    requestAnimationFrame(() => sheet.classList.add('visible'));

    const copyBtn = sheet.querySelector('.sv-share-copy-btn');
    copyBtn.addEventListener('click', () => {
      copyToClipboard(url);
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Copied!</span>';
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> <span>Copy</span>';
      }, 2000);
    });

    sheet.querySelector('.share-whatsapp').addEventListener('click', () => {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' - ' + url)}`, '_blank');
      closeAllOverlays();
    });

    sheet.querySelector('.share-print').addEventListener('click', () => {
      window.print();
      closeAllOverlays();
    });

    sheet.querySelector('.share-email').addEventListener('click', () => {
      window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
      closeAllOverlays();
    });

    sheet.querySelector('.share-native').addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title, url }).catch(() => {});
      } else {
        copyToClipboard(url);
      }
      closeAllOverlays();
    });

    sheet.querySelector('.sv-share-close').addEventListener('click', () => {
      closeAllOverlays();
    });
  }

  function positionElement(trigger, overlay, preferredPos = 'top', offset = 8) {
    const triggerRect = trigger.getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();

    let pos = preferredPos;
    let top = 0;
    let left = 0;

    if (pos === 'top' && triggerRect.top - overlayRect.height - offset < 8) {
      pos = 'bottom';
    } else if (pos === 'bottom' && triggerRect.bottom + overlayRect.height + offset > window.innerHeight - 8) {
      pos = 'top';
    }

    overlay.setAttribute('data-pos', pos);

    if (pos === 'top') {
      top = triggerRect.top - overlayRect.height - offset;
      left = triggerRect.left + (triggerRect.width - overlayRect.width) / 2;
    } else if (pos === 'bottom') {
      top = triggerRect.bottom + offset;
      left = triggerRect.left + (triggerRect.width - overlayRect.width) / 2;
    } else if (pos === 'left') {
      top = triggerRect.top + (triggerRect.height - overlayRect.height) / 2;
      left = triggerRect.left - overlayRect.width - offset;
    } else if (pos === 'right') {
      top = triggerRect.top + (triggerRect.height - overlayRect.height) / 2;
      left = triggerRect.right + offset;
    }

    if (left < 8) left = 8;
    if (left + overlayRect.width > window.innerWidth - 8) {
      left = window.innerWidth - overlayRect.width - 8;
    }

    overlay.style.top = `${Math.round(top)}px`;
    overlay.style.left = `${Math.round(left)}px`;
  }

  function showBackdrop(onClick) {
    removeBackdrop();
    const bd = document.createElement('div');
    bd.className = 'sv-overlay-backdrop';
    document.body.appendChild(bd);
    activeBackdrop = bd;

    requestAnimationFrame(() => bd.classList.add('visible'));

    bd.addEventListener('click', () => {
      if (typeof onClick === 'function') onClick();
      removeBackdrop();
    });
  }

  function removeBackdrop() {
    if (activeBackdrop) {
      activeBackdrop.remove();
      activeBackdrop = null;
    }
  }

  function closeAllOverlays() {
    hideTooltip();
    closeAllDropdowns();
    closeHoverCard();
    removeBackdrop();

    if (activePopover) {
      activePopover.remove();
      activePopover = null;
    }
    if (activeContextMenu) {
      activeContextMenu.remove();
      activeContextMenu = null;
    }
  }

  function initGlobalListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.closest(
        '.sv-dropdown-menu, .sv-info-card, .sv-datepicker-popover, .sv-reactions-bar, .sv-hover-card, .sv-share-sheet, .sv-context-menu'
      )) {
        return;
      }
      closeAllOverlays();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllOverlays();
      }
    });

    window.addEventListener('scroll', () => {
      if (activeTooltip) hideTooltip();
      if (activeHoverCard) closeHoverCard();
    }, { passive: true });
  }

  function observeDynamicContent() {
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.addedNodes && m.addedNodes.length > 0) {
          m.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              if (node.matches && (node.matches('[data-tooltip], [data-dropdown], [data-context-menu], [data-info-card], [data-datepicker], [data-reactions], [data-hover-card], [data-share-sheet]') || node.querySelector('[data-tooltip], [data-dropdown]'))) {
                init(node);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (err) {}
    ta.remove();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init());
    } else {
      init();
    }
  }

  return {
    init,
    initTooltips,
    hideTooltip,
    initDropdowns,
    initContextMenus,
    initInfoCards,
    initDatePickers,
    initReactions,
    initHoverCards,
    initShareSheets,
    closeAllOverlays,
    openContextMenu,
    openShareSheet
  };
}));
