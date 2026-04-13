// src/services/api/index.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token || localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Sensor', 'Report', 'Alert', 'Notification', 'Device', 'Blog', 'Research', 'Contact', 'User'],
    endpoints: (builder) => ({
        // ==================== AUTH ENDPOINTS ====================
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        verifyOTP: builder.mutation({
            query: (credentials) => ({
                url: '/auth/verify-otp',
                method: 'POST',
                body: credentials,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
        }),
        resendOTP: builder.mutation({
            query: (credentials) => ({
                url: '/auth/resend-otp',
                method: 'POST',
                body: credentials,
            }),
        }),
        getCurrentUser: builder.query({
            query: () => '/auth/me',
            transformResponse: (response) => response.data || response,
            providesTags: ['User'],
        }),
        changePassword: builder.mutation({
            query: (data) => ({
                url: '/auth/change-password',
                method: 'PUT',
                body: data,
            }),
        }),
        updateProfile: builder.mutation({
            query: (data) => ({
                url: '/auth/profile',
                method: 'PUT',
                body: data,
            }),
            // Unwrap to inner payload so callers get user/doc consistently (same as verify/me patterns).
            transformResponse: (response) => response?.data ?? response,
            invalidatesTags: ['User'],
        }),

        // ==================== SENSOR ENDPOINTS ====================
        // Optional query params (e.g. { limit }) for large exports; omit for default list.
        getAllSensorData: builder.query({
            query: (arg) => {
                const params =
                    arg && typeof arg === 'object' && Object.keys(arg).length > 0
                        ? arg
                        : undefined;
                return params
                    ? { url: '/sensor/data', params }
                    : '/sensor/data';
            },
            transformResponse: (response) => response.data || response,
            providesTags: ['Sensor'],
        }),
        getSensorStats: builder.query({
            query: () => '/sensor/stats',
            transformResponse: (response) => response.data || response,
            providesTags: ['Sensor'],
        }),
        getLatestData: builder.query({
            query: () => '/sensor/latest',
            transformResponse: (response) => response.data || response,
            providesTags: ['Sensor'],
        }),

        // ==================== REPORT ENDPOINTS ====================
        generateReport: builder.mutation({
            query: (params) => ({
                url: '/reports/generate',
                method: 'GET',
                params,
            }),
            invalidatesTags: ['Report'],
        }),
        getReports: builder.query({
            query: (params) => ({
                url: '/reports',
                params,
            }),
            transformResponse: (response) => response.reports || response,
            providesTags: ['Report'],
        }),
        getReportById: builder.query({
            query: (id) => `/reports/${id}`,
            transformResponse: (response) => response.report || response,
            providesTags: ['Report'],
        }),
        deleteReport: builder.mutation({
            query: (id) => ({
                url: `/reports/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Report'],
        }),

        // ==================== ALERT ENDPOINTS ====================
        getAlerts: builder.query({
            query: (params) => ({
                url: '/alerts',
                params,
            }),
            transformResponse: (response) => response.data || response,
            providesTags: ['Alert'],
        }),
        getActiveAlerts: builder.query({
            query: () => '/alerts/active',
            transformResponse: (response) => response.data || response,
            providesTags: ['Alert'],
        }),
        getAlertById: builder.query({
            query: (id) => `/alerts/${id}`,
            transformResponse: (response) => response.data || response,
            providesTags: ['Alert'],
        }),
        resolveAlert: builder.mutation({
            query: (id) => ({
                url: `/alerts/${id}/resolve`,
                method: 'PUT',
            }),
            invalidatesTags: ['Alert'],
        }),
        acknowledgeAlert: builder.mutation({
            query: (id) => ({
                url: `/alerts/${id}/acknowledge`,
                method: 'PUT',
            }),
            invalidatesTags: ['Alert'],
        }),
        getAlertStatistics: builder.query({
            query: (params) => ({
                url: '/alerts/statistics',
                params,
            }),
            transformResponse: (response) => response.data || response,
            providesTags: ['Alert'],
        }),

        // ==================== NOTIFICATION ENDPOINTS (matches /notifications routes) ====================
        getNotifications: builder.query({
            query: (params = {}) => ({
                url: '/notifications',
                params: {
                    page: params.page ?? 1,
                    limit: params.limit ?? 20,
                    ...(params.isRead !== undefined && params.isRead !== ''
                        ? { isRead: params.isRead }
                        : {}),
                    ...(params.type ? { type: params.type } : {}),
                    ...(params.priority ? { priority: params.priority } : {}),
                },
            }),
            transformResponse: (response) => ({
                list: response?.data ?? [],
                pagination: response?.pagination,
                unreadCount: response?.unreadCount ?? 0,
            }),
            providesTags: ['Notification'],
        }),
        getNotificationPreferences: builder.query({
            query: () => '/notifications/preferences',
            transformResponse: (response) => response?.data ?? response,
            providesTags: ['Notification'],
        }),
        updateNotificationPreferences: builder.mutation({
            query: (body) => ({
                url: '/notifications/preferences',
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Notification'],
        }),
        markNotificationAsRead: builder.mutation({
            query: (id) => ({
                url: `/notifications/${encodeURIComponent(String(id))}/read`,
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),
        markAllNotificationsAsRead: builder.mutation({
            query: () => ({
                url: '/notifications/read-all',
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),
        deleteNotification: builder.mutation({
            query: (id) => ({
                url: `/notifications/${encodeURIComponent(String(id))}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),

        // ==================== DEVICE CONTROL ENDPOINTS ====================
        getDeviceStatus: builder.query({
            query: () => '/control/status',
            transformResponse: (response) => response.data || response,
            providesTags: ['Device'],
        }),
        setInterval: builder.mutation({
            query: (data) => ({
                url: '/control/interval',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Device'],
        }),
        getIntervalPresets: builder.query({
            query: () => '/control/presets',
            transformResponse: (response) => response.data || response,
            providesTags: ['Device'],
        }),

        // ==================== BLOG ENDPOINTS ====================
        // Public blog endpoints
        getAllBlogs: builder.query({
            query: (params) => ({
                url: '/blog',
                params,
            }),
            transformResponse: (response) => response.data || response,
            providesTags: ['Blog'],
        }),
        getBlogBySlug: builder.query({
            query: (slug) => `/blog/${slug}`,
            transformResponse: (response) => response.data || response,
            providesTags: ['Blog'],
        }),
        getBlogCategories: builder.query({
            query: () => '/blog/categories',
            transformResponse: (response) => response.data || response,
            providesTags: ['Blog'],
        }),

        // Admin blog endpoints
        createBlog: builder.mutation({
            query: (data) => ({
                url: '/blog',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Blog'],
        }),
        getBlogById: builder.query({
            query: (id) => `/blog/admin/${id}`,
            transformResponse: (response) => response.data || response,
            providesTags: ['Blog'],
        }),
        updateBlog: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/blog/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Blog'],
        }),
        deleteBlog: builder.mutation({
            query: (id) => ({
                url: `/blog/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Blog'],
        }),
        // ==================== USER MANAGEMENT ENDPOINTS ====================
        getAllUsers: builder.query({
            query: (params) => ({
                url: '/users',
                params,
            }),
            providesTags: ['User'],
        }),
        getUserById: builder.query({
            query: (id) => `/users/${id}`,
            providesTags: ['User'],
        }),
        createUser: builder.mutation({
            query: (data) => ({
                url: '/users',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        updateUser: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/users/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
        toggleUserStatus: builder.mutation({
            query: ({ id, isActive }) => ({
                url: `/users/${id}/activate`,
                method: 'PUT',
                body: { isActive },
            }),
            invalidatesTags: ['User'],
        }),
        changeUserRole: builder.mutation({
            query: ({ id, role }) => ({
                url: `/users/${id}/role`,
                method: 'PUT',
                body: { role },
            }),
            invalidatesTags: ['User'],
        }),
        getUserStats: builder.query({
            query: () => '/users/stats',
            providesTags: ['User'],
        }),

        // ==================== CONTACT MESSAGE ENDPOINTS ====================
        // Public contact endpoint
        submitContactMessage: builder.mutation({
            query: (data) => ({
                url: '/contact',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Contact'],
        }),

        // Admin contact endpoints
        getAllContactMessages: builder.query({
            query: (params) => ({
                url: '/contact',
                params,
            }),
            providesTags: ['Contact'],
        }),

        getContactMessageStats: builder.query({
            query: () => '/contact/stats',
            providesTags: ['Contact'],
        }),

        getContactMessageById: builder.query({
            query: (id) => `/contact/${id}`,
            providesTags: ['Contact'],
        }),

        replyToContactMessage: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/contact/${id}/reply`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Contact'],
        }),

        resolveContactMessage: builder.mutation({
            query: (id) => ({
                url: `/contact/${id}/resolve`,
                method: 'PUT',
            }),
            invalidatesTags: ['Contact'],
        }),

        deleteContactMessage: builder.mutation({
            query: (id) => ({
                url: `/contact/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Contact'],
        }),
    }),
});

// ==================== HOOKS ====================
// Auth hooks
export const {
    useLoginMutation,
    useVerifyOTPMutation,
    useLogoutMutation,
    useResendOTPMutation,
    useGetCurrentUserQuery,
    useChangePasswordMutation,
    useUpdateProfileMutation,
} = api;

// Sensor hooks
export const {
    useGetAllSensorDataQuery,
    useLazyGetAllSensorDataQuery,
    useGetSensorStatsQuery,
    useGetLatestDataQuery,
} = api;

// Report hooks
export const {
    useGenerateReportMutation,
    useGetReportsQuery,
    useGetReportByIdQuery,
    useDeleteReportMutation,
} = api;

// Alert hooks
export const {
    useGetAlertsQuery,
    useGetActiveAlertsQuery,
    useGetAlertByIdQuery,
    useResolveAlertMutation,
    useAcknowledgeAlertMutation,
    useGetAlertStatisticsQuery,
} = api;

// Notification hooks
export const {
    useGetNotificationsQuery,
    useGetNotificationPreferencesQuery,
    useUpdateNotificationPreferencesMutation,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useDeleteNotificationMutation,
} = api;

// Device Control hooks
export const {
    useGetDeviceStatusQuery,
    useSetIntervalMutation,
    useGetIntervalPresetsQuery,
} = api;

// Blog hooks
export const {
    useGetAllBlogsQuery,
    useLazyGetBlogByIdQuery,
    useGetBlogBySlugQuery,
    useGetBlogCategoriesQuery,
    useCreateBlogMutation,
    useGetBlogByIdQuery,
    useUpdateBlogMutation,
    useDeleteBlogMutation,
} = api;

// ==================== CONTACT MESSAGE HOOKS ====================
export const {
    useSubmitContactMessageMutation,
    useGetAllContactMessagesQuery,
    useGetContactMessageStatsQuery,
    useGetContactMessageByIdQuery,
    useReplyToContactMessageMutation,
    useResolveContactMessageMutation,
    useDeleteContactMessageMutation,
} = api;
// Add to hooks exports:
export const {
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useToggleUserStatusMutation,
    useChangeUserRoleMutation,
    useGetUserStatsQuery,
} = api;