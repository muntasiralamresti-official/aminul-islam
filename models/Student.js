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
      unique: true,
      sparse: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    guardianPhone: {
      type: String,
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
    photoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    monthlyFee: {
      type: Number,
      default: null,
    },
    classLevel: {
      type: String,
      trim: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
    admissionDate: {
      type: Date,
      default: Date.now,
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

StudentSchema.index({ status: 1 });
StudentSchema.index({ status: 1, batch: 1 });
StudentSchema.index({ batch: 1 });
StudentSchema.index({ createdAt: -1 });
// Text search index - speeds up name/roll/phone search queries
StudentSchema.index({ name: 1, rollNumber: 1, phone: 1 });
StudentSchema.index({ rollNumber: 1 });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
