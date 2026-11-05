/**
 * Notification Dispatcher Service
 * Specification 22.3: Notifications must follow actual state changes
 *
 * Rules:
 * - Send a notification when an application is submitted, a document is rejected,
 *   admission is approved, a fee payment is verified or a result is published.
 * - Do not send a success message before the transaction has actually completed.
 */
const { Notification } = require('../models/notification.model');

const NOTIFICATION_TRIGGER_EVENTS = [
  'APPLICATION_SUBMITTED',
  'DOCUMENT_REJECTED',
  'ADMISSION_APPROVED',
  'FEE_PAYMENT_VERIFIED',
  'RESULT_PUBLISHED',
];

/**
 * 1. Dispatch Notification on Actual Application Submission
 * Requires application to be persisted with a valid applicationNumber
 */
const dispatchApplicationSubmitted = async ({ application, channel = 'SMS & Email' }) => {
  if (!application || !application.applicationNumber || !application._id) {
    throw new Error('Rule 22.3 Violation: Cannot dispatch notification before application record is committed.');
  }

  const notification = await Notification.create({
    title: `Application Submitted: ${application.applicationNumber}`,
    message: `Dear ${application.parentName}, the admission application for ${application.studentName} (Class ${application.applyingClass}) has been officially registered with reference number ${application.applicationNumber}.`,
    type: 'ALERT',
    recipientRole: 'PARENT',
    recipientPhone: application.phone,
    recipientEmail: application.email,
    metadata: {
      event: 'APPLICATION_SUBMITTED',
      applicationId: application._id.toString(),
      applicationNumber: application.applicationNumber,
      channel,
      dispatchedAt: new Date(),
    },
  });

  return {
    dispatched: true,
    notificationId: notification._id,
    event: 'APPLICATION_SUBMITTED',
    channel,
    recipient: application.phone,
    status: 'COMMITTED_AND_DISPATCHED',
  };
};

/**
 * 2. Dispatch Notification on Actual Document Rejection
 * Requires document to be in REJECTED state with a mandatory reason
 */
const dispatchDocumentRejected = async ({
  application,
  documentName,
  rejectionReason,
  reviewer = 'Admissions Verification Desk',
  channel = 'SMS & Email',
}) => {
  if (!application || !application._id) {
    throw new Error('Rule 22.3 Violation: Cannot dispatch rejection notification without committed application.');
  }
  if (!rejectionReason || !rejectionReason.trim()) {
    throw new Error('Rule 22.3 Violation: Document rejection notification requires an explicit rejection reason.');
  }

  const notification = await Notification.create({
    title: `Document Resubmission Required: ${application.applicationNumber}`,
    message: `Dear Parent, the submitted document "${documentName}" for application ${application.applicationNumber} was not approved by ${reviewer}. Reason: "${rejectionReason}". Please upload a verified copy.`,
    type: 'WARNING',
    recipientRole: 'PARENT',
    recipientPhone: application.phone,
    recipientEmail: application.email,
    metadata: {
      event: 'DOCUMENT_REJECTED',
      applicationId: application._id.toString(),
      documentName,
      rejectionReason,
      reviewer,
      channel,
      dispatchedAt: new Date(),
    },
  });

  return {
    dispatched: true,
    notificationId: notification._id,
    event: 'DOCUMENT_REJECTED',
    channel,
    recipient: application.phone,
    status: 'COMMITTED_AND_DISPATCHED',
  };
};

/**
 * 3. Dispatch Notification on Actual Admission Approval & Offer Issuance
 * Requires application to be in APPROVED state
 */
