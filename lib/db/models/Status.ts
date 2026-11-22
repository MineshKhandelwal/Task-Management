import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStatus extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
  isCompletion: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const StatusSchema = new Schema<IStatus>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    color: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isCompletion: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
StatusSchema.index({ order: 1, deletedAt: 1 });
StatusSchema.index({ isDefault: 1 });
StatusSchema.index({ isCompletion: 1 });

// Prevent model recompilation during hot reload
const Status: Model<IStatus> =
  mongoose.models.Status || mongoose.model<IStatus>("Status", StatusSchema);

export default Status;
