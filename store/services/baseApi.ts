import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    prepareHeaders: (headers, { getState }) => {
      // Inject X-User-Id from currentUserSlice if available
      const state = getState() as {
        currentUser?: { user?: { id?: string } | null };
      };
      const userId = state.currentUser?.user?.id;
      if (userId) {
        headers.set("x-user-id", userId);
      }
      return headers;
    },
  }),
  tagTypes: ["Tasks", "TaskStats", "Users", "Statuses"],
  endpoints: () => ({}),
});
