import mongoose, { Schema, Document, Model } from "mongoose";

export type Priority = "low" | "medium" | "high";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: mongoose.Types.ObjectId;
  priority: Priority;
  dueDate: Date | null;
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: Schema.Types.ObjectId,
      ref: "Status",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"] as Priority[],
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

// Indexes for filter, sort, and query performance
TaskSchema.index({ deletedAt: 1 });
TaskSchema.index({ status: 1, deletedAt: 1 });
TaskSchema.index({ priority: 1, deletedAt: 1 });
TaskSchema.index({ assignedTo: 1, deletedAt: 1 });
TaskSchema.index({ createdBy: 1, deletedAt: 1 });
TaskSchema.index({ dueDate: 1, deletedAt: 1 });
TaskSchema.index({ createdAt: -1, deletedAt: 1 });
TaskSchema.index({ updatedAt: -1, deletedAt: 1 });

// Full-text search on title + description
TaskSchema.index({ title: "text", description: "text" });

// Prevent model recompilation during hot reload
const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
