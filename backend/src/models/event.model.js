const mongoose = require('mongoose');

const schoolEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      unique: true,
      index: true,
      default: () => `EVT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Academic', 'Cultural', 'Sports', 'Holiday', 'PTM', 'Examination', 'Administrative', 'Other'],
      default: 'Academic',
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },
    startTime: { type: String, trim: true, default: '' },
    endTime: { type: String, trim: true, default: '' },
    venue: { type: String, trim: true, default: 'Main Campus Auditorium' },
    organizer: { type: String, trim: true, default: 'School Management' },
    targetAudience: { type: String, trim: true, default: 'All Students & Staff' },
    description: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
      default: 'UPCOMING',
      index: true,
    },
    academicYear: { type: String, default: '2026-2027', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

const SchoolEvent = mongoose.model('SchoolEvent', schoolEventSchema);
module.exports = { SchoolEvent };

