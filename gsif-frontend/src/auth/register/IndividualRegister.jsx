// ============================================
// INDIVIDUAL REGISTRATION - CORRECTED LAYOUT
// ============================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import API_CONFIG from "../../config/api.config";

const IndividualRegister = () => {
  const navigate = useNavigate();
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

  // API CALL
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
        toast.success(" Registration successful!");
        localStorage.removeItem("formData");
        // ✅ Token
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user_type", "individual"); // Use same key name everywhere
          localStorage.setItem("isLoggedIn", "true");
        }

        const userData = {
          id: data?.user_id || "",
          user_id: data?.user_id || "",
          name: formData.fullName,
          email: formData.email,
          user_type: "individual",
          country: formData.country,
          state: formData.state,
          city: formData.city,
          pincode: formData.pincode,
registration_id: data?.registration_id || "",        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("user_id", data?.user_id || "");
        // ✅ ALSO save separately (backup for other components)
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("user_type", "individual");
        localStorage.setItem("isLoggedIn", "true");

        setTimeout(() => {
          navigate("/application-approved", {
            state: { userType: "individual", email: formData.email },
          });
        }, 500);
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

  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  // UI Classes
  const inputClass =
    "w-full bg-slate-800/50 border border-white/10 rounded-lg py-3 pl-11 pr-12 outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/30 transition-all text-white placeholder:text-slate-500 text-sm";
  const errorInputClass =
    "border-red-500 focus:border-red-500 focus:ring-red-500/30";
  const errorMessageClass =
    "text-red-500 text-xs mt-1 ml-1 flex items-start gap-1";

  return (
    <div className="bg-black text-white font-sans min-h-screen relative overflow-y-auto">
      {/* Material Icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0,1"
        rel="stylesheet"
      />

      {/* Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: `radial-gradient(#ffffff08 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <main className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-[480px]">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-10 shadow-[0_0_50px_rgba(0,255,136,0.1)]">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight mb-2">
                Create Your Account
              </h1>
              <p className="text-slate-400 text-xs">
                Start your journey as individual researcher
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name Field */}
              <div className="space-y-1.5 mb-4">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
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
                    placeholder="John Doe"
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
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
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
                    placeholder="researcher@domain.com"
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
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
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
                      placeholder="India"
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
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
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
                      placeholder="Madhya Pradesh"
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
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
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
                      placeholder="Indore"
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
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
                    Pincode <span className="text-red-500">*</span>
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
                      placeholder="452001"
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
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
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
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
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
                    className={`w-4 h-4 mt-0.5 rounded border-white/10 bg-white/5 text-[#00ff88] 
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
                      className="text-[#00ff88] text-sm underline decoration-slate-700 underline-offset-2"
                    >
                      Terms
                    </Link>{" "}
                    &{" "}
                    <Link
                      to="/privacy"
                      className="text-[#00ff88] text-sm underline decoration-slate-700 underline-offset-1"
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
            <div className="mt-8 text-center text-slate-400 text-sm">
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
    </div>
  );
};

export default IndividualRegister;
