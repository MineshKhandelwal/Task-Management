import mongoose, { FilterQuery } from "mongoose";
import { connectDB } from "@/lib/db";
import Task, { ITask, Priority } from "@/lib/db/models/Task";
import Status, { IStatus } from "@/lib/db/models/Status";
import User, { IUser } from "@/lib/db/models/User";
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskListQueryInput,
} from "@/lib/validations/taskSchema";
import { defaultDueDate } from "@/lib/utils/dateUtils";

export interface PopulatedTask {
  _id: string;
  title: string;
  description: string;
  status: {
    _id: string;
    name: string;
    color: string;
    isCompletion: boolean;
  };
  priority: Priority;
  dueDate: Date | null;
  createdBy: {
    _id: string;
    name: string;
    avatarColor: string;
  };
  assignedTo: {
    _id: string;
    name: string;
    avatarColor: string;
  } | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  total: number;
  byStatus: Array<{
    statusId: string;
    name: string;
    color: string;
    count: number;
  }>;
  byPriority: Array<{
    priority: "high" | "medium" | "low";
    count: number;
  }>;
  completed: number;
  overdue: number;
  completionPercentage: number;
  byUser: Array<{
    userId: string;
    name: string;
    avatarColor: string;
    total: number;
    completed: number;
    completionPercentage: number;
  }>;
  recentTasks: PopulatedTask[];
}

