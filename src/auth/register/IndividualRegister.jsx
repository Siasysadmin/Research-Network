// ============================================
// INDIVIDUAL REGISTRATION - WITH OTP VERIFY FLOW
// ============================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import API_CONFIG from "../../config/api.config";

const IndividualRegister = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("formData");
    return savedData
      ? JSON.parse(savedData)
      : {
          fullName: "",
          email: "",
          country: "",
          state: "",
          city: "",
          pincode: "",
          password: "",
          confirmPassword: "",
          agreeTerms: false,
        };
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // ── OTP flow states ──
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [registeredUserData, setRegisteredUserData] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "pincode") {
      const numbersOnly = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: numbersOnly }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Toggle password visibility
  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!formData.country.trim()) errors.country = "Country is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      errors.pincode = "Please enter a valid 6-digit pincode";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!formData.agreeTerms) errors.agreeTerms = "You must agree to the terms";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  //sync Common User Api start vijay
  const syncCommonUserApi = async (userId) => {
    try {
      const commonUserPayload = {
        name: formData.fullName,
        email: formData.email,
        mobile: "",
        address: "",
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        age: null,
        category: "Individual",
        platform: "RESEARCH_NETWORK",
        platform_user_id: String(userId || formData.email),
      };

      const commonResponse = await fetch(
        "https://common-users.onrender.com/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-api-key": "beej_bhandar_common_secret_123",
          },
          body: JSON.stringify(commonUserPayload),
        },
      );

      const commonData = await commonResponse.json();

      if (!commonResponse.ok) {
        console.error("Common User API Sync Failed:", commonData);
      }

      return commonData;
    } catch (error) {
      console.error("Common User API Error:", error);
      return null;
    }
  };
  //sync Common User Api end vijay

  // ── REGISTER API → on success, open OTP modal ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const requestData = {
        user_type: "individual",
        name: formData.fullName,
        email: formData.email,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        userId: formData.userId,
      };

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/auth/register-individual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestData),
        },
      );

      const data = await response.json();

      if (
        response.ok &&
        (data.status === true ||
          data.status === "success" ||
          data.message?.toLowerCase().includes("success"))
      ) {
        // Store response. No localStorage write yet — OTP pending.
        setRegisteredUserData(data);
        setOtp("");
        setShowOtpModal(true);
        toast.success("OTP sent to your email");
      } else if (
        data.message?.toLowerCase().includes("email already exists") ||
        data.message?.toLowerCase().includes("already registered")
      ) {
        setFieldErrors({
          email: "This email is already registered. Please login.",
        });
      } else {
        toast.error(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Verify OTP → write localStorage, sync common user, navigate ──
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/auth/register/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: formData.email, otp }),
        },
      );
      const data = await res.json();

      if (
        res.ok &&
        (data.status === true ||
          data.status === "success" ||
          data.message?.toLowerCase().includes("success") ||
          data.message?.toLowerCase().includes("verified"))
      ) {
        const reg = registeredUserData || {};

        // sync common user — moved here from handleSubmit
        await syncCommonUserApi(reg?.user_id || reg?.id || reg?.user?.id);

        // token can come from register or verify-otp
        if (reg.token || data.token) {
          localStorage.setItem("token", reg.token || data.token);
        }
        localStorage.setItem("user_type", "individual");
        localStorage.setItem("isLoggedIn", "true");

        const userData = {
          id: reg?.user_id || data?.user_id || "",
          user_id: reg?.user_id || data?.user_id || "",
          name: formData.fullName,
          email: formData.email,
          user_type: "individual",
          country: formData.country,
          state: formData.state,
          city: formData.city,
          pincode: formData.pincode,
          registration_id: reg?.registration_id || data?.registration_id || "",
        };
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("user_id", reg?.user_id || data?.user_id || "");
        localStorage.setItem("userEmail", formData.email);

        localStorage.removeItem("formData");

        toast.success("Verified! Welcome aboard.");
        setShowOtpModal(false);

        setTimeout(() => {
          navigate("/application-approved", {
            state: { userType: "individual", email: formData.email },
          });
        }, 400);
      } else {
        toast.error(data.message || "Invalid OTP. Try again.");
      }
    } catch (err) {
      toast.error("Network error verifying OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Resend OTP ──
  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/auth/resend-registration-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        },
      );
      const data = await res.json();

      if (
        res.ok &&
        (data.status === true ||
          data.status === "success" ||
          data.message?.toLowerCase().includes("success") ||
          data.message?.toLowerCase().includes("sent"))
      ) {
        toast.success("OTP resent to your email");
        setOtp("");
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error("Network error. Try again.");
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  // UI Classes
  const inputClass =
    "w-full bg-[#f1f5f9] dark:bg-slate-950/70 border border-gray-300 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/30 transition-all text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600";
  const errorInputClass =
    "border-red-500 focus:border-red-500 focus:ring-red-500/30";
  const errorMessageClass =
    "text-red-500 text-xs mt-1 ml-1 flex items-start gap-1";

  return (
    <div className="min-h-screen relative overflow-y-auto bg-white text-slate-900 dark:bg-black dark:text-white font-sans">
      {/* Material Icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0,1"
        rel="stylesheet"
      />

      {/* Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-50"
        style={{
          backgroundImage: `radial-gradient(#ffffff08 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <main className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-[480px]">
          <div className="bg-white/70 dark:bg-slate-900/40  backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-10 shadow-[0_0_50px_rgba(0,255,136,0.1)]">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight mb-2">
                Create Your Account
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Start your journey as individual researcher
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name Field */}
              <div className="space-y-1.5 mb-4">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                    person
                  </span>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`${inputClass} ${fieldErrors.fullName ? errorInputClass : ""}`}
                    placeholder="Enter the full name"
                    type="text"
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className={errorMessageClass}>
                    <span className="material-symbols-outlined text-xs">
                      error
                    </span>
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5 mb-4">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                    mail
                  </span>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${inputClass} ${fieldErrors.email ? errorInputClass : ""}`}
                    placeholder="Enter email"
                    type="email"
                    disabled={isLoading}
                  />
                  {fieldErrors.email && (
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-lg">
                      warning
                    </span>
                  )}
                </div>
                {fieldErrors.email && (
                  <p className={errorMessageClass}>
                    <span className="material-symbols-outlined text-xs">
                      error
                    </span>
                    {fieldErrors.email}
                    {fieldErrors.email.includes("already registered") && (
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-[#00ff88] hover:underline ml-2 text-xs font-bold"
                      >
                        Login
                      </button>
                    )}
                  </p>
                )}
              </div>

              {/* ===== FIXED LOCATION LAYOUT ===== */}
              {/* Country & State - First Row */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Country */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                      flag
                    </span>
                    <input
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`${inputClass} pl-11 ${fieldErrors.country ? errorInputClass : ""}`}
                      placeholder="Country"
                      type="text"
                      disabled={isLoading}
                    />
                  </div>
                  {fieldErrors.country && (
                    <p className={errorMessageClass}>
                      <span className="material-symbols-outlined text-xs">
                        error
                      </span>
                      {fieldErrors.country}
                    </p>
                  )}
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                    State <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                      map
                    </span>
                    <input
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`${inputClass} pl-11 ${fieldErrors.state ? errorInputClass : ""}`}
                      placeholder="State"
                      type="text"
                      disabled={isLoading}
                    />
                  </div>
                  {fieldErrors.state && (
                    <p className={errorMessageClass}>
                      <span className="material-symbols-outlined text-xs">
                        error
                      </span>
                      {fieldErrors.state}
                    </p>
                  )}
                </div>
              </div>

              {/* City & Pincode - Second Row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                      location_city
                    </span>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`${inputClass} pl-11 ${fieldErrors.city ? errorInputClass : ""}`}
                      placeholder="City"
                      type="text"
                      disabled={isLoading}
                    />
                  </div>
                  {fieldErrors.city && (
                    <p className={errorMessageClass}>
                      <span className="material-symbols-outlined text-xs">
                        error
                      </span>
                      {fieldErrors.city}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                    Pincode / Zipcode <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                      markunread_mailbox
                    </span>
                    <input
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className={`${inputClass} pl-11 ${fieldErrors.pincode ? errorInputClass : ""}`}
                      placeholder="Pincode / ZIP"
                      type="text"
                      maxLength={6}
                      disabled={isLoading}
                    />
                  </div>
                  {fieldErrors.pincode && (
                    <p className={errorMessageClass}>
                      <span className="material-symbols-outlined text-xs">
                        error
                      </span>
                      {fieldErrors.pincode}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 mb-4">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                    lock
                  </span>
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${inputClass} ${fieldErrors.password ? errorInputClass : ""}`}
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className={errorMessageClass}>
                    <span className="material-symbols-outlined text-xs">
                      error
                    </span>
                    {fieldErrors.password}
                  </p>
                )}
                <p className="text-xs text-slate-500 ml-1">Min 6 characters</p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5 mb-4">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                    lock
                  </span>
                  <input
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${inputClass} ${fieldErrors.confirmPassword ? errorInputClass : ""}`}
                    placeholder="Confirm password"
                    type={showConfirmPassword ? "text" : "password"}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showConfirmPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className={errorMessageClass}>
                    <span className="material-symbols-outlined text-xs">
                      error
                    </span>
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2 mb-4">
                <div className="flex items-start gap-3">
                  <input
                    id="terms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className={`w-4 h-4 mt-0.5 rounded 
