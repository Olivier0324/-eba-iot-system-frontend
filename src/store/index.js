import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { authSlice } from '../services/reducers/authReducer.js';
export const store = configureStore({
    reducer: {
        // reducers go here
        [api.reducerPath]: api.reducer,
        auth: authSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),


});

