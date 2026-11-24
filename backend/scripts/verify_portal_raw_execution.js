const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.join(__dirname, '../../frontend/js/portal.js'), 'utf8');

const elementMock = {
  innerHTML: '',
  textContent: '',
  value: '',
  style: {},
  classList: {
    add: () => {},
    remove: () => {},
    contains: () => false,
    toggle: () => {},
  },
  setAttribute: () => {},
  getAttribute: () => null,
  removeAttribute: () => {},
  appendChild: () => {},
  removeChild: () => {},
  addEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
  parentElement: null,
  focus: () => {},
  blur: () => {},
  click: () => {},
  disabled: false,
};

const domMock = {
  document: {
    documentElement: { ...elementMock },
    getElementById: (id) => ({ ...elementMock, id }),
    querySelector: (sel) => ({ ...elementMock }),
    querySelectorAll: (sel) => [],
    getElementsByClassName: () => [],
    getElementsByTagName: () => [],
    addEventListener: () => {},
    createElement: (tag) => ({ ...elementMock, tagName: tag.toUpperCase() }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    title: 'Sri Vidya School Portal',
    hidden: false,
  },
  window: {
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    location: { href: 'http://localhost:5000/management', search: '', pathname: '/management', hash: '' },
    addEventListener: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: () => {},
    navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    innerWidth: 1920,
    innerHeight: 1080,
  },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  console: console,
  navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  setInterval: (fn, ms) => 1,
  clearInterval: (id) => {},
  setTimeout: (fn, ms) => 1,
  clearTimeout: (id) => {},
  fetch: () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: {} }),
    text: () => Promise.resolve(''),
  }),
  URL: {
    createObjectURL: () => 'blob:mock',
    revokeObjectURL: () => {},
  },
  Blob: function() {},
};

domMock.window.document = domMock.document;
domMock.window.window = domMock.window;

console.log('Evaluating raw frontend/js/portal.js...');
try {
  vm.runInNewContext(code, domMock);
  console.log('portal.js evaluated without throwing!');
  console.log('window.portalApp defined?', typeof domMock.window.portalApp);
  console.log('portalApp in global scope?', typeof domMock.portalApp);
  const portalApp = domMock.window.portalApp || domMock.portalApp;
  if (portalApp) {
    console.log('portalApp keys count:', Object.keys(portalApp).length);
    console.log('portalApp.init exists?', typeof portalApp.init);
    console.log('Testing portalApp.init()...');
    portalApp.init();
    console.log('portalApp.init() executed successfully without errors!');
  } else {
    console.error('portalApp is undefined!');
    process.exit(1);
  }
} catch (err) {
  console.error('FATAL EVALUATION ERROR:', err);
  process.exit(1);
}
