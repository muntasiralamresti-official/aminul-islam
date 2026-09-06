import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

// Ensure a student only has one result per exam
ResultSchema.index({ exam: 1, student: 1 }, { unique: true });

export default mongoose.models.Result || mongoose.model('Result', ResultSchema);
