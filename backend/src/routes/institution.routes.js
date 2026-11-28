const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institution.controller');

router.get('/', institutionController.listInstitutions);
router.post('/', institutionController.createInstitution);

router.get('/:id', institutionController.getInstitution);
router.put('/:id', institutionController.updateInstitution);
router.post('/:id/suspend', institutionController.suspendInstitution);
router.post('/:id/reactivate', institutionController.reactivateInstitution);
router.post('/:id/archive', institutionController.archiveInstitution);
router.post('/:id/verify-domain', institutionController.verifyDomain);
router.post('/:id/invite-admin', institutionController.inviteAdministrator);

module.exports = router;

