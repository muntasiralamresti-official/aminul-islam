import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Please select a student'],
    },
    month: {
      type: String,
      required: [true, 'Please select a month'],
    },
    year: {
      type: Number,
      required: [true, 'Please provide year'],
      default: () => new Date().getFullYear(),
    },
    amount: {
      type: Number,
      required: [true, 'Please provide payment amount'],
    },
    method: {
      type: String,
      enum: ['cash', 'bkash', 'nagad', 'bank'],
      default: 'cash',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['paid', 'due'],
      default: 'paid',
    }
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ year: 1, month: 1, status: 1 });
PaymentSchema.index({ student: 1, status: 1, year: 1, month: 1 });
PaymentSchema.index({ date: -1 });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
