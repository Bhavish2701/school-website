
(function (window, document) {
  'use strict';

  if (!document || typeof document.querySelectorAll !== 'function') return;

  const LiquidToggles = {
    init: function () {
      this.enhanceAll();
      this.bindGlobalEvents();
    },

    enhanceAll: function (root) {
      const scope = root || document;
      const switches = scope.querySelectorAll(
        '.form-check.form-switch input[type="checkbox"], input[type="checkbox"].liquid-switch, [role="switch"]'
      );

      switches.forEach((el) => {
        this.enhanceElement(el);
      });
    },

    enhanceElement: function (input) {
      if (!input || input.__liquidEnhanced) return;
      input.__liquidEnhanced = true;

      if (!input.getAttribute('role')) {
        input.setAttribute('role', 'switch');
      }
      input.setAttribute('aria-checked', input.checked ? 'true' : 'false');

      input.addEventListener('change', function () {
        input.setAttribute('aria-checked', input.checked ? 'true' : 'false');

        try {
          if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate(input.checked ? 18 : 12);
          }
        } catch (e) {}

        LiquidToggles.createRipple(input);

        input.dispatchEvent(
          new CustomEvent('liquid-toggle-change', {
            bubbles: true,
            detail: { id: input.id, checked: input.checked, value: input.value }
          })
        );
      });

      input.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!input.disabled) {
            input.checked = !input.checked;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    },

    createRipple: function (input) {
      if (!input) return;
      const rect = input.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'liquid-ripple-wave';
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.pointerEvents = 'none';
      ripple.style.zIndex = '3';
      ripple.style.width = '14px';
      ripple.style.height = '14px';
      ripple.style.top = 'calc(50% - 7px)';
      ripple.style.left = input.checked ? 'calc(100% - 21px)' : '7px';
      ripple.style.background = input.checked
        ? 'rgba(255, 255, 255, 0.65)'
        : 'rgba(59, 130, 246, 0.45)';
      ripple.style.transform = 'scale(0.5)';
      ripple.style.opacity = '1';
      ripple.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';

      input.parentElement?.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(2.8)';
        ripple.style.opacity = '0';
      });

      setTimeout(() => {
        if (ripple.parentElement) {
          ripple.parentElement.removeChild(ripple);
        }
      }, 420);
    },

    bindGlobalEvents: function () {
      if (typeof MutationObserver !== 'undefined' && document.body) {
        const observer = new MutationObserver((mutations) => {
          let shouldEnhance = false;
          for (let i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length > 0) {
              shouldEnhance = true;
              break;
            }
          }
          if (shouldEnhance) {
            LiquidToggles.enhanceAll();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
    },

    set: function (id, checked, triggerEvent) {
      const el = document.getElementById(id);
      if (!el || el.type !== 'checkbox') return;
      el.checked = !!checked;
      el.setAttribute('aria-checked', el.checked ? 'true' : 'false');
      if (triggerEvent !== false) {
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      LiquidToggles.init();
    });
  } else {
    LiquidToggles.init();
  }

  window.LiquidToggles = LiquidToggles;
})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : {});
