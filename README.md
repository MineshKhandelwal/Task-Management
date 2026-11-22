# TaskFlow — Modern Enterprise Task Management

TaskFlow is a production-grade, multi-user task management application built with **Next.js 16 (App Router)**, **TypeScript**, **MongoDB Atlas (Mongoose)**, **Redux Toolkit + RTK Query**, **React Hook Form**, **Zod**, and **SCSS Modules**.

Designed and implemented in exact accordance with the design specifications in `_stitch_export/` and `docs/`, TaskFlow delivers a high-density, sharp enterprise aesthetic with instant optimistic updates, fast Jira-style task creation, and a zero-dependency architecture.

---

## Key Highlights & Design Decisions

- **Sharp Geometric Design System**: Strict adherence to enterprise ergonomics with 0px corner radius on buttons, inputs, and search bars, 2px radius on cards and modals, and IBM Plex Sans & IBM Plex Mono typography.
- **Pure CSS Flex Bar Charts**: Zero external charting libraries. All progress bars and distribution charts (Status, Priority, User Performance) are crafted using pure CSS flex bars with proportional percentages and scale axes.
- **Fast Jira-Style Quick Task Creation**:
  - **Task List View**: Pinned inline bottom row input (`QuickAddTaskRow`) with instantaneous task submission via `Enter` key, optimistic cache updates, and focus retention for continuous entry.
  - **Kanban Board View**: Per-column inline creation widgets (`KanbanQuickAdd`) pre-populating column status with quick submit/collapse keyboard controls.
- **Accessible Kanban Workflow**: Replaces fragile drag-and-drop libraries with an inline, styled status transition dropdown on every card, enabling instant, error-free cross-column task movement across mobile, tablet, and desktop viewports.
- **Simulated Multi-User Environment**: Persistent active user dropdown in the top navbar synced with `localStorage`, automatically injecting an `X-User-Id` header into all RTK Query API calls for audit tracking (`createdBy`, `assignedTo`).
- **Resilient Soft Deletion**: Non-destructive deletion across Users, Statuses, and Tasks via `deletedAt: Date | null`. Workflow status deletion features dependency checking (`/api/v1/statuses/:id/usage`) and task reassignment dialogs to prevent orphaned tasks.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Server & Client Components) |
| **Language** | TypeScript (Strict Mode) |
| **State Management** | Redux Toolkit & RTK Query (Optimistic caching, tag invalidation) |
| **Styling** | SCSS Modules with centralized CSS variable design tokens |
| **Database** | MongoDB Atlas with Mongoose ODM (Singleton connection pool) |
| **Form & Validation**| React Hook Form & Zod Schema Validation |
| **Testing** | Vitest (v8 coverage) & React Testing Library |
| **Fonts & Icons** | IBM Plex Sans, IBM Plex Mono, Google Material Symbols Outlined |

---

## Project Structure

```text
├── app/                        # Next.js App Router routes & API endpoints
│   ├── api/v1/                 # REST API endpoints
│   │   ├── statuses/           # Status CRUD and usage check
│   │   ├── tasks/              # Task CRUD, filters, and dashboard stats
│   │   └── users/              # User management & active filtering
│   ├── board/                  # Kanban Board page (/board)
│   ├── dashboard/              # Metrics & analytics dashboard (/dashboard)
│   ├── settings/               # Workflow settings
│   │   ├── statuses/           # Status management & workflow rules
│   │   └── users/              # Team member management & roles
│   ├── tasks/                  # Task list view with search, filter, pagination
│   ├── layout.tsx              # Root HTML shell, fonts, StoreProvider, ToastProvider
│   └── page.tsx                # Root redirect to /dashboard
├── components/                 # UI components
│   ├── dashboard/              # StatCard, StatusBarChart, PriorityBarChart, etc.
│   ├── kanban/                 # KanbanBoard, KanbanColumn, KanbanCard, KanbanQuickAdd
│   ├── layout/                 # Navbar, MobileNav, Footer, PageShell, PageHeader
│   ├── status/                 # StatusList, StatusFormModal, StatusDeleteDialog
│   ├── task/                   # TaskTable, TaskRow, QuickAddTaskRow, TaskFormModal, FilterBar
│   ├── ui/                     # Avatar, Badge, Button, Input, Modal, Toast, Skeleton, etc.
│   └── user/                   # UsersTable, UserFormModal
├── docs/                       # Architectural and technical documentation
├── hooks/                      # Custom hooks (useCurrentUser, useTaskFilters, useUrlParams)
├── lib/
│   ├── db/                     # Mongoose connection singleton and schemas
│   ├── services/               # Backend business logic services
│   ├── utils/                  # Date, color, and API response utilities
│   └── validations/            # Zod validation schemas
├── scripts/
│   └── seed.ts                 # Database seeding script
├── store/                      # Redux Toolkit store, currentUserSlice, and RTK Query APIs
├── styles/                     # Design tokens, typography, reset, and globals
└── tests/                      # Unit and component test suites (Vitest)
```

