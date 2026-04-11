// src/pages/dashboard/Settings.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { User, Bell, Moon, Sun, Mail, Save, Key } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

import {
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "../../services/api";
import { toast } from "react-toastify";

const inputClass =
  "w-full min-h-[2.5rem] px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-eco-500/35 dark:focus:ring-eco-400/25";

const inputReadOnlyClass =
  "w-full min-h-[2.5rem] px-4 py-2 rounded-xl border border-gray-200/80 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 cursor-not-allowed";

function Settings() {
  const user = useSelector((state) => state.auth.user);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const { data: notifPrefs, isLoading: prefsLoading } =
    useGetNotificationPreferencesQuery(undefined, { skip: !user });
  const [updateNotifPrefs, { isLoading: prefsSaving }] =
    useUpdateNotificationPreferencesMutation();

  useEffect(() => {
    if (!notifPrefs) return;
    setEmailNotifications(notifPrefs.emailNotifications !== false);
    setPushNotifications(notifPrefs.pushNotifications !== false);
  }, [notifPrefs]);

  const [profileData, setProfileData] = useState({
    username: user?.username || "",
  });

  useEffect(() => {
    setProfileData({ username: user?.username || "" });
  }, [user?.username]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // Email is account identity — only username is editable here.
      await updateProfile({ username: profileData.username.trim() }).unwrap();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your profile, password, and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-eco-600 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile information
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Username can be updated. Email is fixed for your account.
                </p>
              </div>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div>
                <label
                  htmlFor="settings-username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Username
                </label>
                <input
                  id="settings-username"
                  type="text"
                  autoComplete="username"
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ username: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="settings-email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                    aria-hidden
                  />
                  <input
                    id="settings-email"
                    type="email"
                    readOnly
                    disabled
                    value={user?.email || ""}
                    className={`${inputReadOnlyClass} pl-10`}
                    title="Email cannot be changed here"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  Email is not editable. Contact an administrator if you need to
                  change it.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Role
                </label>
                <input
                  type="text"
                  value={user?.role || "User"}
                  disabled
                  readOnly
                  className={inputReadOnlyClass}
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="inline-flex items-center justify-center gap-2 min-h-[2.5rem] px-6 py-2 rounded-xl bg-eco-600 text-white font-medium hover:bg-eco-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
              >
                <Save size={18} />
                {isUpdatingProfile ? "Saving…" : "Save profile"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <Key className="text-eco-600 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Change password
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Use a strong password you do not use elsewhere
                </p>
              </div>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Current password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm new password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center justify-center min-h-[2.5rem] px-6 py-2 rounded-xl bg-eco-600 text-white font-medium hover:bg-eco-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
              >
                {isChangingPassword ? "Updating…" : "Change password"}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              {isDark ? (
                <Moon className="text-eco-600 shrink-0" />
              ) : (
                <Sun className="text-eco-600 shrink-0" />
              )}
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appearance
              </h2>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-700 dark:text-gray-300">
                Dark mode
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                aria-pressed={isDark}
                className={`relative w-12 h-6 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 ${isDark ? "bg-eco-600" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${isDark ? "right-1" : "left-1"}`}
                />
              </button>
            </div>
          </div>

          {/* Notifications Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="text-eco-600 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Synced with your account on the server
                </p>
              </div>
            </div>
            {prefsLoading ? (
              <div className="py-8 flex justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-eco-500 border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="space-y-5 mt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Email notifications
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive alerts via email
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={prefsSaving}
                    onClick={async () => {
                      const next = !emailNotifications;
                      setEmailNotifications(next);
                      try {
                        await updateNotifPrefs({
                          emailNotifications: next,
                        }).unwrap();
                        toast.success("Preferences saved");
                      } catch {
                        setEmailNotifications(!next);
                        toast.error("Could not update email preference");
                      }
                    }}
                    aria-pressed={emailNotifications}
                    className={`relative w-12 h-6 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 disabled:opacity-50 ${emailNotifications ? "bg-eco-600" : "bg-gray-300 dark:bg-gray-600"}`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${emailNotifications ? "right-1" : "left-1"}`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Push notifications
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      In-app and device alerts
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={prefsSaving}
                    onClick={async () => {
                      const next = !pushNotifications;
                      setPushNotifications(next);
                      try {
                        await updateNotifPrefs({
                          pushNotifications: next,
                        }).unwrap();
                        toast.success("Preferences saved");
                      } catch {
                        setPushNotifications(!next);
                        toast.error("Could not update push preference");
                      }
                    }}
                    aria-pressed={pushNotifications}
                    className={`relative w-12 h-6 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 disabled:opacity-50 ${pushNotifications ? "bg-eco-600" : "bg-gray-300 dark:bg-gray-600"}`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${pushNotifications ? "right-1" : "left-1"}`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
