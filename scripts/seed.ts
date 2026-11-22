#!/usr/bin/env tsx
/**
 * Seed script: creates demo statuses, users and tasks.
 * Usage:
 *   npm run seed          — insert seed data (skips if data already exists)
 *   npm run seed:reset    — wipe all data and re-insert fresh seed data
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set in .env.local");
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

// ─── Schemas (inline to avoid next.js module issues in script context) ────────

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    role: { type: String, default: "" },
    avatarColor: String,
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const StatusSchema = new Schema(
  {
    name: String,
    color: String,
    order: Number,
    isDefault: { type: Boolean, default: false },
    isCompletion: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const TaskSchema = new Schema(
  {
    title: String,
    description: { type: String, default: "" },
    status: { type: Schema.Types.ObjectId, ref: "Status" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const isReset = process.argv.includes("--reset");

  console.log("🌱  TaskFlow Seed Script");
  console.log(`    Mode: ${isReset ? "RESET + reseed" : "insert (skip if exists)"}`);

  await mongoose.connect(MONGODB_URI as string);
  console.log("✅  Connected to MongoDB");

  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Status = mongoose.models.Status || mongoose.model("Status", StatusSchema);
  const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

  // ── Reset ──────────────────────────────────────────────────────────────────
  if (isReset) {
    await Promise.all([
      User.deleteMany({}),
      Status.deleteMany({}),
      Task.deleteMany({}),
    ]);
    console.log("🗑   Cleared all existing data");
  }

  // ── Check if already seeded ───────────────────────────────────────────────
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0 && !isReset) {
    console.log("ℹ   Data already exists. Use --reset to wipe and reseed.");
    await mongoose.disconnect();
    return;
  }

  // ── Statuses ──────────────────────────────────────────────────────────────
  const statusDefs = [
    { name: "To Do",       color: "#6B7280", order: 0, isDefault: true,  isCompletion: false },
    { name: "In Progress", color: "#0f62fe", order: 1, isDefault: false, isCompletion: false },
    { name: "In Review",   color: "#c84000", order: 2, isDefault: false, isCompletion: false },
    { name: "Completed",   color: "#006a68", order: 3, isDefault: false, isCompletion: true  },
  ];

  const statuses = await Status.insertMany(statusDefs);
  console.log(`✅  Created ${statuses.length} statuses`);

  const [sTodo, sInProgress, sInReview, sCompleted] = statuses;

  // ── Users ─────────────────────────────────────────────────────────────────
  // Avatar colors derived from name hash using the same palette as Avatar.tsx
  const AVATAR_COLORS = [
    "#0f62fe", "#006a68", "#2f3131",
    "#9e3100", "#004ccd", "#00504e", "#832700",
  ];

  function deriveColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  const userDefs = [
    { name: "Alice Johnson", email: "alice@example.com", role: "Product Manager" },
    { name: "Bob Smith",     email: "bob@example.com",   role: "Frontend Developer" },
    { name: "Carol Davis",   email: "carol@example.com", role: "Backend Developer" },
    { name: "Dan Wilson",    email: "dan@example.com",   role: "Designer" },
    { name: "Eva Martinez",  email: "eva@example.com",   role: "QA Engineer" },
  ].map((u) => ({ ...u, avatarColor: deriveColor(u.name), isActive: true, deletedAt: null }));

  const users = await User.insertMany(userDefs);
  console.log(`✅  Created ${users.length} users`);

  const [alice, bob, carol, dan, eva] = users;

  // ── Tasks (15) ────────────────────────────────────────────────────────────
  const taskDefs = [
    // --- To Do (3) ---
    {
      title: "Redesign onboarding flow for new users",
      description: "Improve first-time user experience by simplifying the 5-step onboarding into a single guided setup modal.",
      status: sTodo._id,
      priority: "high",
      dueDate: daysFromNow(5),
      createdBy: alice._id,
      assignedTo: dan._id,
    },
    {
      title: "Add CSV export to task list page",
      description: "Allow users to export filtered task list results as a CSV file from the task list toolbar.",
      status: sTodo._id,
      priority: "medium",
      dueDate: daysFromNow(10),
      createdBy: bob._id,
      assignedTo: bob._id,
    },
    {
      title: "Set up Playwright E2E test suite",
      description: "Configure Playwright with page object models and add critical path E2E tests for task creation, Kanban and settings.",
      status: sTodo._id,
      priority: "medium",
      dueDate: daysFromNow(14),
      createdBy: carol._id,
      assignedTo: eva._id,
    },

    // --- In Progress (4) ---
    {
      title: "Implement RTK Query task list endpoint",
      description: "Wire the /api/v1/tasks endpoint to the RTK Query tasksApi slice including filter, sort and pagination params.",
      status: sInProgress._id,
      priority: "high",
      dueDate: daysFromNow(2),
      createdBy: carol._id,
      assignedTo: carol._id,
    },
    {
      title: "Build Kanban board column layout",
      description: "Create responsive Kanban board with status-based columns, task cards, and inline quick-add widget per column.",
      status: sInProgress._id,
      priority: "high",
      dueDate: daysFromNow(3),
      createdBy: alice._id,
      assignedTo: bob._id,
    },
    {
      title: "Design dashboard stat card components",
      description: "Build the 5 KPI stat cards using CSS flex bars matching the design export, including left accent stripe.",
      status: sInProgress._id,
      priority: "medium",
      dueDate: daysAgo(1), // overdue
      createdBy: dan._id,
      assignedTo: dan._id,
    },
    {
      title: "Write Mongoose service layer for tasks",
      description: "Implement taskService.ts covering list (with filters), getById, create, update, softDelete, and getStats.",
      status: sInProgress._id,
      priority: "high",
      dueDate: daysAgo(2), // overdue
      createdBy: carol._id,
      assignedTo: carol._id,
    },

    // --- In Review (3) ---
    {
      title: "User management settings page",
      description: "Build /settings/users with active/inactive tabs, user table, invite modal, and deactivate/reactivate actions.",
      status: sInReview._id,
      priority: "medium",
      dueDate: daysFromNow(1),
      createdBy: alice._id,
      assignedTo: bob._id,
    },
    {
      title: "Status management settings page",
      description: "Build /settings/statuses with status list, color picker, order management, default/completion flags, and deletion with task reassignment dialog.",
      status: sInReview._id,
      priority: "medium",
      dueDate: daysFromNow(2),
      createdBy: alice._id,
      assignedTo: carol._id,
    },
    {
      title: "SCSS design token system implementation",
      description: "Implement the full CSS custom property system from the design export including all color, spacing, typography, radius and shadow tokens.",
      status: sInReview._id,
      priority: "low",
      dueDate: daysAgo(3), // overdue
      createdBy: dan._id,
      assignedTo: dan._id,
    },

    // --- Completed (5) ---
    {
      title: "Set up Next.js 16 project scaffolding",
      description: "Initialize the TaskFlow project with Next.js, TypeScript, App Router, ESLint, Prettier and all runtime dependencies.",
      status: sCompleted._id,
      priority: "high",
      dueDate: daysAgo(10),
      createdBy: carol._id,
      assignedTo: carol._id,
    },
    {
      title: "Design system research from Stitch export",
      description: "Extract all color tokens, font families, spacing values and component patterns from the _stitch_export directory HTML files.",
      status: sCompleted._id,
      priority: "medium",
      dueDate: daysAgo(8),
      createdBy: dan._id,
      assignedTo: dan._id,
    },
    {
      title: "Layout shell components (Navbar, Footer, PageShell)",
      description: "Build fixed Navbar with user switcher, Footer, PageShell wrapper, PageHeader and SettingsBreadcrumb components.",
      status: sCompleted._id,
      priority: "high",
      dueDate: daysAgo(5),
      createdBy: bob._id,
      assignedTo: bob._id,
    },
    {
      title: "UI primitive component library",
      description: "Build Button, Badge, StatusBadge, PriorityBadge, Avatar, Input, Textarea, Select, Modal, Spinner, Skeleton, Toast, EmptyState, ErrorState, Pagination and ConfirmDialog.",
      status: sCompleted._id,
      priority: "high",
      dueDate: daysAgo(3),
      createdBy: carol._id,
      assignedTo: bob._id,
    },
    {
      title: "MongoDB Atlas cluster and connection setup",
      description: "Configure MongoDB Atlas free tier cluster, whitelist IPs, create connection string, set up Mongoose singleton connection with hot-reload support.",
      status: sCompleted._id,
      priority: "medium",
      dueDate: daysAgo(12),
      createdBy: carol._id,
      assignedTo: carol._id,
    },
  ];

  const tasks = await Task.insertMany(taskDefs);
  console.log(`✅  Created ${tasks.length} tasks`);

  // ── Summary ───────────────────────────────────────────────────────────────
  const overdue = taskDefs.filter(
    (t) => t.dueDate < new Date() && t.status !== sCompleted._id
  ).length;

  console.log("\n📊  Seed Summary:");
  console.log(`    Statuses : ${statuses.length}`);
  console.log(`    Users    : ${users.length}`);
  console.log(`    Tasks    : ${tasks.length}`);
  console.log(`    Overdue  : ${overdue}`);
  console.log(`    To Do    : ${taskDefs.filter((t) => String(t.status) === String(sTodo._id)).length}`);
  console.log(`    In Prog  : ${taskDefs.filter((t) => String(t.status) === String(sInProgress._id)).length}`);
  console.log(`    In Review: ${taskDefs.filter((t) => String(t.status) === String(sInReview._id)).length}`);
  console.log(`    Completed: ${taskDefs.filter((t) => String(t.status) === String(sCompleted._id)).length}`);

  await mongoose.disconnect();
  console.log("\n🎉  Seeding complete! Database is ready.");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
