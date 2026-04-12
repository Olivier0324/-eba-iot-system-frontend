import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setEmail } from "../../services/reducers/authReducer.js";
import { EyeClosed, Eye, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useLoginMutation } from "../../services/api/index.js";
import Logo from "../common/Logo.jsx";
import ThemeToggleButton from "../common/ThemeToggleButton.jsx";

function LoginForm() {
  const [loginUser, { isLoading: isMutationLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  //navigate to home page
   const navigateTo = (path) => {
     navigate(path);
   };

  // State for form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!formData.email || !formData.password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    try {
      // Call the login API
      const response = await loginUser(formData).unwrap();
      
      // Extract user data from response
      const userData = {
        user: response.user || null,
        token: response.token || null,
        email: response.email || formData.email // Use the email from form if not in response
      };
      
      // Dispatch login action to save to Redux and localStorage
      dispatch(setEmail(userData));
      
      // Show success message from server or default
      toast.success(response.message || "Login successful! Redirecting to verification...");

      // Redirect to verification page after successful login
      navigate("/verify", { replace: true });
    } catch (error) {
      // Extract error message from server response
      const errorMessage = error.data?.message || error.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-eco-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggleButton />
      </div>
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-eco-100 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-center">
          <Logo fn={() => navigateTo("/")} />
        </div>
        <div className="text-center">
          <h2 className=" text-3xl font-extrabold text-eco-900 dark:text-eco-100">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access your M&E Dashboard
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-eco-800 dark:text-eco-200 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700"
                placeholder="name@organization.org"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-eco-800 dark:text-eco-200 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700"
                  placeholder="••••••••"
                />
                {/* Toggle Password Visibility Button */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-eco-600 dark:hover:text-eco-400 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeClosed className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isMutationLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-eco-600 hover:bg-eco-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-eco-200 dark:shadow-none"
            >
              {isMutationLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
