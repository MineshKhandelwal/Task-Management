import { connectDB } from "@/lib/db";
import Status, { IStatus } from "@/lib/db/models/Status";
import Task from "@/lib/db/models/Task";
import { CreateStatusInput, UpdateStatusInput } from "@/lib/validations/statusSchema";

export interface DeleteStatusResult {
  message: string;
  reassignedCount: number;
}

export class StatusService {
  static async listStatuses(): Promise<IStatus[]> {
    await connectDB();
    return Status.find({ deletedAt: null }).sort({ order: 1 }).lean() as unknown as IStatus[];
  }

  static async getStatusById(id: string): Promise<IStatus | null> {
    await connectDB();
    return Status.findOne({ _id: id, deletedAt: null }).lean() as unknown as IStatus | null;
  }

  static async createStatus(input: CreateStatusInput): Promise<IStatus> {
    await connectDB();

    // Mutual exclusivity checks
    if (input.isDefault) {
      await Status.updateMany({ deletedAt: null }, { $set: { isDefault: false } });
    }
    if (input.isCompletion) {
      await Status.updateMany({ deletedAt: null }, { $set: { isCompletion: false } });
    }

    const newStatus = await Status.create({
      name: input.name,
      color: input.color,
      order: input.order,
      isDefault: !!input.isDefault,
      isCompletion: !!input.isCompletion,
      deletedAt: null,
    });

    return newStatus.toObject();
  }

  static async updateStatus(id: string, input: UpdateStatusInput): Promise<IStatus | null> {
    await connectDB();

    // Mutual exclusivity checks
    if (input.isDefault === true) {
      await Status.updateMany({ _id: { $ne: id }, deletedAt: null }, { $set: { isDefault: false } });
    }
    if (input.isCompletion === true) {
      await Status.updateMany({ _id: { $ne: id }, deletedAt: null }, { $set: { isCompletion: false } });
    }

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.order !== undefined) updateData.order = input.order;
    if (input.isDefault !== undefined) updateData.isDefault = input.isDefault;
    if (input.isCompletion !== undefined) updateData.isCompletion = input.isCompletion;

    const updated = await Status.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean() as unknown as IStatus | null;

    return updated;
  }

  static async getStatusUsageCount(statusId: string): Promise<number> {
    await connectDB();
    return Task.countDocuments({ status: statusId, deletedAt: null });
  }

  static async deleteStatus(id: string, reassignToStatusId?: string): Promise<DeleteStatusResult> {
    await connectDB();

    const statusToDelete = await Status.findOne({ _id: id, deletedAt: null });
    if (!statusToDelete) {
      const error = new Error("Status not found");
      (error as unknown as { code: string }).code = "NOT_FOUND";
      throw error;
    }

    // Business rule: Cannot delete default or completion status
    if (statusToDelete.isDefault) {
      const error = new Error("Cannot delete the default status. Set another status as default first.");
      (error as unknown as { code: string }).code = "BUSINESS_RULE_ERROR";
      throw error;
    }

    if (statusToDelete.isCompletion) {
      const error = new Error("Cannot delete the completion status. Set another status as completion first.");
      (error as unknown as { code: string }).code = "BUSINESS_RULE_ERROR";
      throw error;
    }

    const taskCount = await Task.countDocuments({ status: id, deletedAt: null });

    if (taskCount > 0 && !reassignToStatusId) {
      const error = new Error(
        `Cannot delete status: ${taskCount} active task(s) currently use this status. Please provide a reassignTo status ID.`
      );
      (error as unknown as { code: string; details: unknown }).code = "BUSINESS_RULE_ERROR";
      (error as unknown as { code: string; details: unknown }).details = { taskCount };
      throw error;
    }

    let targetStatusName = "";
    if (taskCount > 0 && reassignToStatusId) {
      if (reassignToStatusId === id) {
        const error = new Error("Cannot reassign tasks to the same status being deleted.");
        (error as unknown as { code: string }).code = "BUSINESS_RULE_ERROR";
        throw error;
      }

      const targetStatus = await Status.findOne({ _id: reassignToStatusId, deletedAt: null });
      if (!targetStatus) {
        const error = new Error("Reassignment target status not found.");
        (error as unknown as { code: string }).code = "NOT_FOUND";
        throw error;
      }
      targetStatusName = targetStatus.name;

      // Reassign all active tasks
      await Task.updateMany(
        { status: id, deletedAt: null },
        { $set: { status: reassignToStatusId } }
      );
    }

    // Soft delete the status
    await Status.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });

    const message = taskCount > 0
      ? `Status deleted. ${taskCount} task(s) reassigned to '${targetStatusName}'.`
      : "Status deleted successfully.";

    return {
      message,
      reassignedCount: taskCount,
    };
  }
}
