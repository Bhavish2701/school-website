/**
 * Parent Module Routes
 *
 * Architecture:
 * Route → Middleware → Controller → Service → Model
 * Enforces secure parent-child authorization so that a parent
 * can never access another parent's child.
 *
 * Specification 20.2:
 * "Pages:
 *  Dashboard, My Children, Child Profile, Attendance, Academic Progress,
 *  Published Results, Assignments, Fees & Payments, Receipts, Leave Requests,
 *  Appointments, Teacher Communication, School Notices, Events, Documents,
 *  Help & Support.
 *  A parent should be able to switch between authorized children.
 *  Parents should not be able to change verified attendance, examination marks,
 *  fee balances or official school records directly. They can submit requests for
 *  corrections that authorized staff review."
 */
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

// All parent routes require authentication and role authorization
router.use(authenticateUser);
router.use(authorizeRoles('PARENT', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'));

// 1. Parent Profile Routes
router
  .route('/profile')
  .get(parentController.getProfile)
  .patch(validateUpdateProfile, parentController.updateProfile);

// 2. Multiple Children (Child Switcher) Route
router.get('/children', parentController.getChildren);

// 3. Child Profile
router.get(
  '/children/:childId/profile',
  verifyParentChildAccess('childId'),
  parentController.getChildProfile
);

// 4. Secure Child-Specific Routes (Protected by verifyParentChildAccess)
router.get(
  '/children/:childId/overview',
  verifyParentChildAccess('childId'),
  parentController.getChildOverview
);

// 5. Attendance (Read-only verified records)
router.get(
  '/children/:childId/attendance',
  verifyParentChildAccess('childId'),
  parentController.getChildAttendance
);

// 6. Academic Progress
router.get(
  '/children/:childId/academic-progress',
  verifyParentChildAccess('childId'),
  parentController.getChildAcademicProgress
);

// 7. Assignments & Homework
router.get(
  '/children/:childId/assignments',
  verifyParentChildAccess('childId'),
  parentController.getChildAssignments
);

// 8. Published Results (Strictly Published Only)
router.get(
  '/children/:childId/results',
  verifyParentChildAccess('childId'),
  parentController.getChildExamsAndResults
);

// 9. Fees & Payments
router.get(
  '/children/:childId/fees',
  verifyParentChildAccess('childId'),
  parentController.getChildFees
);

// 10. Official Payment Receipts
router.get(
  '/children/:childId/receipts',
  verifyParentChildAccess('childId'),
  parentController.getChildReceipts
);

// 11. Leave Requests
router
  .route('/children/:childId/leaves')
  .get(verifyParentChildAccess('childId'), parentController.getChildLeaves)
  .post(verifyParentChildAccess('childId'), validateChildLeave, parentController.applyChildLeave);

// 12. School Notices & Circulars
router.get(
  '/children/:childId/notices',
  verifyParentChildAccess('childId'),
  parentController.getChildNotices
);

// 13. Official Child Documents
router.get(
  '/children/:childId/documents',
  verifyParentChildAccess('childId'),
  parentController.getChildDocuments
);

// 14. Correction Requests (Specification 20.2: Parents submit correction requests for staff review)
router
  .route('/children/:childId/correction-requests')
  .get(verifyParentChildAccess('childId'), parentController.getCorrectionRequests)
  .post(verifyParentChildAccess('childId'), parentController.submitCorrectionRequest);

// 15. Guard Against Unauthorized Direct Modifications
// Direct mutations on attendance, marks, fees, or official records are forbidden
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

// 16. Appointments
router
  .route('/appointments')
  .get(parentController.getAppointments)
  .post(parentController.bookAppointment);

// 17. School Events & PTM Schedule
router.get('/events', parentController.getEvents);

// 18. Communication & Messages
router
  .route('/messages')
  .get(parentController.getMessages)
  .post(validateParentMessage, parentController.sendMessage);

// 19. Notifications
router.get('/notifications', parentController.getNotifications);

// 20. Help & Support
router
  .route('/help-support')
  .get(parentController.getHelpSupport)
  .post(parentController.submitHelpSupportTicket);

module.exports = router;