export class TaskService {
  static async listTasks(query: TaskListQueryInput) {
    await connectDB();

    const filter: FilterQuery<ITask> = { deletedAt: null };

    // Search on title and description
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
      ];
    }

    // Status filter
    if (query.status) {
      filter.status = new mongoose.Types.ObjectId(query.status);
    }

    // Priority filter
    if (query.priority) {
      filter.priority = query.priority;
    }

    // Assignee filter
    if (query.assignedTo) {
      if (query.assignedTo === "unassigned") {
        filter.assignedTo = null;
      } else {
        filter.assignedTo = new mongoose.Types.ObjectId(query.assignedTo);
      }
    }

    // Creator filter
    if (query.createdBy) {
      filter.createdBy = new mongoose.Types.ObjectId(query.createdBy);
    }

    // Due date range
    if (query.dueBefore || query.dueAfter) {
      filter.dueDate = {};
      if (query.dueBefore) {
        filter.dueDate.$lte = new Date(query.dueBefore);
      }
      if (query.dueAfter) {
        filter.dueDate.$gte = new Date(query.dueAfter);
      }
    }

    const { page, limit, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const total = await Task.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === "priority") {
      // In business logic: high > medium > low
      // When sorted asc: low (1), medium (2), high (3)
      // When sorted desc: high, medium, low
      sortOption = { priority: sortOrder === "asc" ? 1 : -1 };
    } else if (sortBy) {
      sortOption = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
    }

    const tasks = (await Task.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("status", "_id name color isCompletion")
      .populate("createdBy", "_id name avatarColor")
      .populate("assignedTo", "_id name avatarColor")
      .lean()) as unknown as PopulatedTask[];

    return {
      tasks,
      total,
      page,
      limit,
      totalPages,
    };
  }

  static async getTaskById(id: string): Promise<PopulatedTask | null> {
    await connectDB();
    return (await Task.findOne({ _id: id, deletedAt: null })
      .populate("status", "_id name color isCompletion")
      .populate("createdBy", "_id name avatarColor")
      .populate("assignedTo", "_id name avatarColor")
      .lean()) as unknown as PopulatedTask | null;
  }

  static async createTask(
    input: CreateTaskInput,
    createdByUserId?: string
  ): Promise<PopulatedTask> {
    await connectDB();

    // 1. Resolve Creator
    let creatorId: mongoose.Types.ObjectId;
    if (createdByUserId && mongoose.Types.ObjectId.isValid(createdByUserId)) {
      const user = await User.findOne({ _id: createdByUserId, deletedAt: null });
      if (user) {
        creatorId = user._id;
      } else {
        const fallback = await User.findOne({ deletedAt: null });
        if (!fallback) {
          throw new Error("No users exist in the system to assign createdBy.");
        }
        creatorId = fallback._id;
      }
    } else {
      const fallback = await User.findOne({ deletedAt: null });
      if (!fallback) {
        throw new Error("No users exist in the system to assign createdBy.");
      }
      creatorId = fallback._id;
    }

    // 2. Resolve Status
    let statusId: mongoose.Types.ObjectId;
    if (input.status && mongoose.Types.ObjectId.isValid(input.status)) {
      const statusDoc = await Status.findOne({ _id: input.status, deletedAt: null });
      if (!statusDoc) {
        const error = new Error("Invalid status ID specified");
        (error as unknown as { code: string }).code = "VALIDATION_ERROR";
        throw error;
      }
      statusId = statusDoc._id;
    } else {
      const defaultStatus =
        (await Status.findOne({ isDefault: true, deletedAt: null })) ||
        (await Status.findOne({ deletedAt: null }).sort({ order: 1 }));
      if (!defaultStatus) {
        throw new Error("No status available in the system.");
      }
      statusId = defaultStatus._id;
    }

    // 3. Resolve Assignee
    let assigneeId: mongoose.Types.ObjectId | null = null;
    if (input.assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(input.assignedTo)) {
        const error = new Error("Invalid assignedTo user ID");
        (error as unknown as { code: string }).code = "VALIDATION_ERROR";
        throw error;
      }
      const assignee = await User.findOne({
        _id: input.assignedTo,
        deletedAt: null,
      });
      if (!assignee) {
        const error = new Error("Assigned user not found");
        (error as unknown as { code: string }).code = "NOT_FOUND";
        throw error;
      }
      if (!assignee.isActive) {
        const error = new Error("Cannot assign task to a deactivated user");
        (error as unknown as { code: string }).code = "BUSINESS_RULE_ERROR";
        throw error;
      }
      assigneeId = assignee._id;
    }

    // 4. Resolve Due Date
    const dueDate = input.dueDate ? new Date(input.dueDate) : defaultDueDate();

    // 5. Create
    const task = await Task.create({
      title: input.title,
      description: input.description || "",
      status: statusId,
      priority: input.priority || "medium",
      dueDate,
      createdBy: creatorId,
      assignedTo: assigneeId,
      deletedAt: null,
    });

    return (await Task.findById(task._id)
      .populate("status", "_id name color isCompletion")
      .populate("createdBy", "_id name avatarColor")
      .populate("assignedTo", "_id name avatarColor")
      .lean()) as unknown as PopulatedTask;
  }

  static async updateTask(
    id: string,
    input: UpdateTaskInput
  ): Promise<PopulatedTask | null> {
    await connectDB();

    const task = await Task.findOne({ _id: id, deletedAt: null });
    if (!task) {
      return null;
    }

    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.priority !== undefined) updateData.priority = input.priority;

    if (input.dueDate !== undefined) {
      updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    if (input.status !== undefined) {
      const statusDoc = await Status.findOne({ _id: input.status, deletedAt: null });
      if (!statusDoc) {
        const error = new Error("Invalid status ID");
        (error as unknown as { code: string }).code = "VALIDATION_ERROR";
        throw error;
      }
      updateData.status = statusDoc._id;
    }

    if (input.assignedTo !== undefined) {
      if (input.assignedTo === null || input.assignedTo === "") {
        updateData.assignedTo = null;
      } else {
        const assignee = await User.findOne({
          _id: input.assignedTo,
          deletedAt: null,
        });
        if (!assignee) {
          const error = new Error("Assigned user not found");
          (error as unknown as { code: string }).code = "NOT_FOUND";
          throw error;
        }
        if (!assignee.isActive) {
          const error = new Error("Cannot assign task to an inactive user");
          (error as unknown as { code: string }).code = "BUSINESS_RULE_ERROR";
          throw error;
        }
        updateData.assignedTo = assignee._id;
      }
    }

    const updated = (await Task.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("status", "_id name color isCompletion")
      .populate("createdBy", "_id name avatarColor")
      .populate("assignedTo", "_id name avatarColor")
      .lean()) as unknown as PopulatedTask | null;

    return updated;
  }

  static async softDeleteTask(id: string): Promise<boolean> {
    await connectDB();
    const result = await Task.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );
    return !!result;
  }

  static async getDashboardStats(): Promise<DashboardStats> {
    await connectDB();

    const now = new Date();

    // 1. Fetch all active statuses
    const statuses = await Status.find({ deletedAt: null }).sort({ order: 1 });
    const completionStatusIds = statuses
      .filter((s) => s.isCompletion)
      .map((s) => s._id);

    // 2. Total active tasks
    const total = await Task.countDocuments({ deletedAt: null });

    // 3. By Status counts
    const byStatus = await Promise.all(
      statuses.map(async (status) => {
        const count = await Task.countDocuments({
          status: status._id,
          deletedAt: null,
        });
        return {
          statusId: String(status._id),
          name: status.name,
          color: status.color,
          count,
        };
      })
    );

    // 4. By Priority counts
    const [highCount, mediumCount, lowCount] = await Promise.all([
      Task.countDocuments({ priority: "high", deletedAt: null }),
      Task.countDocuments({ priority: "medium", deletedAt: null }),
      Task.countDocuments({ priority: "low", deletedAt: null }),
    ]);

    const byPriority: Array<{ priority: "high" | "medium" | "low"; count: number }> = [
      { priority: "high", count: highCount },
      { priority: "medium", count: mediumCount },
      { priority: "low", count: lowCount },
    ];

    // 5. Completed count
    const completed = await Task.countDocuments({
      status: { $in: completionStatusIds },
      deletedAt: null,
    });

    // 6. Overdue count (due date in past and status not completed)
    const overdue = await Task.countDocuments({
      dueDate: { $lt: now },
      status: { $nin: completionStatusIds },
      deletedAt: null,
    });

    // 7. Overall Completion percentage
    const completionPercentage =
      total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0;

    // 8. By User performance
    const activeUsers = await User.find({ deletedAt: null }).sort({ name: 1 });
    const byUser = await Promise.all(
      activeUsers.map(async (user) => {
        const userTotal = await Task.countDocuments({
          assignedTo: user._id,
          deletedAt: null,
        });
        const userCompleted = await Task.countDocuments({
          assignedTo: user._id,
          status: { $in: completionStatusIds },
          deletedAt: null,
        });
        const userPct =
          userTotal > 0
            ? Number(((userCompleted / userTotal) * 100).toFixed(1))
            : 0;

        return {
          userId: String(user._id),
          name: user.name,
          avatarColor: user.avatarColor,
          total: userTotal,
          completed: userCompleted,
          completionPercentage: userPct,
        };
      })
    );

    // 9. Recent 5 tasks
    const recentTasks = (await Task.find({ deletedAt: null })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("status", "_id name color isCompletion")
      .populate("createdBy", "_id name avatarColor")
      .populate("assignedTo", "_id name avatarColor")
      .lean()) as unknown as PopulatedTask[];

    return {
      total,
      byStatus,
      byPriority,
      completed,
      overdue,
      completionPercentage,
      byUser,
      recentTasks,
    };
  }
}
