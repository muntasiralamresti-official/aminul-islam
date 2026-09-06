import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an exam title'],
      trim: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Please select a batch'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide exam date'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Please provide total marks'],
      min: 1,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
