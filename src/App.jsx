// src/App.jsx
import React from "react";
import {Routes, Route } from "react-router-dom";

// Components
import ProtectedRoutes from "./components/ProtectedRoutes";
import LoginForm from "./components/forms/LoginForm";
import VerifyForm from "./components/forms/VerifyForm";
import Dashboard from "./components/Dashboard";
import AccountInactive from "./components/AccountInactive";

// Dashboard Pages
import Overview from "./pages/dashboard/Overview";
import Sensors from "./pages/dashboard/Sensors";
import Reports from "./pages/dashboard/Reports";
import Alerts from "./pages/dashboard/Alerts";
import Analytics from "./pages/dashboard/Analytics";
import ControlPanel from "./pages/dashboard/ControlPanel";
import Settings from "./pages/dashboard/Settings";

function App() {
  return (
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/verify" element={<VerifyForm />} />
          <Route path="/account-inactive" element={<AccountInactive />} />

          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Overview />} />
              <Route path="sensors" element={<Sensors />} />
              <Route path="reports" element={<Reports />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="control" element={<ControlPanel />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
    
  );
}

export default App;