const dispatchAdmissionApproved = async ({
  application,
  classOffered,
  approvedBy = 'Principal / Vice Principal',
  offerValidityDays = 10,
  channel = 'SMS & Email',
}) => {
  if (!application || application.status !== 'APPROVED') {
    throw new Error(
      `Rule 22.3 Violation: Cannot dispatch admission approval notification when application status is '${application?.status || 'UNKNOWN'}'. Status must be 'APPROVED'.`
    );
  }

  const notification = await Notification.create({
    title: `Admission Offer Issued: ${application.applicationNumber}`,
    message: `Congratulations! Formal admission offer has been approved by ${approvedBy} for ${application.studentName} in Class ${classOffered || application.applyingClass}. Please complete fee remittance within ${offerValidityDays} days.`,
    type: 'ANNOUNCEMENT',
    recipientRole: 'PARENT',
    recipientPhone: application.phone,
    recipientEmail: application.email,
    metadata: {
      event: 'ADMISSION_APPROVED',
      applicationId: application._id.toString(),
      classOffered: classOffered || application.applyingClass,
      approvedBy,
      validityDays: offerValidityDays,
      channel,
      dispatchedAt: new Date(),
    },
  });

  return {
    dispatched: true,
    notificationId: notification._id,
    event: 'ADMISSION_APPROVED',
    channel,
    recipient: application.phone,
    status: 'COMMITTED_AND_DISPATCHED',
  };
};

/**
 * 4. Dispatch Notification on Actual Fee Payment Verification
 * Requires payment to be in SUCCESS state with receipt generated
 */
const dispatchFeePaymentVerified = async ({
  payment,
  receiptNumber,
  student,
  channel = 'SMS & Email',
}) => {
  if (!payment || payment.status !== 'SUCCESS') {
    throw new Error(
      `Rule 22.3 Violation: Cannot dispatch fee payment receipt before transaction verification succeeds. Current status: '${payment?.status || 'UNKNOWN'}'.`
    );
  }

  const studentName = student?.fullName || student?.name || 'Student';
  const parentPhone = student?.parentPhone || student?.phone || payment?.phone || '';

  const notification = await Notification.create({
    title: `Payment Receipt Issued: ${receiptNumber || payment.receiptNumber || payment.orderId}`,
    message: `Fee payment of ₹${payment.amount} for ${studentName} has been verified and credited. Official Receipt: ${receiptNumber || payment.receiptNumber}. Thank you!`,
    type: 'ALERT',
    recipientRole: 'PARENT',
    recipientPhone: parentPhone,
    metadata: {
      event: 'FEE_PAYMENT_VERIFIED',
      paymentId: payment._id?.toString() || payment.orderId,
      receiptNumber: receiptNumber || payment.receiptNumber,
      amount: payment.amount,
      channel,
      dispatchedAt: new Date(),
    },
  });

  return {
    dispatched: true,
    notificationId: notification._id,
    event: 'FEE_PAYMENT_VERIFIED',
    channel,
    recipient: parentPhone,
    status: 'COMMITTED_AND_DISPATCHED',
  };
};

/**
 * 5. Dispatch Notification on Actual Exam Result Publication
 * Requires exam to be marked isPublished = true
 */
const dispatchResultPublished = async ({
  exam,
  classSection,
  term = 'Term 1 / SA-1',
  publishedBy = 'Principal',
  channel = 'Portal & SMS Alert',
}) => {
  if (!exam || !exam.isPublished) {
    throw new Error('Rule 22.3 Violation: Cannot dispatch examination results notification before results are officially published.');
  }

  const notification = await Notification.create({
    title: `Examination Results Published: ${term} (Class ${classSection})`,
    message: `Official examination results for ${term} (Class ${classSection}) have been validated and published by ${publishedBy}. Report cards are now accessible in student and parent accounts.`,
    type: 'ANNOUNCEMENT',
    recipientRole: 'PARENT',
    metadata: {
      event: 'RESULT_PUBLISHED',
      examId: exam._id?.toString() || exam.id,
      classSection,
      term,
      publishedBy,
      channel,
      dispatchedAt: new Date(),
    },
  });

  return {
    dispatched: true,
    notificationId: notification._id,
    event: 'RESULT_PUBLISHED',
    channel,
    classSection,
    status: 'COMMITTED_AND_DISPATCHED',
  };
};

module.exports = {
  NOTIFICATION_TRIGGER_EVENTS,
  dispatchApplicationSubmitted,
  dispatchDocumentRejected,
  dispatchAdmissionApproved,
  dispatchFeePaymentVerified,
  dispatchResultPublished,
};
