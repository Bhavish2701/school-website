
const assert = require('assert');
const Service = require('./integrations.service');
const Validation = require('./integrations.validation');

async function testModule() {
  console.log('Testing External Integrations Directory Module Layers...');

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

  const res = await Service.getOverview({ user: { scope: 'PLATFORM_WIDE' } });
  assert.strictEqual(res.success, true, 'Service getOverview executes successfully');

  console.log('External Integrations Directory Module: All unit assertions passed.');
}

if (require.main === module) {
  testModule().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = testModule;
