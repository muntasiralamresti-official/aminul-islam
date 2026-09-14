import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a note title'],
      trim: true,
      maxlength: 120,
    },
    content: {
      type: String,
      required: [true, 'Please provide note content'],
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: ['General', 'Student', 'Class', 'Payment', 'Important'],
      default: 'General',
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

NoteSchema.index({ pinned: -1, updatedAt: -1 });
NoteSchema.index({ category: 1, updatedAt: -1 });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
