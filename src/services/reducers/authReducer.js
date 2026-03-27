// services/reducers/authReducer.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
    token: localStorage.getItem("token") || null,
    email: localStorage.getItem("email") || null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setEmail: (state, action) => {
            state.email = action.payload.email;
            localStorage.setItem("email", state.email);
            console.log("Email saved:", state.email);
        },
        setToken: (state, action) => {
            state.token = action.payload.token;
            localStorage.setItem("token", state.token);
            console.log("Token saved:", state.token);
        },
        setUser: (state, action) => {
            state.user = action.payload.user;
            localStorage.setItem("user", JSON.stringify(state.user));
            console.log("User saved:", state.user);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.email = null;
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            console.log("Logged out, storage cleared");
        },
    },
});

export const {
    setEmail,
    setToken,
    setUser,
    logout,
} = authSlice.actions;

export default authSlice.reducer;