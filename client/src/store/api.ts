import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface AuthUser { username: string }

export interface DocSummary {
  id: string
  title: string
  version: number
  updatedAt: string
  createdAt: string
}

export interface DocDetail extends DocSummary {
  content: string | null
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api', credentials: 'include' }),
  tagTypes: ['Me', 'Doc'],
  endpoints: (builder) => ({

    // ── Auth ────────────────────────────────────────────
    getMe: builder.query<AuthUser, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),

    login: builder.mutation<AuthUser, { username: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Me'],
    }),

    register: builder.mutation<AuthUser, { username: string; password: string }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['Me'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Me', 'Doc'],
    }),

    // ── Documents ───────────────────────────────────────
    listDocs: builder.query<DocSummary[], void>({
      query: () => '/docs',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Doc' as const, id })), 'Doc']
          : ['Doc'],
    }),

    getDoc: builder.query<DocDetail, string>({
      query: (id) => `/docs/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Doc', id }],
    }),

    createDoc: builder.mutation<{ id: string; title: string; version: number }, string>({
      query: (title) => ({ url: '/docs', method: 'POST', body: { title } }),
      invalidatesTags: ['Doc'],
    }),

    renameDoc: builder.mutation<DocSummary, { id: string; title: string }>({
      query: ({ id, title }) => ({ url: `/docs/${id}`, method: 'PATCH', body: { title } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Doc', id }, 'Doc'],
    }),

    deleteDoc: builder.mutation<void, string>({
      query: (id) => ({ url: `/docs/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Doc', id }, 'Doc'],
    }),
  }),
})

export const {
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useListDocsQuery,
  useGetDocQuery,
  useCreateDocMutation,
  useRenameDocMutation,
  useDeleteDocMutation,
} = apiSlice
