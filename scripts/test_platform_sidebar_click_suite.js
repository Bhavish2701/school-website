const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('=== TEST SUITE: PLATFORM ADMINISTRATION SIDEBAR BUTTONS & NAVIGATION ===\n');

// 1. Verify HTML Sidebar Navigation Links & Target Sections
console.log('[CHECK 1] Verifying all 16 sidebar navigation links and target sections in HTML...');
const html = fs.readFileSync('frontend/platform-admin/index.html', 'utf8');

const expectedViews = [
  'dashboard',
  'institutions',
  'config',
  'onboarding',
  'users',
  'roles',
  'audit',
  'security-monitoring',
  'subscription',
  'health',
  'backups',
  'integrations',
  'support',
  'domains-email',
  'settings',
  'policies'
];

expectedViews.forEach(viewId => {
  // Check matching nav link
  const linkRegex = new RegExp(`href="#${viewId}"[^>]*data-view="${viewId}"[^>]*onclick="platformApp\\.navigateTo\\('${viewId}'\\)"`);
  const altLinkRegex = new RegExp(`data-view="${viewId}"[^>]*href="#${viewId}"[^>]*onclick="platformApp\\.navigateTo\\('${viewId}'\\)"`);
  assert(linkRegex.test(html) || altLinkRegex.test(html), `Sidebar link for view '${viewId}' must have href, data-view, and onclick`);

  // Check matching view container
  assert(html.includes(`id="view-${viewId}"`), `View section #view-${viewId} must exist in HTML`);
});
console.log(`  ✓ All ${expectedViews.length} sidebar navigation links and matching view sections verified in HTML.`);

// 2. Verify Execution of frontend/js/platform-admin.js in Mock DOM Environment
console.log('\n[CHECK 2] Verifying platform-admin.js execution and window.platformApp definition...');
const js = fs.readFileSync('frontend/js/platform-admin.js', 'utf8');

// Build mock DOM elements
const idMatches = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
const elementStore = {};

function createMockElement(id = '', tag = 'div', classes = []) {
  const classListSet = new Set(classes);
  const listeners = {};
  return {
    id: id,
    tagName: tag.toUpperCase(),
    value: '',
    textContent: '',
    innerHTML: '',
    style: {},
    classList: {
      add: (c) => classListSet.add(c),
      remove: (c) => classListSet.delete(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (classListSet.has(c)) classListSet.delete(c);
          else classListSet.add(c);
        } else if (force) {
          classListSet.add(c);
        } else {
          classListSet.delete(c);
        }
      },
      contains: (c) => classListSet.has(c)
    },
    getAttribute: (attr) => null,
    setAttribute: (attr, val) => {},
    addEventListener: (evt, fn) => {
      if (!listeners[evt]) listeners[evt] = [];
      listeners[evt].push(fn);
    },
    removeEventListener: () => {},
    dispatchEvent: (evt) => {
      if (listeners[evt.type]) {
        listeners[evt.type].forEach(fn => fn(evt));
      }
    },
    querySelectorAll: () => [],
    querySelector: () => null,
    closest: function(sel) {
      if (sel.includes('nav-link')) return this;
      return null;
    }
  };
}

idMatches.forEach(id => {
  elementStore[id] = createMockElement(id, 'section', ['portal-view']);
});

const mockLinks = expectedViews.map(v => {
  const el = createMockElement('', 'a', ['nav-link']);
  el.getAttribute = (attr) => attr === 'data-view' ? v : null;
  return el;
});

const mockSidebarNav = createMockElement('sidebarNav', 'nav', ['sidebar-nav']);

const mockDocument = {
  readyState: 'complete',
  documentElement: createMockElement('html'),
  getElementById: (id) => {
    if (!elementStore[id]) {
      elementStore[id] = createMockElement(id);
    }
    return elementStore[id];
  },
  querySelector: (sel) => {
    if (sel === '.sidebar-nav') return mockSidebarNav;
    return createMockElement();
  },
  querySelectorAll: (sel) => {
    if (sel === '.portal-view') {
      return expectedViews.map(v => elementStore[`view-${v}`]);
    }
    if (sel.includes('nav-link')) {
      return mockLinks;
    }
    return [];
  },
  addEventListener: () => {}
};

const mockWindow = {
  document: mockDocument,
  location: { hash: '' },
  localStorage: {
    getItem: () => 'light',
    setItem: () => {}
  },
  history: {
    pushState: (s, t, url) => { mockWindow.location.hash = url; }
  },
  scrollTo: () => {},
  setInterval: () => {},
  setTimeout: (fn) => fn(),
  addEventListener: () => {},
  fetch: async () => ({ ok: false })
};
mockWindow.window = mockWindow;

const context = vm.createContext(mockWindow);

// Execute platform-admin.js
try {
  vm.runInContext(js, context);
} catch (err) {
  console.error('RUNTIME EVALUATION FAILED:', err);
  process.exit(1);
}

assert(context.window.platformApp, 'window.platformApp must be defined on window');
assert(typeof context.window.platformApp.navigateTo === 'function', 'platformApp.navigateTo must be a callable function');
console.log('  ✓ platform-admin.js executed with ZERO errors and window.platformApp is accessible');

// 3. Verify navigateTo switching for all 16 views
console.log('\n[CHECK 3] Verifying navigation switching across all 16 views...');
expectedViews.forEach(v => {
  context.window.platformApp.navigateTo(v);

  // Check active view element
  const viewEl = elementStore[`view-${v}`];
  assert(viewEl.classList.contains('active'), `View section #view-${v} must have .active class`);

  // Check active link
  const linkEl = mockLinks.find(l => l.getAttribute('data-view') === v);
  assert(linkEl.classList.contains('active'), `Nav link for '${v}' must have .active class`);
});
console.log('  ✓ navigateTo successfully activated every view and updated active sidebar indicators');

// 4. Verify Delegated Sidebar Click Event Handling
console.log('\n[CHECK 4] Verifying delegated click event listener on .sidebar-nav...');
assert(mockSidebarNav.dispatchEvent, 'Sidebar nav element must support click events');

let delegatedNavTested = false;
const fakeEvent = {
  type: 'click',
  preventDefault: () => {},
  target: {
    closest: (sel) => {
      delegatedNavTested = true;
      return {
        getAttribute: (attr) => attr === 'data-view' ? 'institutions' : null
      };
    }
  }
};

mockSidebarNav.dispatchEvent(fakeEvent);
assert(delegatedNavTested, 'Delegated click event must process the target link');
const instView = elementStore['view-institutions'];
assert(instView.classList.contains('active'), 'Clicking sidebar button must navigate to view-institutions');
console.log('  ✓ Delegated click on sidebar successfully triggers navigation to target view');

console.log('\n========================================================');
console.log('ALL PLATFORM SIDEBAR NAVIGATION TESTS PASSED (100%)!');
console.log('========================================================');

