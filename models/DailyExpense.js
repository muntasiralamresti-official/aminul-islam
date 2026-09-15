import mongoose from 'mongoose';

const DailyExpenseSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
      default: 'expense',
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
      maxlength: 80,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: 0.01,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    method: {
      type: String,
      enum: ['cash', 'bkash', 'nagad', 'bank'],
      default: 'cash',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

DailyExpenseSchema.index({ date: -1, type: 1 });
DailyExpenseSchema.index({ type: 1, date: -1 });

export default mongoose.models.DailyExpense || mongoose.model('DailyExpense', DailyExpenseSchema);
