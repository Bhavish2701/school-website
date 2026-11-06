/**
 * Global Platform Settings - Module Test
 */

const assert = require('assert');
const Service = require('./global-settings.service');
const Validation = require('./global-settings.validation');

async function testModule() {
  console.log('Testing Global Platform Settings Module Layers...');

  // 1. Validation test
  let valFailed = false;
  const mockReq = { method: 'POST', body: {} };
  const mockRes = {
    status: (code) => ({
      json: (data) => {
        valFailed = true;
        assert.strictEqual(code, 400);
      }
    })
  };
  Validation.validateRequest(mockReq, mockRes, () => {});
  assert.strictEqual(valFailed, true, 'Validation correctly rejects empty payload');

  // 2. Service test
  const res = await Service.getOverview({ user: { scope: 'PLATFORM_WIDE' } });
  assert.strictEqual(res.success, true, 'Service getOverview executes successfully');

  console.log('Global Platform Settings Module: All unit assertions passed.');
}

if (require.main === module) {
  testModule().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = testModule;
