// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// Components
import ProtectedRoutes from "./components/ProtectedRoutes";
import LoginForm from "./components/forms/LoginForm";
import VerifyForm from "./components/forms/VerifyForm";
import Dashboard from "./components/Dashboard";
import AccountInactive from "./components/AccountInactive";
import LandingPage from "./pages/LandingPage";

// Dashboard Pages
import Overview from "./pages/dashboard/Overview";
import Sensors from "./pages/dashboard/Sensors";
import Reports from "./pages/dashboard/Reports";
import Alerts from "./pages/dashboard/Alerts";
import Analytics from "./pages/dashboard/Analytics";
import ControlPanel from "./pages/dashboard/ControlPanel";
import Settings from "./pages/dashboard/Settings";
// Resource Pages
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost"; // Import the new component
import Research from "./pages/Research";
import Support from "./pages/Support";
//admin only routes
import ContactMessages from "./pages/dashboard/admin/ContactMessages";
import BlogManagement from "./pages/dashboard/admin/BlogManagement";
import ResearchManagement from "./pages/dashboard/admin/ResearchManagement";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/verify" element={<VerifyForm />} />
        <Route path="/account-inactive" element={<AccountInactive />} />

        {/* Resource Routes */}
        <Route path="/blog" element={<Blog />} />
        {/* New Route for individual blog posts */}
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/research" element={<Research />} />
        <Route path="/support" element={<Support />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Overview />} />
            <Route path="sensors" element={<Sensors />} />
            <Route path="reports" element={<Reports />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="control" element={<ControlPanel />} />
            <Route path="settings" element={<Settings />} />
            {/* Admin Only Routes */}
            <Route
              path="/dashboard/admin/messages"
              element={<ContactMessages />}
            />
            <Route path="/dashboard/admin/blog" element={<BlogManagement />} />
            <Route
              path="/dashboard/admin/research"
              element={<ResearchManagement />}
            />
          </Route>
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
