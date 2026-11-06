/**
 * Institutions Module - Unit & Policy Test
 */

const assert = require('assert');
const InstitutionsService = require('./institutions.service');
const InstitutionsValidation = require('./institutions.validation');

async function testInstitutionsModule() {
  console.log('Testing Institutions Module Layers...');

  // 1. Validation test: missing name
  let valErr = false;
  const mockReq = { body: { code: 'SV-TEST' } };
  const mockRes = {
    status: (code) => ({
      json: (data) => {
        valErr = true;
        assert.strictEqual(code, 400);
        assert.strictEqual(data.field, 'name');
      }
    })
  };
  InstitutionsValidation.validateCreate(mockReq, mockRes, () => {});
  assert.strictEqual(valErr, true, 'Validation correctly rejects creation when name is missing');

  // 2. Service test: creation
  const created = await InstitutionsService.createInstitution({
    code: `SV-MOD-${Date.now().toString().slice(-4)}`,
    name: 'Modular Campus Architecture Test',
    domain: `mod-${Date.now()}.srividya.edu.in`
  });
  assert.strictEqual(created.success, true, 'Service successfully creates institution');

  console.log('Institutions Module Layers: All unit assertions passed.');
}

if (require.main === module) {
  testInstitutionsModule().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = testInstitutionsModule;