---

## Getting Started

### 1. Prerequisites

- **Node.js**: `v20.18.0` or higher
- **MongoDB**: A running MongoDB Atlas cluster URI or local MongoDB instance

### 2. Environment Configuration

Copy the example environment template:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/taskflow?retryWrites=true&w=majority
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Seed the Database

Populate MongoDB with default workflow statuses (To Do, In Progress, In Review, Done), active team members, and 15 realistic enterprise tasks:

```bash
npm run seed
```

To wipe existing collections and perform a clean reseed:

```bash
npm run seed:reset
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev --webpack` | Launches development server on port 3000 |
| `build` | `next build --webpack` | Compiles optimized production build |
| `start` | `next start` | Starts production server |
| `type-check` | `tsc --noEmit` | Validates TypeScript types across codebase |
| `test` | `vitest run` | Executes all 50 unit and component tests |
| `test:watch` | `vitest` | Runs Vitest in interactive watch mode |
| `test:coverage`| `vitest run --coverage` | Generates v8 test coverage reports |
| `seed` | `tsx scripts/seed.ts` | Populates database with default seed data |
| `seed:reset` | `tsx scripts/seed.ts --reset` | Cleans and reseeds database from scratch |

---

## REST API Reference

All API responses adhere to a consistent `{ success: boolean, data?: any, error?: { code, message } }` envelope.

### Tasks
- `GET /api/v1/tasks` — List tasks with search, status, priority, assignee, due date filters, sorting, and pagination.
- `POST /api/v1/tasks` — Create a new task.
- `GET /api/v1/tasks/stats` — Dashboard metrics (total, by status, by priority, overdue, completion %, user performance, recent activity).
- `GET /api/v1/tasks/:id` — Retrieve task details.
- `PATCH /api/v1/tasks/:id` — Update task fields.
- `DELETE /api/v1/tasks/:id` — Soft delete task (`deletedAt` timestamp).

### Statuses
- `GET /api/v1/statuses` — List active workflow statuses ordered by sequence.
- `POST /api/v1/statuses` — Create custom workflow status.
- `PATCH /api/v1/statuses/:id` — Update status name, color, order, or completion flag.
- `DELETE /api/v1/statuses/:id` — Soft delete status (optional reassign query `?reassignTo=<id>`).
- `GET /api/v1/statuses/:id/usage` — Check how many tasks are currently assigned to this status.

### Users
- `GET /api/v1/users` — List team members (query `?isActive=true|false|all`).
- `POST /api/v1/users` — Invite / create team member.
- `GET /api/v1/users/:id` — Get user profile.
- `PATCH /api/v1/users/:id` — Update user details or activate/deactivate user.

---

## Testing Suite

TaskFlow features automated test coverage using **Vitest** and **React Testing Library**:

- **Date Utilities (`tests/unit/utils/dateUtils.test.ts`)**: Tests `isOverdue`, `defaultDueDate`, `formatDate`, `toInputDateFormat`, and `formatRelativeTime`.
- **Color Utilities (`tests/unit/utils/colorUtils.test.ts`)**: Tests `deriveAvatarColor`, `isValidHexColor`, and `getInitials`.
- **Schema Validations (`tests/unit/validations/`)**: Validates Zod constraints for users, statuses, and tasks.
- **Component Tests (`tests/components/`)**: Validates `Button`, `PriorityBadge`, `StatusBadge`, and `StatCard`.

Run all tests:
```bash
npm test
```

---

## Deployment

TaskFlow is optimized for deployment on Vercel or any containerized Node.js hosting platform:

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project into Vercel.
3. Configure the `MONGODB_URI` environment variable in your project settings.
4. Deploy. Next.js App Router and standalone output will automatically configure routes and static assets.

---

## License

MIT © 2026 TaskFlow Enterprise.
