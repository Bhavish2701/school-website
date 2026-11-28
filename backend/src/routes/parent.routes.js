const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parent.controller');
const {
  authenticateUser,
  authorizeRoles,
} = require('../middleware/rbac.middleware');
const { verifyParentChildAccess } = require('../middleware/parentChild.middleware');
const {
  validateUpdateProfile,
  validateChildLeave,
  validateParentMessage,
} = require('../validators/parent.validator');
const ApiError = require('../utils/apiError');

router.use(authenticateUser);
router.use(authorizeRoles('PARENT', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'));

router
  .route('/profile')
  .get(parentController.getProfile)
  .patch(validateUpdateProfile, parentController.updateProfile);

router.get('/children', parentController.getChildren);

router.get(
  '/children/:childId/profile',
  verifyParentChildAccess('childId'),
  parentController.getChildProfile
);

router.get(
  '/children/:childId/overview',
  verifyParentChildAccess('childId'),
  parentController.getChildOverview
);

router.get(
  '/children/:childId/attendance',
  verifyParentChildAccess('childId'),
  parentController.getChildAttendance
);

router.get(
  '/children/:childId/academic-progress',
  verifyParentChildAccess('childId'),
  parentController.getChildAcademicProgress
);

router.get(
  '/children/:childId/assignments',
  verifyParentChildAccess('childId'),
  parentController.getChildAssignments
);

router.get(
  '/children/:childId/results',
  verifyParentChildAccess('childId'),
  parentController.getChildExamsAndResults
);

router.get(
  '/children/:childId/fees',
  verifyParentChildAccess('childId'),
  parentController.getChildFees
);

router.get(
  '/children/:childId/receipts',
  verifyParentChildAccess('childId'),
  parentController.getChildReceipts
);

router
  .route('/children/:childId/leaves')
  .get(verifyParentChildAccess('childId'), parentController.getChildLeaves)
  .post(verifyParentChildAccess('childId'), validateChildLeave, parentController.applyChildLeave);

router.get(
  '/children/:childId/notices',
  verifyParentChildAccess('childId'),
  parentController.getChildNotices
);

router.get(
  '/children/:childId/documents',
  verifyParentChildAccess('childId'),
  parentController.getChildDocuments
);

router
  .route('/children/:childId/correction-requests')
  .get(verifyParentChildAccess('childId'), parentController.getCorrectionRequests)
  .post(verifyParentChildAccess('childId'), parentController.submitCorrectionRequest);

router.all(
  [
    '/children/:childId/attendance',
    '/children/:childId/results',
    '/children/:childId/fees',
    '/children/:childId/records',
  ],
  (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      throw ApiError.forbidden(
        'Direct modification to verified school records (attendance, marks, fees) is prohibited. Please submit a formal Correction Request for administrative review.'
      );
    }
    next();
  }
);

router
  .route('/appointments')
  .get(parentController.getAppointments)
  .post(parentController.bookAppointment);

router.get('/events', parentController.getEvents);

router
  .route('/messages')
  .get(parentController.getMessages)
  .post(validateParentMessage, parentController.sendMessage);

router.get('/notifications', parentController.getNotifications);

router
  .route('/help-support')
  .get(parentController.getHelpSupport)
  .post(parentController.submitHelpSupportTicket);

module.exports = router;
