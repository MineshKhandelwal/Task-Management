import { baseApi } from "./baseApi";
import { PaginationMeta } from "@/lib/utils/apiResponse";

export interface TaskItem {
  _id: string;
  title: string;
  description: string;
  status: {
    _id: string;
    name: string;
    color: string;
    isCompletion: boolean;
  };
  priority: "low" | "medium" | "high";
  dueDate: string | null;
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
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListResponse {
  tasks: TaskItem[];
  meta: PaginationMeta;
}

export interface TaskFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: "low" | "medium" | "high";
  assignedTo?: string;
  createdBy?: string;
  dueBefore?: string;
  dueAfter?: string;
  sortBy?: "createdAt" | "updatedAt" | "dueDate" | "priority" | "title";
  sortOrder?: "asc" | "desc";
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string | null;
  assignedTo?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string | null;
  assignedTo?: string | null;
}

export interface DashboardStatsResponse {
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
  recentTasks: TaskItem[];
}

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<TaskListResponse, TaskFilterParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, String(value));
            }
          });
        }
        const qs = queryParams.toString();
        return `/tasks${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: {
        success: boolean;
        data: TaskItem[];
        meta: PaginationMeta;
      }) => ({
        tasks: response.data,
        meta: response.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.tasks.map(({ _id }) => ({
                type: "Tasks" as const,
                id: _id,
              })),
              { type: "Tasks", id: "LIST" },
            ]
          : [{ type: "Tasks", id: "LIST" }],
    }),

    getTaskById: builder.query<TaskItem, string>({
      query: (id) => `/tasks/${id}`,
      transformResponse: (response: { success: boolean; data: TaskItem }) =>
        response.data,
      providesTags: (_result, _error, id) => [{ type: "Tasks", id }],
    }),

    getDashboardStats: builder.query<DashboardStatsResponse, void>({
      query: () => "/tasks/stats",
      transformResponse: (response: {
        success: boolean;
        data: DashboardStatsResponse;
      }) => response.data,
      providesTags: ["TaskStats"],
    }),

    createTask: builder.mutation<TaskItem, CreateTaskPayload>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      transformResponse: (response: { success: boolean; data: TaskItem }) =>
        response.data,
      invalidatesTags: [{ type: "Tasks", id: "LIST" }, "TaskStats"],
    }),

    updateTask: builder.mutation<
      TaskItem,
      { id: string; data: UpdateTaskPayload }
    >({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: TaskItem }) =>
        response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Tasks", id },
        { type: "Tasks", id: "LIST" },
        "TaskStats",
      ],
    }),

    deleteTask: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        success: boolean;
        data: { message: string };
      }) => response.data,
      invalidatesTags: [{ type: "Tasks", id: "LIST" }, "TaskStats"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useGetDashboardStatsQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
