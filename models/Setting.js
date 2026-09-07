import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    centerName: {
      type: String,
      default: "Aminul Islam",
    },
    contactEmail: {
      type: String,
      default: "admin@coaching.com",
    },
    defaultFee: {
      type: Number,
      default: 1000,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Setting ||
  mongoose.model("Setting", SettingSchema);