border border-slate-300 dark:border-white/10 
bg-white dark:bg-white/5 
text-[#00ff88] 
focus:ring-[#00ff88]/30 focus:ring-2 
${fieldErrors.agreeTerms ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs text-slate-400 leading-snug"
                  >
                    I agree to{" "}
                    <Link
                      to="/terms"
                      className="text-[#00ff88] text-sm underline decoration-slate-00 "
                    >
                      Terms
                    </Link>{" "}
                    &{" "}
                    <Link
                      to="/privacy"
                      className="text-[#00ff88] text-sm underline decoration-slate-00 "
                    >
                      Privacy
                    </Link>
                  </label>
                </div>
                {fieldErrors.agreeTerms && (
                  <p className={errorMessageClass}>
                    <span className="material-symbols-outlined text-xs">
                      error
                    </span>
                    {fieldErrors.agreeTerms}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00ff88] hover:bg-[#00e67a] text-black font-bold py-3 px-4 rounded-lg 
                         transition-all flex items-center justify-center gap-2 text-sm uppercase 
                         active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="material-symbols-outlined text-lg">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#00ff88] font-bold hover:underline"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ══════════ OTP VERIFICATION MODAL ══════════ */}
      {showOtpModal && (
  <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 md:p-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#00ff88]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#00ff88] text-2xl">
            mail_lock
          </span>
        </div>

        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
          Verify Your Email
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          We've sent a 6-digit OTP to
        </p>

        <p className="text-sm font-bold text-slate-900 dark:text-white break-all">
          {formData.email}
        </p>
      </div>

      <div className="mb-5">
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider block mb-1.5">
          Enter OTP
        </label>

        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={otp}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
            setOtp(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && otp.length === 6 && !otpLoading) {
              handleVerifyOtp();
            }
          }}
          maxLength={6}
          disabled={otpLoading}
          placeholder="- - - - - -"
          className="w-full text-center text-2xl tracking-[0.6em] font-bold bg-[#f1f5f9] dark:bg-slate-950/70 border border-gray-300 dark:border-white/10 rounded-xl py-3.5 px-4 outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/30 transition-all text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 disabled:opacity-50"
        />
      </div>

      <button
        type="button"
        onClick={handleVerifyOtp}
        disabled={otpLoading || resendLoading || otp.length !== 6}
        className="w-full bg-[#00ff88] hover:bg-[#00e67a] text-black font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm uppercase active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
      >
        {otpLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            Verifying...
          </>
        ) : (
          <>
            Verify OTP
            <span className="material-symbols-outlined text-lg">
              check_circle
            </span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleResendOtp}
        disabled={otpLoading || resendLoading}
        className="w-full bg-transparent border border-slate-300 dark:border-white/10 hover:border-[#00ff88]/50 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm uppercase active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {resendLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
            Resending...
          </>
        ) : (
          <>
            Resend OTP
            <span className="material-symbols-outlined text-lg">
              refresh
            </span>
          </>
        )}
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default IndividualRegister;
