/**
 * Sri Vidya E.M High School & ERP Portals
 * Mobile-Only Floating Bottom Navigation System with Hide-on-Scroll Behavior
 * - Strictly disabled and hidden on desktop / website screens (> 768px)
 * - Active exclusively on mobile phone / app view (<= 768px)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FloatingBottomNav = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let initialized = false;
  let navEl = null;
  let lastScrollY = 0;
  let ticking = false;
  const SCROLL_THRESHOLD = 8;

  function init() {
    navEl = document.getElementById('floatingBottomNav');
    if (!navEl) return;
    if (initialized) return;
    initialized = true;

    // Desktop check: do nothing if on desktop / website screen
    if (window.innerWidth > 768) {
      navEl.style.display = 'none';
      return;
    }

    lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

    // Attach passive scroll listener with requestAnimationFrame
    window.addEventListener('scroll', handleScroll, { passive: true });

    // In portal layout, also monitor portal container scroll if applicable
    const portalMain = document.querySelector('.portal-main') || document.querySelector('.portal-layout');
    if (portalMain) {
      portalMain.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Active route sync on hashchange, popstate, custom navigation event & click
    window.addEventListener('hashchange', syncActiveState);
    window.addEventListener('popstate', syncActiveState);
    window.addEventListener('sv-navigation-change', syncActiveState);
    syncActiveState();

    // Resize handler: toggle between mobile app view and desktop view
    window.addEventListener('resize', throttle(() => {
      if (window.innerWidth > 768) {
        if (navEl) navEl.style.display = 'none';
      } else {
        if (navEl) navEl.style.display = '';
        updateNavState();
      }
    }, 200));

    // Check initial scroll state
    updateNavState();
  }

  function handleScroll() {
    if (window.innerWidth > 768) return;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateNavState();
        ticking = false;
      });
      ticking = true;
    }
  }

  function updateNavState() {
    if (!navEl) return;
    if (window.innerWidth > 768) {
      navEl.style.display = 'none';
      return;
    }

    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const delta = currentScrollY - lastScrollY;

    // Always visible when near top (< 50px)
    if (currentScrollY <= 50) {
      navEl.classList.remove('nav-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    // Deadband check to ignore micro-scrolls
    if (Math.abs(delta) < SCROLL_THRESHOLD) {
      return;
    }

    if (delta > 0 && currentScrollY > 80) {
      // User scrolling DOWN -> smoothly hide navigation bar
      navEl.classList.add('nav-hidden');
    } else if (delta < 0) {
      // User scrolling UP -> smoothly show navigation bar
      navEl.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
  }

  function syncActiveState() {
    if (!navEl) return;
    if (window.innerWidth > 768) return;

    const hash = (window.location.hash || '').replace('#', '').toLowerCase();
    
    // Check state in global apps if available
    let activeKey = '';
    try {
      if (window.portalApp && window.portalApp.state && window.portalApp.state.activeModule) {
        activeKey = window.portalApp.state.activeModule.toLowerCase();
      } else if (window.teacherApp && window.teacherApp.state && window.teacherApp.state.activeModule) {
        activeKey = window.teacherApp.state.activeModule.toLowerCase();
      } else if (window.platformApp && window.platformApp.state && window.platformApp.state.activeView) {
        activeKey = window.platformApp.state.activeView.toLowerCase();
      }
    } catch (e) {}

    const items = navEl.querySelectorAll('.bottom-nav-item[data-nav]');

    items.forEach(item => {
      const navTarget = item.getAttribute('data-nav').toLowerCase();
      if (activeKey && activeKey === navTarget) {
        item.classList.add('active');
      } else if (hash && (hash === navTarget || hash.startsWith(navTarget + '-'))) {
        item.classList.add('active');
      } else if (!hash && !activeKey && (navTarget === 'home' || navTarget === 'dashboard')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  function openPortalSidebar(portalType) {
    if (portalType === 'administration' || portalType === 'management') {
      const sb = document.getElementById('portalSidebar');
      const bd = document.getElementById('portalBackdrop');
      if (sb) sb.classList.toggle('mobile-open');
      if (bd) bd.classList.toggle('active');
      document.body.classList.toggle('sidebar-open');
    } else if (portalType === 'teacher' || portalType === 'faculty') {
      if (typeof window.openTeacherMobileSidebar === 'function') {
        window.openTeacherMobileSidebar();
      } else {
        const sb = document.getElementById('portalSidebar');
        const bd = document.getElementById('portalBackdrop');
        if (sb) sb.classList.toggle('mobile-open');
        if (bd) bd.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
      }
    } else if (portalType === 'platform-admin') {
      if (window.platformApp && typeof window.platformApp.toggleMobileSidebar === 'function') {
        window.platformApp.toggleMobileSidebar();
      } else {
        const sb = document.getElementById('sidebar');
        if (sb) sb.classList.toggle('mobile-open');
      }
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Auto-init on DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init());
    } else {
      init();
    }
  }

  return {
    init,
    updateNavState,
    syncActiveState,
    openPortalSidebar,
    scrollToTop
  };
}));
