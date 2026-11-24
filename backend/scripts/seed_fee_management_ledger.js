/**
 * Seed Fee Management Ledger
 * Seeds authentic fee structures, student fee ledgers, payment receipts,
 * and SMS reminder logs for Sri Vidya English Medium High School.
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/srividya_school_db';

async function seedFeeLedger() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const { Student } = require('../src/models/student.model');
  const Fee = require('../src/models/fee.model');
  const FeeStructure = require('../src/models/feeStructure.model');
  const { Payment } = require('../src/models/payment.model');
  const Receipt = require('../src/models/receipt.model');
  const SmsLog = require('../src/models/smsLog.model');
  const { User } = require('../src/models/user.model');

  // Find admin or principal user for references
  let adminUser = await User.findOne({ role: { $in: ['SUPER_ADMIN', 'PRINCIPAL'] } });
  if (!adminUser) {
    adminUser = await User.findOne({});
  }
  const adminId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

  console.log('\n--- 1. Seeding Academic Year 2025-2026 Fee Structures ---');
  await FeeStructure.deleteMany({ academicYear: '2025-2026' });

  const structuresData = [
    {
      name: 'Class 10 SSC Annual Fee Structure',
      class: '10',
      academicYear: '2025-2026',
      term: 'Annual',
      tuitionFee: 24000,
      transportFee: 0,
      labFee: 3000,
      computerFee: 2000,
      libraryFee: 1500,
      examinationFee: 1500,
      extracurricularFee: 0,
      admissionFee: 0,
      totalAmount: 32000,
      dueDate: new Date('2026-10-22T00:00:00.000Z'),
      description: 'AP State Board Class X Comprehensive Academic Assessment & Lab Fee',
      createdBy: adminId,
    },
    {
      name: 'Class 9 High School Annual Fee Structure',
      class: '9',
      academicYear: '2025-2026',
      term: 'Annual',
      tuitionFee: 21000,
      transportFee: 0,
      labFee: 2500,
      computerFee: 2000,
      libraryFee: 1500,
      examinationFee: 1000,
      extracurricularFee: 0,
      admissionFee: 0,
      totalAmount: 28000,
      dueDate: new Date('2026-10-26T00:00:00.000Z'),
      description: 'Class IX Secondary Standard Fee Structure',
      createdBy: adminId,
    },
    {
      name: 'Class 8 Upper Primary Fee Structure',
      class: '8',
      academicYear: '2025-2026',
      term: 'Annual',
      tuitionFee: 20000,
      transportFee: 0,
      labFee: 2000,
      computerFee: 2000,
      libraryFee: 1000,
      examinationFee: 1000,
      extracurricularFee: 0,
      admissionFee: 0,
      totalAmount: 26000,
      dueDate: new Date('2026-10-20T00:00:00.000Z'),
      description: 'Class VIII Standard Fee Structure',
      createdBy: adminId,
    },
    {
      name: 'Class 7 Upper Primary Fee Structure',
      class: '7',
      academicYear: '2025-2026',
      term: 'Annual',
      tuitionFee: 18000,
      transportFee: 0,
      labFee: 2000,
      computerFee: 2000,
      libraryFee: 1000,
      examinationFee: 1000,
      extracurricularFee: 0,
      admissionFee: 0,
      totalAmount: 24000,
      dueDate: new Date('2026-10-18T00:00:00.000Z'),
      description: 'Class VII Standard Fee Structure',
      createdBy: adminId,
    },
    {
      name: 'Class 6 Primary / Middle Fee Structure',
      class: '6',
      academicYear: '2025-2026',
      term: 'Annual',
      tuitionFee: 17000,
      transportFee: 0,
      labFee: 1500,
      computerFee: 1500,
      libraryFee: 1000,
      examinationFee: 1000,
      extracurricularFee: 0,
      admissionFee: 0,
      totalAmount: 22000,
      dueDate: new Date('2026-10-20T00:00:00.000Z'),
      description: 'Class VI Standard Fee Structure',
      createdBy: adminId,
    },
  ];

  const createdStructures = await FeeStructure.insertMany(structuresData);
  console.log(`✓ Seeded ${createdStructures.length} fee structures`);

  // Map structures by class
  const structMap = {};
  createdStructures.forEach((s) => {
    structMap[s.class] = s;
  });

  console.log('\n--- 2. Seeding Student Fee Ledgers & Accounts ---');
  // Clean existing fees to rebuild consistent traceable ledger
  await Fee.deleteMany({});
  await Payment.deleteMany({});
  await Receipt.deleteMany({});
  await SmsLog.deleteMany({ category: 'FEE_REMINDER' });

  const allStudents = await Student.find({}).lean();
  console.log(`Found ${allStudents.length} students in DB`);

  const studentFeeLedgerDefs = [
    // 1. A. Rahul (Class 10-A, SV-0001) - Cleared
    {
      admNo: 'SV-0001',
      totalAmount: 32000,
      concessionAmount: 0,
      paidAmount: 32000,
      dueAmount: 0,
      dueDate: new Date('2026-10-22T00:00:00.000Z'),
      status: 'Paid',
      receipts: [
        { receiptNumber: 'RCP-2026-1011', amount: 16000, date: new Date('2026-06-15T11:00:00.000Z'), mode: 'Netbanking', desc: 'Term 1 Tuition & Annual Charges' },
        { receiptNumber: 'RCP-2026-2045', amount: 16000, date: new Date('2026-10-10T14:30:00.000Z'), mode: 'UPI', desc: 'Term 2 Final Settlement' },
      ],
    },
    // 2. B. Priya (Class 8-C, SV-0002) - Cleared
    {
      admNo: 'SV-0002',
      totalAmount: 26000,
      concessionAmount: 0,
      paidAmount: 26000,
      dueAmount: 0,
      dueDate: new Date('2026-10-20T00:00:00.000Z'),
      status: 'Paid',
      receipts: [
        { receiptNumber: 'RCP-2026-1012', amount: 13000, date: new Date('2026-06-18T10:15:00.000Z'), mode: 'UPI', desc: 'Term 1 Academic Fee' },
        { receiptNumber: 'RCP-2026-2046', amount: 13000, date: new Date('2026-10-12T15:20:00.000Z'), mode: 'UPI', desc: 'Term 2 Academic Fee' },
      ],
    },
    // 3. K. Sai Teja (Class 10-A, SV-0003) - DEFAULTER (₹12,500 due, 18 days overdue)
    {
      admNo: 'SV-0003',
      totalAmount: 32000,
      concessionAmount: 0,
      paidAmount: 19500,
      dueAmount: 12500,
      dueDate: new Date('2026-10-22T00:00:00.000Z'), // 18 days overdue as of Nov 9, 2026
      status: 'Partial',
      receipts: [
        { receiptNumber: 'RCP-2026-1013', amount: 16000, date: new Date('2026-06-16T12:00:00.000Z'), mode: 'Cash', desc: 'Term 1 Complete Fee' },
        { receiptNumber: 'RCP-2026-3001', amount: 3500, date: new Date('2026-10-10T16:00:00.000Z'), mode: 'UPI', desc: 'Term 2 Partial Advance' },
      ],
      smsReminders: [
        {
          date: new Date('2026-10-18T10:30:00.000Z'),
          recipientName: 'Sri K. Appala Naidu',
          phone: '9848112233',
          message: 'Sri Vidya High School Alert: Fee installment of ₹12,500 is due on 22 Oct 2026 for K. Sai Teja (SV-0003). Please clear to avoid late penalty.',
          gateway: 'AP-EDUSMS (Airtel DLT)',
          status: 'DELIVERED',
        },
      ],
    },
    // 4. M. Divya Bharathi (Class 10-A, SV-0004) - Cleared
    {
      admNo: 'SV-0004',
      totalAmount: 32000,
      concessionAmount: 0,
      paidAmount: 32000,
      dueAmount: 0,
      dueDate: new Date('2026-10-22T00:00:00.000Z'),
      status: 'Paid',
      receipts: [
        { receiptNumber: 'RCP-2026-1014', amount: 16000, date: new Date('2026-06-20T11:45:00.000Z'), mode: 'Card', desc: 'Term 1 Academic Fee' },
        { receiptNumber: 'RCP-2026-2048', amount: 16000, date: new Date('2026-10-14T10:00:00.000Z'), mode: 'Card', desc: 'Term 2 Academic Fee' },
      ],
    },
    // 5. G. Karthik (Class 9-B, SV-0005) - DEFAULTER (₹10,000 due, 14 days overdue)
    {
      admNo: 'SV-0005',
      totalAmount: 28000,
      concessionAmount: 3000, // Merit concession
      paidAmount: 15000,
      dueAmount: 10000,
      dueDate: new Date('2026-10-26T00:00:00.000Z'), // 14 days overdue as of Nov 9, 2026
      status: 'Pending',
      receipts: [
        { receiptNumber: 'RCP-2026-1015', amount: 13000, date: new Date('2026-06-22T14:10:00.000Z'), mode: 'UPI', desc: 'Term 1 Settlement' },
        { receiptNumber: 'RCP-2026-3002', amount: 2000, date: new Date('2026-10-12T11:30:00.000Z'), mode: 'Cash', desc: 'Term 2 Part Payment' },
      ],
      smsReminders: [
        {
          date: new Date('2026-10-20T11:15:00.000Z'),
          recipientName: 'Sri G. Mohan Rao',
          phone: '9848112255',
          message: 'Sri Vidya High School Alert: Outstanding fee balance of ₹10,000 for G. Karthik (SV-0005) is due on 26 Oct 2026. Please remit promptly.',
          gateway: 'AP-EDUSMS (Airtel DLT)',
          status: 'DELIVERED',
        },
      ],
    },
    // 6. V. Siri Varshini (Class 9-B, SV-0006) - Cleared
    {
      admNo: 'SV-0006',
      totalAmount: 28000,
      concessionAmount: 0,
      paidAmount: 28000,
      dueAmount: 0,
      dueDate: new Date('2026-10-26T00:00:00.000Z'),
      status: 'Paid',
      receipts: [
        { receiptNumber: 'RCP-2026-1016', amount: 14000, date: new Date('2026-06-24T10:30:00.000Z'), mode: 'UPI', desc: 'Term 1 Academic Fee' },
        { receiptNumber: 'RCP-2026-2050', amount: 14000, date: new Date('2026-10-15T13:45:00.000Z'), mode: 'Cash', desc: 'Term 2 Academic Fee' },
      ],
    },
    // 7. CH. Hemanth (Class 7-A, SV-0007, Inactive) - DEFAULTER (₹8,500 due, 22 days overdue)
    {
      admNo: 'SV-0007',
      totalAmount: 24000,
      concessionAmount: 3500, // Exit adjustment
      paidAmount: 12000,
      dueAmount: 8500,
      dueDate: new Date('2026-10-18T00:00:00.000Z'), // 22 days overdue as of Nov 9, 2026
      status: 'Pending',
      receipts: [
        { receiptNumber: 'RCP-2026-1017', amount: 12000, date: new Date('2026-06-25T15:00:00.000Z'), mode: 'UPI', desc: 'Term 1 Academic Fee' },
      ],
      smsReminders: [
        {
          date: new Date('2026-10-15T09:45:00.000Z'),
          recipientName: 'Sri CH. Suresh',
          phone: '9848112277',
          message: 'Sri Vidya High School Alert: Outstanding fee balance of ₹8,500 for CH. Hemanth (SV-0007) is overdue. Please settle before exit TC clearance.',
          gateway: 'WhatsApp (Meta Cloud API)',
          status: 'DELIVERED',
        },
      ],
    },
    // 8. S. Tanvi Sree (Class 6-A, SV-0008) - Cleared
    {
      admNo: 'SV-0008',
      totalAmount: 22000,
      concessionAmount: 0,
      paidAmount: 22000,
      dueAmount: 0,
      dueDate: new Date('2026-10-20T00:00:00.000Z'),
      status: 'Paid',
      receipts: [
        { receiptNumber: 'RCP-2026-1018', amount: 11000, date: new Date('2026-06-28T11:00:00.000Z'), mode: 'Cash', desc: 'Term 1 Primary Academic Fee' },
        { receiptNumber: 'RCP-2026-2052', amount: 11000, date: new Date('2026-10-18T16:20:00.000Z'), mode: 'UPI', desc: 'Term 2 Primary Academic Fee' },
      ],
    },
    // 9. A. Sneha (Class 6-A, SV-0010) - Cleared
    {
      admNo: 'SV-0010',
      totalAmount: 22000,
      concessionAmount: 0,
      paidAmount: 22000,
      dueAmount: 0,
      dueDate: new Date('2026-10-20T00:00:00.000Z'),
      status: 'Paid',
      receipts: [
        { receiptNumber: 'RCP-2026-1020', amount: 11000, date: new Date('2026-06-29T10:00:00.000Z'), mode: 'UPI', desc: 'Term 1 Primary Fee' },
        { receiptNumber: 'RCP-2026-2054', amount: 11000, date: new Date('2026-10-20T14:00:00.000Z'), mode: 'UPI', desc: 'Term 2 Primary Fee' },
      ],
    },
  ];

  let totalBilledSum = 0;
  let totalConcessionsSum = 0;
  let totalPaidSum = 0;
  let totalDueSum = 0;

  for (const def of studentFeeLedgerDefs) {
    const student = allStudents.find((s) => s.admissionNo === def.admNo);
    if (!student) {
      console.warn(`Student with admissionNo ${def.admNo} not found in DB!`);
      continue;
    }

    const structure = structMap[student.class] || createdStructures[0];

    const feeDoc = await Fee.create({
      student: student._id,
      feeStructure: structure._id,
      academicYear: '2025-2026',
      term: 'Annual & Term 2',
      totalAmount: def.totalAmount,
      concessionAmount: def.concessionAmount,
      paidAmount: def.paidAmount,
      dueAmount: def.dueAmount,
      dueDate: def.dueDate,
      status: def.status,
      remarks: def.dueAmount > 0 ? `Outstanding balance of ₹${def.dueAmount}` : 'All dues cleared for AY 2025-2026',
      breakdown: [
        { item: 'Tuition Fee', amount: def.totalAmount * 0.75 },
        { item: 'Science & Computer Lab Fee', amount: def.totalAmount * 0.15 },
        { item: 'Library & Activities', amount: def.totalAmount * 0.10 },
      ],
    });

    // Update student's feeStatus on student record
    await Student.findByIdAndUpdate(student._id, {
      feeStatus: def.dueAmount === 0 ? 'Paid' : def.paidAmount > 0 ? 'Partial' : 'Pending',
    });

    totalBilledSum += def.totalAmount;
    totalConcessionsSum += def.concessionAmount;
    totalPaidSum += def.paidAmount;
    totalDueSum += def.dueAmount;

    // Create Receipts and Payments for this student
    for (const r of def.receipts) {
      const orderId = `ORD_SV_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const payment = await Payment.create({
        orderId,
        paymentId: `PAY_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        fee: feeDoc._id,
        student: student._id,
        payer: adminId,
        amount: r.amount,
        currency: 'INR',
        paymentMethod: r.mode === 'Cash' ? 'CASH' : r.mode === 'Card' ? 'CARD' : 'UPI',
        paymentChannel: r.mode === 'Cash' ? 'OFFLINE_COUNTER' : 'ONLINE_GATEWAY',
        status: 'SUCCESS',
        receiptNumber: r.receiptNumber,
        verifiedAt: r.date,
        createdAt: r.date,
      });

      await Receipt.create({
        receiptNumber: r.receiptNumber,
        payment: payment._id,
        fee: feeDoc._id,
        student: student._id,
        payer: adminId,
        amountPaid: r.amount,
        remainingDue: Math.max(0, def.totalAmount - def.concessionAmount - r.amount),
        paymentDate: r.date,
        paymentMode: r.mode,
        description: r.desc,
        institutionName: 'Sri Vidya E.M High School',
        issuedBy: 'Accounts Dept, Sri Vidya High School',
        createdAt: r.date,
      });
    }

    // Create SMS Reminder logs if any
    if (Array.isArray(def.smsReminders)) {
      for (const sms of def.smsReminders) {
        await SmsLog.create({
          student: student._id,
          admissionNo: student.admissionNo,
          studentName: student.fullName,
          recipientName: sms.recipientName,
          recipientPhone: sms.phone,
          message: sms.message,
          category: 'FEE_REMINDER',
          gateway: sms.gateway,
          status: sms.status,
          deliveredAt: sms.date,
          createdAt: sms.date,
        });
      }
    }

    console.log(`✓ Ledgers, receipts & reminders seeded for ${student.fullName} (${student.admissionNo}): Total ₹${def.totalAmount}, Paid ₹${def.paidAmount}, Due ₹${def.dueAmount}`);
  }

  console.log('\n--- 3. Seeding Authentic Today Counter Receipts (Nov 9, 2026) ---');
  // Today's counter receipts:
  // E.g. Receipt 1: ₹45,000 Cash, Receipt 2: ₹97,500 UPI = ₹1,42,500 Today Counter Collections (18 receipts aggregate or featured receipts)
  const todayDate = new Date();
  todayDate.setHours(9, 30, 0, 0);

  const todayStudent1 = allStudents.find((s) => s.admissionNo === 'SV-0001');
  const todayStudent2 = allStudents.find((s) => s.admissionNo === 'SV-0002');
  const student1Id = todayStudent1 ? todayStudent1._id : allStudents[0]._id;
  const student2Id = todayStudent2 ? todayStudent2._id : allStudents[0]._id;
  const fee1 = await Fee.findOne({ student: student1Id });
  const fee2 = await Fee.findOne({ student: student2Id });

  // Receipt Today Cash: ₹45,000
  const orderTodayCash = `ORD_SV_TODAY_CASH_${Date.now()}`;
  const payTodayCash = await Payment.create({
    orderId: orderTodayCash,
    paymentId: `PAY_TODAY_CASH`,
    fee: fee1 ? fee1._id : new mongoose.Types.ObjectId(),
    student: student1Id,
    payer: adminId,
    amount: 45000,
    currency: 'INR',
    paymentMethod: 'CASH',
    paymentChannel: 'OFFLINE_COUNTER',
    status: 'SUCCESS',
    receiptNumber: 'RCP-2026-9011',
    verifiedAt: todayDate,
    createdAt: todayDate,
  });

  await Receipt.create({
    receiptNumber: 'RCP-2026-9011',
    payment: payTodayCash._id,
    fee: fee1 ? fee1._id : new mongoose.Types.ObjectId(),
    student: student1Id,
    payer: adminId,
    amountPaid: 45000,
    remainingDue: 0,
    paymentDate: todayDate,
    paymentMode: 'Cash',
    description: "Today's Counter Collection (Academic Dues Batch 1)",
    institutionName: 'Sri Vidya E.M High School',
    issuedBy: 'Accounts Counter 1, Sri Vidya High School',
    createdAt: todayDate,
  });

  // Receipt Today UPI: ₹97,500
  const todayDate2 = new Date();
  todayDate2.setHours(11, 45, 0, 0);
  const orderTodayUPI = `ORD_SV_TODAY_UPI_${Date.now()}`;
  const payTodayUPI = await Payment.create({
    orderId: orderTodayUPI,
    paymentId: `PAY_TODAY_UPI`,
    fee: fee2 ? fee2._id : new mongoose.Types.ObjectId(),
    student: student2Id,
    payer: adminId,
    amount: 97500,
    currency: 'INR',
    paymentMethod: 'UPI',
    paymentChannel: 'ONLINE_GATEWAY',
    status: 'SUCCESS',
    receiptNumber: 'RCP-2026-9012',
    verifiedAt: todayDate2,
    createdAt: todayDate2,
  });

  await Receipt.create({
    receiptNumber: 'RCP-2026-9012',
    payment: payTodayUPI._id,
    fee: fee2 ? fee2._id : new mongoose.Types.ObjectId(),
    student: student2Id,
    payer: adminId,
    amountPaid: 97500,
    remainingDue: 0,
    paymentDate: todayDate2,
    paymentMode: 'UPI',
    description: "Today's Online UPI Collection (Batch Settlement)",
    institutionName: 'Sri Vidya E.M High School',
    issuedBy: 'AP-Online Payment Gateway',
    createdAt: todayDate2,
  });

  console.log("✓ Seeded Today's Counter Receipts: Cash ₹45,000 + UPI ₹97,500 = ₹1,42,500");

  console.log('\n=============================================');
  console.log('SUMMARY OF SEEDED FINANCIAL LEDGER:');
  console.log(`- Total Students: ${allStudents.length}`);
  console.log(`- Total Billed: ₹${totalBilledSum}`);
  console.log(`- Total Concessions: ₹${totalConcessionsSum}`);
  console.log(`- Net Target: ₹${totalBilledSum - totalConcessionsSum}`);
  console.log(`- Total Collected: ₹${totalPaidSum}`);
  console.log(`- Total Outstanding Dues: ₹${totalDueSum}`);
  console.log(`- Realization %: ${(((totalPaidSum) / (totalBilledSum - totalConcessionsSum)) * 100).toFixed(1)}%`);
  console.log(`- Defaulters Count: 3 (K. Sai Teja ₹12.5K, G. Karthik ₹10K, CH. Hemanth ₹8.5K)`);
  console.log(`- Cleared Students: 6 of 9`);
  console.log('=============================================\n');

  await mongoose.disconnect();
}

seedFeeLedger().catch((err) => {
  console.error(err);
  process.exit(1);
});
