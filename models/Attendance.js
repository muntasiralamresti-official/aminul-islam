import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    records: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
        },
        status: {
          type: String,
          enum: ['present', 'absent', 'late'],
          default: 'present',
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

AttendanceSchema.index({ batch: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ createdAt: -1 });
AttendanceSchema.index({ date: -1 });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
