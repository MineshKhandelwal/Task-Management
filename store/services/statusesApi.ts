import { baseApi } from "./baseApi";

export interface StatusItem {
  _id: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
  isCompletion: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStatusPayload {
  name: string;
  color: string;
  order: number;
  isDefault?: boolean;
  isCompletion?: boolean;
}

export interface UpdateStatusPayload {
  name?: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
  isCompletion?: boolean;
}

export interface DeleteStatusResponse {
  message: string;
  reassignedCount: number;
}

export interface StatusUsageResponse {
  taskCount: number;
}

export const statusesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStatuses: builder.query<StatusItem[], void>({
      query: () => "/statuses",
      transformResponse: (response: { success: boolean; data: StatusItem[] }) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Statuses" as const,
                id: _id,
              })),
              { type: "Statuses", id: "LIST" },
            ]
          : [{ type: "Statuses", id: "LIST" }],
    }),

    getStatusById: builder.query<StatusItem, string>({
      query: (id) => `/statuses/${id}`,
      transformResponse: (response: { success: boolean; data: StatusItem }) =>
        response.data,
      providesTags: (_result, _error, id) => [{ type: "Statuses", id }],
    }),

    getStatusUsage: builder.query<StatusUsageResponse, string>({
      query: (id) => `/statuses/${id}/usage`,
      transformResponse: (response: {
        success: boolean;
        data: StatusUsageResponse;
      }) => response.data,
    }),

    createStatus: builder.mutation<StatusItem, CreateStatusPayload>({
      query: (body) => ({
        url: "/statuses",
        method: "POST",
        body,
      }),
      transformResponse: (response: { success: boolean; data: StatusItem }) =>
        response.data,
      invalidatesTags: [{ type: "Statuses", id: "LIST" }],
    }),

    updateStatus: builder.mutation<
      StatusItem,
      { id: string; data: UpdateStatusPayload }
    >({
      query: ({ id, data }) => ({
        url: `/statuses/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: StatusItem }) =>
        response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Statuses", id },
        { type: "Statuses", id: "LIST" },
        { type: "Tasks", id: "LIST" },
        "TaskStats",
      ],
    }),

    deleteStatus: builder.mutation<
      DeleteStatusResponse,
      { id: string; reassignTo?: string }
    >({
      query: ({ id, reassignTo }) => {
        let url = `/statuses/${id}`;
        if (reassignTo) {
          url += `?reassignTo=${encodeURIComponent(reassignTo)}`;
        }
        return {
          url,
          method: "DELETE",
        };
      },
      transformResponse: (response: {
        success: boolean;
        data: DeleteStatusResponse;
      }) => response.data,
      invalidatesTags: [
        { type: "Statuses", id: "LIST" },
        { type: "Tasks", id: "LIST" },
        "TaskStats",
      ],
    }),
  }),
});

export const {
  useGetStatusesQuery,
  useGetStatusByIdQuery,
  useGetStatusUsageQuery,
  useCreateStatusMutation,
  useUpdateStatusMutation,
  useDeleteStatusMutation,
} = statusesApi;
