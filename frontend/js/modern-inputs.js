
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ModernInputs = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let initialized = false;

  function init(container) {
    const root = container || document;

    enhanceFloatingLabels(root);
    enhancePasswords(root);
    enhanceSearches(root);
    enhanceOtpInputs(root);
    enhanceSteppers(root);
    enhanceTagsInputs(root);
    enhanceDateMasks(root);
    enhanceRealtimeValidation(root);

    if (!initialized) {
      initialized = true;
      observeDynamicContent();
    }
  }

  function enhanceFloatingLabels(root) {
    const floatingGroups = root.querySelectorAll('.sv-floating-group, .form-floating');
    floatingGroups.forEach(group => {
      if (group.dataset.enhancedFloating) return;
      group.dataset.enhancedFloating = 'true';

      const input = group.querySelector('input, select, textarea');
      const label = group.querySelector('label');
      if (!input || !label) return;

      if (!input.getAttribute('placeholder')) {
        input.setAttribute('placeholder', ' ');
      }

      if (label.nextElementSibling === input || label.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING) {
        group.appendChild(label);
      }

      function checkFilled() {
        const val = input.value !== undefined ? String(input.value).trim() : '';
        if (val.length > 0) {
          group.classList.add('is-filled');
        } else {
          group.classList.remove('is-filled');
        }
      }

      input.addEventListener('input', checkFilled);
      input.addEventListener('change', checkFilled);
      input.addEventListener('blur', checkFilled);
      checkFilled();
    });
  }

  function enhancePasswords(root) {
    const passwordInputs = root.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
      if (input.dataset.enhancedPassword) return;
      input.dataset.enhancedPassword = 'true';

      const parentContainer = input.closest('.input-container, .sv-password-wrap') || input.parentNode;
      const existingToggle = parentContainer ? parentContainer.querySelector('.pwd-toggle-btn, .sv-password-toggle') : null;

      if (existingToggle) {
        return;
      }

      let wrap = input.closest('.sv-password-wrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'sv-password-wrap';
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);
      }

      let toggleBtn = wrap.querySelector('.sv-password-toggle, .pwd-toggle-btn');
      if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'sv-password-toggle';
        toggleBtn.setAttribute('aria-label', 'Toggle password visibility');
        toggleBtn.setAttribute('tabindex', '-1');
        toggleBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
        wrap.appendChild(toggleBtn);
      }

      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isPassword = (input.type === 'password');
        input.type = isPassword ? 'text' : 'password';
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
        }
      });

      const shouldHaveMeter = input.dataset.strengthMeter !== undefined ||
        input.id.includes('newPass') ||
        input.id.includes('createPass') ||
        input.id.includes('resetPass');

      if (shouldHaveMeter) {
        let meter = wrap.parentNode.querySelector('.password-strength-container');
        if (!meter) {
          meter = document.createElement('div');
          meter.className = 'password-strength-container';
          meter.innerHTML = `
            <div class="password-strength-bars">
              <div class="password-strength-segment"></div>
              <div class="password-strength-segment"></div>
              <div class="password-strength-segment"></div>
              <div class="password-strength-segment"></div>
            </div>
            <div class="password-strength-label">
              <span>Password Security:</span>
              <span class="strength-text">None</span>
            </div>
            <div class="password-criteria-list">
              <div class="password-criteria-item" data-rule="length"><i class="fa-solid fa-circle-check"></i> 8+ characters</div>
              <div class="password-criteria-item" data-rule="upper"><i class="fa-solid fa-circle-check"></i> Uppercase</div>
              <div class="password-criteria-item" data-rule="lower"><i class="fa-solid fa-circle-check"></i> Lowercase</div>
              <div class="password-criteria-item" data-rule="number"><i class="fa-solid fa-circle-check"></i> Number</div>
              <div class="password-criteria-item" data-rule="special"><i class="fa-solid fa-circle-check"></i> Special char</div>
            </div>
          `;
          wrap.parentNode.insertBefore(meter, wrap.nextSibling);
        }

        if (meter) {
          input.addEventListener('input', () => evaluatePasswordStrength(input.value, meter));
          evaluatePasswordStrength(input.value, meter);
        }
      }
    });
  }

  function evaluatePasswordStrength(val, meter) {
    if (!meter) return;
    const value = val || '';
    const rules = {
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[^A-Za-z0-9]/.test(value)
    };

    let score = 0;
    Object.keys(rules).forEach(rule => {
      const item = meter.querySelector(`[data-rule="${rule}"]`);
      if (item) {
        if (rules[rule]) {
          item.classList.add('met');
        } else {
          item.classList.remove('met');
        }
      }
      if (rules[rule]) score++;
    });

    meter.className = 'password-strength-container';
    const textEl = meter.querySelector('.strength-text');

    if (value.length === 0) {
      if (textEl) textEl.textContent = 'None';
    } else if (score <= 2) {
      meter.classList.add('strength-level-weak');
      if (textEl) textEl.textContent = 'Weak';
    } else if (score === 3) {
      meter.classList.add('strength-level-fair');
      if (textEl) textEl.textContent = 'Fair';
    } else if (score === 4) {
      meter.classList.add('strength-level-good');
      if (textEl) textEl.textContent = 'Good';
    } else {
      meter.classList.add('strength-level-strong');
      if (textEl) textEl.textContent = 'Strong';
    }
  }

  function enhanceSearches(root) {
    const searchInputs = root.querySelectorAll(
      'input[type="search"], .search-input, [data-role="search"], .pa-search-input, input[id*="Search" i], input[placeholder*="Search" i]'
    );

    searchInputs.forEach(input => {
      if (input.dataset.enhancedSearch) return;
      if (input.type === 'hidden' || input.disabled) return;
      input.dataset.enhancedSearch = 'true';

      let wrap = input.closest('.header-search, .search-group, .pa-search-wrap, .sv-search-wrap, .search-input-wrap, .portal-search-box');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'sv-search-wrap';
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);
      } else {
        wrap.classList.add('sv-search-wrap');
      }

      let icon = wrap.querySelector('.sv-search-icon, .search-icon, .fa-magnifying-glass');
      if (!icon) {
        icon = document.createElement('i');
        icon.className = 'fa-solid fa-magnifying-glass sv-search-icon';
        wrap.insertBefore(icon, input);
      }

      let clearBtn = wrap.querySelector('.sv-search-clear, .adm-clear-btn');
      if (!clearBtn) {
        clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'sv-search-clear';
        clearBtn.setAttribute('aria-label', 'Clear search text');
        clearBtn.setAttribute('tabindex', '-1');
        clearBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        wrap.appendChild(clearBtn);
      }

      const shortcut = wrap.querySelector('.search-shortcut');

      function updateClearState() {
        const val = input.value !== undefined ? String(input.value).trim() : '';
        if (val.length > 0) {
          clearBtn.classList.add('visible');
          if (shortcut) shortcut.style.display = 'none';
        } else {
          clearBtn.classList.remove('visible');
          if (shortcut) shortcut.style.display = '';
        }
      }

      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        input.value = '';
        updateClearState();
        input.focus();

        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Escape' }));
      });

      input.addEventListener('input', updateClearState);
      input.addEventListener('keyup', updateClearState);
      input.addEventListener('focus', updateClearState);
      updateClearState();
    });
  }

  function enhanceOtpInputs(root) {
    const otpGroups = root.querySelectorAll('.sv-otp-group, .otp-input-container, [data-role="otp"]');
    otpGroups.forEach(group => {
      if (group.dataset.enhancedOtp) return;
      group.dataset.enhancedOtp = 'true';

      if (group.id && group.id.includes('unifiedOtp')) {
        return;
      }

      const digits = group.querySelectorAll('input');
      if (digits.length === 0) return;

      digits.forEach((digit, idx) => {
        digit.setAttribute('maxlength', '1');
        digit.setAttribute('inputmode', 'numeric');
        digit.setAttribute('pattern', '[0-9]*');
        digit.setAttribute('autocomplete', 'one-time-code');
        digit.classList.add('sv-otp-digit');

        digit.addEventListener('input', () => {
          const val = digit.value.replace(/\D/g, '');
          digit.value = val ? val[0] : '';

          if (digit.value) {
            digit.classList.add('filled');
            if (idx < digits.length - 1) {
              digits[idx + 1].focus();
              digits[idx + 1].select();
            }
          } else {
            digit.classList.remove('filled');
          }

          checkOtpCompletion(digits, group);
        });

        digit.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace') {
            if (!digit.value && idx > 0) {
              digits[idx - 1].focus();
              digits[idx - 1].value = '';
              digits[idx - 1].classList.remove('filled');
              e.preventDefault();
            } else {
              digit.classList.remove('filled');
            }
          } else if (e.key === 'ArrowLeft' && idx > 0) {
            digits[idx - 1].focus();
            digits[idx - 1].select();
            e.preventDefault();
          } else if (e.key === 'ArrowRight' && idx < digits.length - 1) {
            digits[idx + 1].focus();
            digits[idx + 1].select();
            e.preventDefault();
          }
        });

        digit.addEventListener('paste', (e) => {
          e.preventDefault();
          const pastedData = (e.clipboardData || window.clipboardData).getData('text');
          const cleanNumbers = pastedData.replace(/\D/g, '');
          if (!cleanNumbers) return;

          cleanNumbers.split('').slice(0, digits.length).forEach((num, i) => {
            if (digits[i]) {
              digits[i].value = num;
              digits[i].classList.add('filled');
            }
          });

          const focusIdx = Math.min(cleanNumbers.length, digits.length - 1);
          digits[focusIdx].focus();
          checkOtpCompletion(digits, group);
        });
      });
    });
  }

  function checkOtpCompletion(digits, group) {
    const fullCode = Array.from(digits).map(d => d.value).join('');
    if (fullCode.length === digits.length) {
      group.dispatchEvent(new CustomEvent('sv-otp-complete', {
        bubbles: true,
        detail: { code: fullCode }
      }));
    }
  }

  function enhanceSteppers(root) {
    const stepperInputs = root.querySelectorAll('input[data-stepper], .sv-stepper-input');
    stepperInputs.forEach(input => {
      if (input.dataset.enhancedStepper) return;
      input.dataset.enhancedStepper = 'true';

      let container = input.closest('.sv-stepper-field');
      if (!container) {
        container = document.createElement('div');
        container.className = 'sv-stepper-field';
        input.parentNode.insertBefore(container, input);

        const minusBtn = document.createElement('button');
        minusBtn.type = 'button';
        minusBtn.className = 'sv-stepper-btn stepper-minus';
        minusBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';
        minusBtn.setAttribute('aria-label', 'Decrease value');
        minusBtn.setAttribute('tabindex', '-1');

        const plusBtn = document.createElement('button');
        plusBtn.type = 'button';
        plusBtn.className = 'sv-stepper-btn stepper-plus';
        plusBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        plusBtn.setAttribute('aria-label', 'Increase value');
        plusBtn.setAttribute('tabindex', '-1');

        container.appendChild(minusBtn);
        container.appendChild(input);
        container.appendChild(plusBtn);

        input.classList.add('sv-stepper-input');

        const step = parseFloat(input.getAttribute('step')) || 1;
        const min = input.getAttribute('min') !== null ? parseFloat(input.getAttribute('min')) : -Infinity;
        const max = input.getAttribute('max') !== null ? parseFloat(input.getAttribute('max')) : Infinity;

        function updateBounds() {
          const val = parseFloat(input.value) || 0;
          minusBtn.disabled = val <= min;
          plusBtn.disabled = val >= max;
        }

        minusBtn.addEventListener('click', (e) => {
          e.preventDefault();
          let val = parseFloat(input.value) || 0;
          val = Math.max(min, val - step);
          input.value = val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          updateBounds();
        });

        plusBtn.addEventListener('click', (e) => {
          e.preventDefault();
          let val = parseFloat(input.value) || 0;
          val = Math.min(max, val + step);
          input.value = val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          updateBounds();
        });

        input.addEventListener('input', updateBounds);
        input.addEventListener('change', () => {
          let val = parseFloat(input.value);
          if (isNaN(val)) val = (min !== -Infinity ? min : 0);
          val = Math.min(max, Math.max(min, val));
          input.value = val;
          updateBounds();
        });

        updateBounds();
      }
    });
  }

  function enhanceTagsInputs(root) {
    const tagInputs = root.querySelectorAll('input[data-role="tags"], .sv-tags-input');
    tagInputs.forEach(input => {
      if (input.dataset.enhancedTags) return;
      input.dataset.enhancedTags = 'true';

      const container = document.createElement('div');
      container.className = 'sv-tags-container';
      input.parentNode.insertBefore(container, input);
      input.style.display = 'none';

      const innerInput = document.createElement('input');
      innerInput.type = 'text';
      innerInput.className = 'sv-tags-input-field';
      innerInput.placeholder = input.placeholder || 'Type and press Enter...';
      container.appendChild(innerInput);

      let tags = input.value ? input.value.split(',').map(t => t.trim()).filter(Boolean) : [];

      function renderTags() {
        container.querySelectorAll('.sv-tag-pill').forEach(el => el.remove());
        tags.forEach((tag, idx) => {
          const pill = document.createElement('span');
          pill.className = 'sv-tag-pill';
          pill.innerHTML = `<span>${escapeHtml(tag)}</span><button type="button" class="sv-tag-remove" aria-label="Remove tag">&times;</button>`;
          pill.querySelector('.sv-tag-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            tags.splice(idx, 1);
            syncTags();
          });
          container.insertBefore(pill, innerInput);
        });
      }

      function syncTags() {
        input.value = tags.join(', ');
        renderTags();
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      innerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const val = innerInput.value.replace(',', '').trim();
          if (val && !tags.includes(val)) {
            tags.push(val);
            innerInput.value = '';
            syncTags();
          }
        } else if (e.key === 'Backspace' && !innerInput.value && tags.length > 0) {
          tags.pop();
          syncTags();
        }
      });

      container.addEventListener('click', () => innerInput.focus());
      renderTags();
    });
  }

  function enhanceDateMasks(root) {
    const dateInputs = root.querySelectorAll('input[data-mask="date"], .sv-date-mask');
    dateInputs.forEach(input => {
      if (input.dataset.enhancedDateMask) return;
      input.dataset.enhancedDateMask = 'true';

      input.setAttribute('placeholder', input.placeholder || 'DD/MM/YYYY');
      input.setAttribute('maxlength', '10');

      let wrap = input.closest('.sv-date-wrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'sv-date-wrap';
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);

        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-calendar-days sv-date-icon';
        wrap.appendChild(icon);
      }

      input.addEventListener('input', () => {
        let val = input.value.replace(/\D/g, '').slice(0, 8);
        if (val.length >= 5) {
          val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
        } else if (val.length >= 3) {
          val = `${val.slice(0, 2)}/${val.slice(2)}`;
        }
        input.value = val;
      });

      input.addEventListener('blur', () => {
        if (!input.value) {
          clearValidationState(input);
          return;
        }
        const parts = input.value.split('/');
        if (parts.length === 3) {
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          const y = parseInt(parts[2], 10);
          const isValidDate = (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100);
          if (isValidDate) {
            setValidationState(input, true);
          } else {
            setValidationState(input, false, 'Invalid calendar date format (DD/MM/YYYY)');
          }
        } else {
          setValidationState(input, false, 'Please enter a complete date (DD/MM/YYYY)');
        }
      });
    });
  }

  function enhanceRealtimeValidation(root) {
    const fields = root.querySelectorAll(
      'input[required], input[type="email"], input[type="tel"], input[data-validate], select[required], textarea[required]'
    );

    fields.forEach(field => {
      if (field.dataset.enhancedValidation) return;
      if (field.type === 'hidden' || field.disabled || field.classList.contains('sv-otp-digit') || field.classList.contains('otp-digit')) return;
      field.dataset.enhancedValidation = 'true';

      function validate() {
        const val = field.value !== undefined ? String(field.value).trim() : '';

        if (field.hasAttribute('required') && !val) {
          setValidationState(field, false, 'This field is required');
          return;
        }

        if (field.type === 'email' && val) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            setValidationState(field, false, 'Please enter a valid email address');
            return;
          }
        }

        if ((field.type === 'tel' || field.dataset.validate === 'phone') && val) {
          const cleanPhone = val.replace(/[\s\-\(\)\+]/g, '');
          if (!/^[6-9]\d{9}$/.test(cleanPhone) && cleanPhone.length !== 10) {
            setValidationState(field, false, 'Enter a valid 10-digit mobile number');
            return;
          }
        }

        const minLen = field.getAttribute('minlength') || field.dataset.minLength;
        if (minLen && val.length < parseInt(minLen, 10)) {
          setValidationState(field, false, `Minimum ${minLen} characters required`);
          return;
        }

        if (val) {
          setValidationState(field, true);
        } else {
          clearValidationState(field);
        }
      }

      field.addEventListener('blur', validate);
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) {
          validate();
        }
      });
    });
  }

  function getFeedbackAnchor(field) {
    if (!field) return null;
    const wrapper = field.closest(
      '.input-container, .input-wrapper, .sv-password-wrap, .school-input-wrap, .search-input-wrap, .input-group, .has-icon-left, .has-icon-right, .portal-search-box'
    );
    return wrapper || field;
  }

  function setValidationState(field, isValid, errorMsg) {
    const wrapper = field.closest(
      '.input-container, .input-wrapper, .sv-password-wrap, .school-input-wrap, .search-input-wrap, .input-group, .has-icon-left, .has-icon-right'
    );

    if (isValid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
      field.setAttribute('aria-invalid', 'false');
      if (wrapper) {
        wrapper.classList.remove('is-invalid');
        wrapper.classList.add('is-valid');
      }
      removeFeedback(field);
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');
      field.setAttribute('aria-invalid', 'true');
      if (wrapper) {
        wrapper.classList.remove('is-valid');
        wrapper.classList.add('is-invalid');
      }
      showFeedback(field, errorMsg || 'This field is required');
    }
  }

  function clearValidationState(field) {
    const wrapper = field.closest(
      '.input-container, .input-wrapper, .sv-password-wrap, .school-input-wrap, .search-input-wrap, .input-group, .has-icon-left, .has-icon-right'
    );
    field.classList.remove('is-valid', 'is-invalid');
    field.removeAttribute('aria-invalid');
    if (wrapper) {
      wrapper.classList.remove('is-valid', 'is-invalid');
    }
    removeFeedback(field);
  }

  function showFeedback(field, msg) {
    removeFeedback(field);
    const anchor = getFeedbackAnchor(field);
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback show';
    feedback.setAttribute('role', 'alert');
    feedback.setAttribute('aria-live', 'polite');
    feedback.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${escapeHtml(msg)}</span>`;

    if (anchor && anchor.parentNode) {
      anchor.insertAdjacentElement('afterend', feedback);
    } else if (field.parentNode) {
      field.parentNode.appendChild(feedback);
    }
  }

  function removeFeedback(field) {
    if (!field) return;
    const anchor = getFeedbackAnchor(field);
    if (anchor && anchor.nextElementSibling && (anchor.nextElementSibling.classList.contains('invalid-feedback') || anchor.nextElementSibling.classList.contains('valid-feedback') || anchor.nextElementSibling.classList.contains('skeuo-field-error'))) {
      anchor.nextElementSibling.remove();
    }
    const parent = field.parentNode;
    if (parent) {
      parent.querySelectorAll('.invalid-feedback, .valid-feedback, .skeuo-field-error').forEach(el => el.remove());
      const fg = field.closest('.form-group, .portal-form-group, .form-floating, .sv-floating-group, .edit-student-group, .col-md-12, .col-md-8, .col-md-6, .col-md-4, .col-md-3, .col-12, .col-6');
      if (fg) {
        fg.querySelectorAll('.invalid-feedback, .valid-feedback, .skeuo-field-error').forEach(el => el.remove());
      }
    }
  }

  function observeDynamicContent() {
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.addedNodes && m.addedNodes.length > 0) {
          m.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              if (node.matches && (node.matches('.modal, .portal-modal, .modal-content, form') || node.querySelector('input'))) {
                init(node);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
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
    enhanceFloatingLabels,
    enhancePasswords,
    enhanceSearches,
    enhanceOtpInputs,
    enhanceSteppers,
    enhanceTagsInputs,
    enhanceDateMasks,
    enhanceRealtimeValidation,
    setValidationState,
    clearValidationState
  };
}));
