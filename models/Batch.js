import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a batch name'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      trim: true,
    },
    classLevel: {
      type: String,
      required: [true, 'Please provide a class level'],
      trim: true,
    },
    schedule: {
      type: String, // E.g., 'Mon-Wed 5:00 PM'
      required: [true, 'Please provide a schedule'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide batch capacity'],
      min: 1,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
