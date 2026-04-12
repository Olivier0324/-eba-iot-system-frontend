import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../services/reducers/authReducer';
import { useLogoutMutation } from '../services/api';
import { toast } from 'react-toastify';
import { LogOut, AlertTriangle } from 'lucide-react';
import ThemeToggleButton from './common/ThemeToggleButton.jsx';

function AccountInactive() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [userLogout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      // Logout on server/database
      await userLogout().unwrap();
      
      // Clear Redux state and localStorage
      dispatch(logout());
      
      // Show success message
      toast.success('You have been logged out successfully');
      
      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error) {
      // Even if server logout fails, clear local state
      dispatch(logout());
      
      const errorMessage = error?.data?.message || error?.message || 'Logout failed. Please try again.';
      toast.error(errorMessage);
      
      // Navigate to login page
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-eco-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggleButton />
      </div>
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-eco-100 dark:border-gray-700">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center mb-4">
            <div className="h-full w-full rounded-full bg-eco-100 dark:bg-eco-900/30 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-eco-900 dark:text-eco-100">
            Account Inactive
          </h2>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  Your account is currently inactive. Please contact the administrator to activate your account.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You need to logout and contact your administrator to activate your account.
            </p>
          </div>

          {/* Logout Button */}
          <div>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-eco-600 hover:bg-eco-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-eco-200 dark:shadow-none"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountInactive;