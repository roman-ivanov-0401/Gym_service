import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User } from './authSlice';

const AUTH_BASE = 'http://localhost:3000';

function authHeaders(headers: Headers) {
  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

export interface LoginResponse {
  success: boolean;
  data: { accessToken: string; refreshToken: string };
}

export interface MeResponse {
  success?: boolean;
  data: User;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: AUTH_BASE,
    prepareHeaders: authHeaders,
  }),
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: build.mutation<unknown, { name: string; email: string; password: string; role: string }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    refresh: build.mutation<LoginResponse, { refreshToken: string }>({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    getMe: build.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (r: MeResponse) => r.data,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshMutation,
  useLogoutMutation,
  useLazyGetMeQuery,
} = authApi;
