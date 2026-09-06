import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide student name'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Please provide a roll/ID number'],
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },
    guardianPhone: {
      type: String,
      required: [true, 'Please provide guardian phone number'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      default: '',
    },
    monthlyFee: {
      type: Number,
      default: null,
    },
    classLevel: {
      type: String,
      required: [true, 'Please provide class level'],
      trim: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Please assign to a batch'],
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    photo: {
      type: String, // URL to photo if implemented
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
