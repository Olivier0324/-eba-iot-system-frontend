// src/services/api/index.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Sensor', 'Report', 'Alert', 'Notification', 'Device'],
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
        }),

        // ==================== SENSOR ENDPOINTS ====================
        getAllSensorData: builder.query({
            query: () => '/sensor/data',
            transformResponse: (response) => response.data || response,
            providesTags: ['Sensor'],
        }),
        getSensorStats: builder.query({
            query: () => '/sensor/stats',
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
                url: '/alerts/alerts',
                params,
            }),
            transformResponse: (response) => response.data || response,
            providesTags: ['Alert'],
        }),
        getActiveAlerts: builder.query({
            query: () => '/alerts/alerts/active',
            transformResponse: (response) => response.data || response,
            providesTags: ['Alert'],
        }),
        getAlertById: builder.query({
            query: (id) => `/alerts/alerts/${id}`,
            transformResponse: (response) => response.data || response,
            providesTags: ['Alert'],
        }),
        resolveAlert: builder.mutation({
            query: (id) => ({
                url: `/alerts/alerts/${id}/resolve`,
                method: 'PUT',
            }),
            invalidatesTags: ['Alert'],
        }),
        acknowledgeAlert: builder.mutation({
            query: (id) => ({
                url: `/alerts/alerts/${id}/acknowledge`,
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

        // ==================== NOTIFICATION ENDPOINTS ====================
        getNotifications: builder.query({
            query: (params) => ({
                url: '/alerts/notifications',
                params,
            }),
            transformResponse: (response) => response.data || response,
            providesTags: ['Notification'],
        }),
        markNotificationAsRead: builder.mutation({
            query: (id) => ({
                url: `/alerts/notifications/${id}/read`,
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),
        markAllNotificationsAsRead: builder.mutation({
            query: () => ({
                url: '/alerts/notifications/read-all',
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),
        deleteNotification: builder.mutation({
            query: (id) => ({
                url: `/alerts/notifications/${id}`,
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
    }),
});

// ==================== HOOKS ====================
// src/services/api/index.js - Add these to your exports
export const {
    // Auth hooks
    useLoginMutation,
    useVerifyOTPMutation,
    useLogoutMutation,
    useResendOTPMutation,
    useGetCurrentUserQuery,
    useChangePasswordMutation,
    useUpdateProfileMutation,
    // Sensor hooks
    useGetAllSensorDataQuery,
    useGetSensorStatsQuery,
    // Report hooks
    useGenerateReportMutation,
    useGetReportsQuery,
    useGetReportByIdQuery,
    useDeleteReportMutation,
    // Alert hooks
    useGetAlertsQuery,
    useGetActiveAlertsQuery,
    useGetAlertByIdQuery,
    useResolveAlertMutation,
    useAcknowledgeAlertMutation,
    useGetAlertStatisticsQuery,
    // Notification hooks
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useDeleteNotificationMutation,
    // Device Control hooks
    useGetDeviceStatusQuery,
    useSetIntervalMutation,
    useGetIntervalPresetsQuery,
} = api;