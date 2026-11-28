const fs = require('fs');
const path = require('path');
const vm = require('vm');

let code = fs.readFileSync(path.join(__dirname, '../../frontend/js/portal.js'), 'utf8');

const returnMatch = code.match(/return\s*\{([\s\S]*?)\n\s*\};/);
if (returnMatch) {
  const returnBody = returnMatch[1];
  const lines = returnBody.split('\n');
  const exportedIdentifiers = [];
  lines.forEach(line => {
    const trimmed = line.trim().replace(/,$/, '');
    if (trimmed && !trimmed.startsWith('//')) {
      const parts = trimmed.split(':');
      const identifier = parts[0].trim();
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(identifier)) {
        exportedIdentifiers.push(identifier);
      }
    }
  });

  console.log(`Found ${exportedIdentifiers.length} exported identifiers.`);

  const checks = exportedIdentifiers.map(id => `
    try {
      if (typeof ${id} === 'undefined') {
        missingExports.push('${id}');
      }
    } catch(e) {
      missingExports.push('${id}');
    }
  `).join('\n');

  const modifiedCode = code.replace(/return\s*\{/, `
    const missingExports = [];
    ${checks}
    if (missingExports.length > 0) {
      console.log('MISSING EXPORTS FOUND:', missingExports);
    } else {
      console.log('ALL EXPORTED IDENTIFIERS ARE DEFINED!');
    }
    return {
  `);

  const domMock = {
    document: {
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
      head: { appendChild: () => {} },
      body: { appendChild: () => {} },
      hidden: false,
    },
    window: {
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      location: { href: '', search: '', pathname: '/management' },
      addEventListener: () => {},
      setInterval: () => 1,
      clearInterval: () => {},
      setTimeout: () => 1,
      clearTimeout: () => {},
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    console: console,
    navigator: { userAgent: 'Node' },
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
  };
  domMock.window.document = domMock.document;
  domMock.window.window = domMock.window;

  try {
    vm.runInNewContext(modifiedCode, domMock);
  } catch (err) {
    console.error('VM error:', err.message);
  }
}
