import { connectDB } from "@/lib/db";
import User, { IUser } from "@/lib/db/models/User";
import { CreateUserInput, UpdateUserInput } from "@/lib/validations/userSchema";
import { deriveAvatarColor } from "@/lib/utils/colorUtils";

export class UserService {
  static async listUsers(isActiveFilter?: boolean | "all"): Promise<IUser[]> {
    await connectDB();
    const query: Record<string, unknown> = { deletedAt: null };

    if (isActiveFilter !== undefined && isActiveFilter !== "all") {
      query.isActive = isActiveFilter;
    }

    return User.find(query).sort({ createdAt: -1 }).lean() as unknown as IUser[];
  }

  static async getUserById(id: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({ _id: id, deletedAt: null }).lean() as unknown as IUser | null;
  }

  static async createUser(input: CreateUserInput): Promise<IUser> {
    await connectDB();

    // Check if email already exists
    const existing = await User.findOne({
      email: input.email.toLowerCase(),
      deletedAt: null,
    });
    if (existing) {
      const error = new Error("A user with this email already exists");
      (error as unknown as { code: string }).code = "CONFLICT";
      throw error;
    }

    const avatarColor = deriveAvatarColor(input.name);

    const newUser = await User.create({
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role || "",
      avatarColor,
      isActive: true,
      deletedAt: null,
    });

    return newUser.toObject();
  }

  static async updateUser(id: string, input: UpdateUserInput): Promise<IUser | null> {
    await connectDB();

    // If updating email, verify uniqueness
    if (input.email) {
      const existing = await User.findOne({
        _id: { $ne: id },
        email: input.email.toLowerCase(),
        deletedAt: null,
      });
      if (existing) {
        const error = new Error("A user with this email already exists");
        (error as unknown as { code: string }).code = "CONFLICT";
        throw error;
      }
    }

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.email !== undefined) updateData.email = input.email.toLowerCase();
    if (input.role !== undefined) updateData.role = input.role;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const updated = await User.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean() as unknown as IUser | null;

    return updated;
  }

  static async softDeleteUser(id: string): Promise<boolean> {
    await connectDB();
    const result = await User.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date(), isActive: false } }
    );
    return !!result;
  }
}
