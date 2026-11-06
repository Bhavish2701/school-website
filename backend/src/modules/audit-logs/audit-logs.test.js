/**
 * Forensic Audit Logs Explorer - Module Test
 */

const assert = require('assert');
const Service = require('./audit-logs.service');
const Validation = require('./audit-logs.validation');

async function testModule() {
  console.log('Testing Forensic Audit Logs Explorer Module Layers...');

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

  console.log('Forensic Audit Logs Explorer Module: All unit assertions passed.');
}

if (require.main === module) {
  testModule().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = testModule;
