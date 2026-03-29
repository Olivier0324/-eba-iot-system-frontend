import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, setToken, setUser } from "../../services/reducers/authReducer";
import { useVerifyOTPMutation, useResendOTPMutation } from "../../services/api";
import { toast } from "react-toastify";
import { Loader2, RefreshCw } from "lucide-react";
import logo from "../../assets/eba_logo.svg";
import Logo from "../common/Logo";

function VerifyForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const email = useSelector((state) => state.auth.email);
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  useEffect(() => {
    console.log("Current email from Redux:", email);
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);

      setTimeout(() => {
        if (inputRefs.current[5]) {
          inputRefs.current[5].focus();
        }
      }, 0);
    } else {
      toast.error("Please paste a valid 6-digit code");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.some((digit) => digit === "")) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      const otpValue = otp.join("");
      console.log("Verifying OTP for email:", email);
      console.log("OTP value:", otpValue);

      const response = await verifyOTP({ email, otp: otpValue }).unwrap();

      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("Token:", response.data?.token);
      console.log("User:", response.data?.user);

      // Store token and user in Redux and localStorage
      if (response.data?.token) {
        dispatch(setToken({ token: response.data.token }));
        console.log("Token dispatched to Redux");
      } else {
        console.error("No token in response:", response);
      }

      if (response.data?.user) {
        dispatch(setUser({ user: response.data.user }));
        console.log("User dispatched to Redux");
      } else {
        console.error("No user in response:", response);
      }

      toast.success(response.message || "Verification successful!");

      // Small delay to ensure Redux state updates before navigation
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    } catch (error) {
      console.error("Verification error:", error);
      console.error("Error details:", error.data);
      const errorMessage =
        error.data?.message ||
        error.message ||
        "Verification failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await resendOTP({ email }).unwrap();
      console.log("Resend OTP response:", response);
      toast.success(response.message || "New OTP sent successfully!");
      setOtp(["", "", "", "", "", ""]);

      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 0);
    } catch (error) {
      console.error("Resend OTP error:", error);
      const errorMessage =
        error.data?.message ||
        error.message ||
        "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-eco-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-eco-100 dark:border-gray-700">
        <div className="text-center">
          <div className="flex justify-center">
                    <Logo fn={() => navigateTo("/")} />
                  </div>
          <h2 className="mt-2 text-3xl font-extrabold text-eco-900 dark:text-eco-100">
            Verify Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a 6-digit code to your email.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-eco-800 dark:text-eco-200 mb-4"
            >
              Enter Verification Code
            </label>
            <div className="flex justify-between space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResending}
              className="text-sm font-medium text-eco-600 hover:text-eco-500 dark:text-eco-400 dark:hover:text-eco-300 transition-colors flex items-center"
            >
              {isResending ? (
                <>
                  <Loader2 className="animate-spin mr-1 h-4 w-4" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Didn't receive code? Resend OTP
                </>
              )}
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isVerifying || isResending}
              className="flex-1 flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || isResending}
              className="flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-eco-600 hover:bg-eco-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-eco-200 dark:shadow-none"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyForm;
