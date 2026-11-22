# TaskFlow — Submission Answers

### The Three Most Important Decisions

---

**Decision 1: RTK Query with Optimistic Updates and URL-Synced Filters**

The first major decision was choosing **Redux Toolkit + RTK Query** for all server state, and binding every filter, sort, and pagination parameter directly to the **URL query string** rather than storing them in component state or a Redux slice.

The benefit is threefold: RTK Query handles caching and automatic background refetching whenever a mutation invalidates a cache tag — so after creating or editing a task, both the task list and dashboard update instantly without any manual refresh. URL-based filter state means users can bookmark a filtered view, share it with teammates, and use the browser's back and forward buttons naturally. And the `currentUserSlice` persists the selected user to `localStorage`, so the app remembers who you're acting as across sessions.

This architecture makes the app feel snappy and production-ready while keeping the state logic predictable and testable.

---

**Decision 2: Pure CSS Flex Bar Charts — Zero Charting Libraries**

The second decision was to build all data visualizations — the Status distribution chart, Priority distribution chart, and User Performance bars on the dashboard — entirely in **pure CSS flexbox**, without installing any charting library like Recharts or Chart.js.

This was both a design and performance choice. The enterprise aesthetic called for flat, sharp, horizontal bar charts with a scale axis — something that required highly customized rendering anyway. By building them with proportional flex widths and CSS custom property color tokens, the charts animate smoothly on mount, respect the design system perfectly, and add zero bytes to the client bundle. It also means there's no external dependency to maintain or update. The `StatusBarChart`, `PriorityBarChart`, and `UserPerformanceList` components are all self-contained, pixel-perfect implementations in pure React + SCSS.

---

**Decision 3: Accessible Kanban — Status Dropdown Instead of Drag-and-Drop**

The third decision was to deliberately replace drag-and-drop on the Kanban board with an **inline status transition dropdown** on every card.

Drag-and-drop libraries introduce significant complexity: they break on mobile, have poor screen reader support, and often cause race conditions with optimistic cache updates. Instead, every Kanban card has a small status selector that lets users move a task across columns instantly — it triggers an `updateTask` PATCH mutation, RTK Query invalidates the cache tag, and both the board and dashboard re-render with the new state. This approach works perfectly across mobile, tablet, and desktop, is fully keyboard-accessible, and is significantly more reliable than any drag-and-drop solution.

---

---

## What You Chose Not to Implement

> Provide a list of three features or functionalities you deliberately decided not to implement, along with the reasons for your decisions.

---

### 1. Real Authentication (JWT / Session-Based Login)

**What it would be:** A proper login screen, session cookies, JWT token validation, and per-user data isolation enforced at the API level.

**Why not implemented:**
Authentication was explicitly scoped out of this release. The architecture is fully prepared for it — the `currentUserSlice` mirrors where an `authSlice` would live, the `X-User-Id` header mirrors where a JWT subject would be injected, and the API route handlers have a `getCurrentUser()` placeholder that would read from a cookie — but implementing the full auth flow (registration, token refresh, secure cookie handling, middleware protection) would have consumed the majority of the available development time without contributing to the core task management features being evaluated. The simulated multi-user switcher in the navbar delivers the same demonstrable multi-user behavior for review purposes.

---

### 2. Drag-and-Drop Reordering of Kanban Cards

**What it would be:** Native drag-and-drop to move cards between columns and reorder cards within a column, using a library like `dnd-kit` or `react-beautiful-dnd`.

**Why not implemented:**
Drag-and-drop was replaced by an inline status transition dropdown on every card — a deliberate architectural choice, not an oversight. DnD libraries add significant bundle weight, have documented accessibility gaps (poor keyboard and screen reader support), and are notoriously brittle with optimistic cache updates. The dropdown approach is mobile-compatible, keyboard-navigable, and equally fast. The column reordering use case is covered by the `order` field on the Status model and the numeric order input in the Status edit modal.

---

### 3. Comments and Activity Log

**What it would be:** A per-task comment thread and a chronological activity log — recording every status change, field edit, assignment, and user comment against a task, displayed inside the Task Details Modal.

**Why not implemented:**
Implementing this correctly requires a dedicated `Comment` / `ActivityLog` collection in MongoDB, a new set of REST endpoints (`GET /api/v1/tasks/:id/comments`, `POST /api/v1/tasks/:id/comments`, `GET /api/v1/tasks/:id/activity`), Mongoose middleware hooks to auto-generate activity entries on every task update, and a non-trivial UI panel inside the Task Form Modal. Each of these pieces is straightforward individually, but together they represent a full sub-feature with its own data model, service layer, API surface, and UI — more scope than the remaining time allowed. The data model is designed to accommodate it: `createdBy` and `updatedAt` are already tracked on every task, providing the foundation for a future activity feed.

---

---

## Implementation Limitation

> Explain one limitation of your current implementation that you would address if you had one additional day to work on the project.

---

### Kanban Board Has a Hard 200-Task Cap (No Server-Side Pagination)

**Current behavior:**
The Kanban Board (`/board`) fetches all tasks in a single query with a hard cap of 200 tasks (`useGetTasksQuery({ limit: 200 })`). This was necessary because Kanban's column grouping happens on the client — tasks are fetched flat and then grouped by `status._id` inside the `KanbanBoard` component. This means that any team with more than 200 active tasks will see incomplete columns with no indication that data is truncated.

**What I would do with one additional day:**

I would refactor the data-fetching strategy for the board to fetch tasks **per column**, not in a single global query. Each `KanbanColumn` would independently call `useGetTasksQuery({ status: column.status._id, limit: 25, page })` with its own pagination cursor. I would add a **"Load more"** button at the bottom of each column to fetch the next page and append cards without replacing existing ones (infinite scroll pattern). Concretely, this requires:

1. Moving the `useGetTasksQuery` call from `KanbanBoard` down into each `KanbanColumn`, passing the column's `status._id` as a filter argument.
2. Using RTK Query's `serializeQueryArgs` and `merge` options to accumulate pages in the cache rather than replacing them on each fetch.
3. Adding a `loadMore` handler in `KanbanColumn` that increments the internal page counter and triggers the next fetch.
4. Displaying a **"X more tasks"** count badge below the last visible card so users know more results exist.

This change would make the board fully scalable to any number of tasks while keeping column rendering fast, independent, and consistent with the rest of the app's pagination strategy.
