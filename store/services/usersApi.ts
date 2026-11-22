import { baseApi } from "./baseApi";

export interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UserItem[], { isActive?: boolean | "all" } | void>({
      query: (params) => {
        let url = "/users";
        if (params && params.isActive !== undefined) {
          url += `?isActive=${params.isActive}`;
        }
        return url;
      },
      transformResponse: (response: { success: boolean; data: UserItem[] }) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Users" as const, id: _id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    getUserById: builder.query<UserItem, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (response: { success: boolean; data: UserItem }) =>
        response.data,
      providesTags: (_result, _error, id) => [{ type: "Users", id }],
    }),

    createUser: builder.mutation<UserItem, CreateUserPayload>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      transformResponse: (response: { success: boolean; data: UserItem }) =>
        response.data,
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    updateUser: builder.mutation<UserItem, { id: string; data: UpdateUserPayload }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: UserItem }) =>
        response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        success: boolean;
        data: { message: string };
      }) => response.data,
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
