import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const GYM_BASE = 'http://localhost:3001';

export type SubscriptionType = 'monthly' | 'yearly';

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  clientId: string;
  type: SubscriptionType;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ClientWithSubscriptions extends Client {
  subscriptions: Subscription[];
}

function gymHeaders(headers: Headers) {
  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

export const gymApi = createApi({
  reducerPath: 'gymApi',
  baseQuery: fetchBaseQuery({
    baseUrl: GYM_BASE,
    prepareHeaders: gymHeaders,
  }),
  tagTypes: ['MyProfile', 'Subscription', 'AdminClient'],
  endpoints: (build) => ({
    getMyProfile: build.query<Client | null, void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBQ) {
        const res = await fetchWithBQ({ url: '/clients/me', method: 'GET' });
        if (res.error && res.error.status === 404) return { data: null };
        if (res.error) return { error: res.error };
        return { data: res.data as Client };
      },
      providesTags: ['MyProfile'],
    }),

    createProfile: build.mutation<Client, Partial<Client>>({
      query: (body) => ({ url: '/clients/me', method: 'POST', body }),
      invalidatesTags: ['MyProfile'],
    }),

    updateProfile: build.mutation<Client, Partial<Client>>({
      query: (body) => ({ url: '/clients/me', method: 'PUT', body }),
      invalidatesTags: ['MyProfile'],
    }),

    getMySubscriptions: build.query<Subscription[], void>({
      query: () => '/subscriptions/my',
      providesTags: (result) =>
        result
          ? [
              { type: 'Subscription' as const, id: 'LIST' },
              ...result.map((s) => ({ type: 'Subscription' as const, id: s.id })),
            ]
          : [{ type: 'Subscription' as const, id: 'LIST' }],
    }),

    createSubscription: build.mutation<Subscription, { type: SubscriptionType; startDate: string }>({
      query: (body) => ({ url: '/subscriptions', method: 'POST', body }),
      invalidatesTags: [{ type: 'Subscription', id: 'LIST' }],
    }),

    updateSubscription: build.mutation<
      Subscription,
      { id: string; body: { type?: SubscriptionType; startDate?: string } }
    >({
      query: ({ id, body }) => ({ url: `/subscriptions/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Subscription', id: 'LIST' },
        { type: 'Subscription', id: arg.id },
      ],
    }),

    deleteSubscription: build.mutation<void, string>({
      query: (id) => ({ url: `/subscriptions/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Subscription', id: 'LIST' },
        { type: 'Subscription', id },
      ],
    }),

    getAdminClients: build.query<ClientWithSubscriptions[], void>({
      query: () => '/admin/clients',
      providesTags: (result) =>
        result
          ? [
              { type: 'AdminClient' as const, id: 'LIST' },
              ...result.map((c) => ({ type: 'AdminClient' as const, id: c.id })),
            ]
          : [{ type: 'AdminClient' as const, id: 'LIST' }],
    }),

    adminDeleteClient: build.mutation<void, string>({
      query: (id) => ({ url: `/admin/clients/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'AdminClient', id },
        { type: 'AdminClient', id: 'LIST' },
      ],
    }),

    adminCreateClient: build.mutation<Client, { userId: string; name: string; email: string; phone?: string }>({
      query: (body) => ({ url: '/admin/clients', method: 'POST', body }),
      invalidatesTags: [{ type: 'AdminClient', id: 'LIST' }],
    }),

    adminCreateSubscription: build.mutation<
      Subscription,
      { clientId: string; body: { type: SubscriptionType; startDate: string } }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/subscriptions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'AdminClient', id: arg.clientId },
        { type: 'AdminClient', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useGetMySubscriptionsQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useGetAdminClientsQuery,
  useAdminDeleteClientMutation,
  useAdminCreateClientMutation,
  useAdminCreateSubscriptionMutation,
} = gymApi;
