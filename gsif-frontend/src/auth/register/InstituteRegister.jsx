// ============================================
// INSTITUTE REGISTRATION - WITH OTP VERIFY FLOW
// ============================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import API_CONFIG from "../../config/api.config";

const InstituteRegister = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("formData");
    return savedData
      ? JSON.parse(savedData)
      : {
          instituteName: "",
          email: "",
          contactNumber: "",
          address: "",
          instituteWebsite: "",
          adminName: "",
          professionalRole: "",
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

    if (name === "contactNumber") {
      const numbersOnly = value.replace(/[^0-9]/g, "");
      if (numbersOnly.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numbersOnly }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const validateStep1 = () => {
    const errors = {};

    if (!formData.instituteName.trim())
      errors.instituteName = "Institution name is required";

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.contactNumber.trim()) {
      errors.contactNumber = "Contact number is required";
    } else if (formData.contactNumber.length !== 10) {
      errors.contactNumber = "Contact number must be exactly 10 digits";
    }

    // Address validation
    if (!formData.address.trim()) errors.address = "Address is required";

    // Website validation
    if (!formData.instituteWebsite.trim()) {
      errors.instituteWebsite = "Institute website is required";
    } else if (
      !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
        formData.instituteWebsite,
      )
    ) {
      errors.instituteWebsite = "Please enter a valid website URL";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};

    if (!formData.adminName.trim())
      errors.adminName = "Representative name is required";
    if (!formData.professionalRole.trim())
      errors.professionalRole = "Professional role is required";
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

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setFieldErrors({});
    setStep(1);
  };

  // sync Common User Api start vijay
  const syncCommonUserApi = async (userId) => {
    try {
      const commonUserPayload = {
        // simple/common fields
        name: formData.instituteName,
        email: formData.email,
        mobile: formData.contactNumber,
        address: formData.address,
        country: "",
        state: "",
        city: "",
        pincode: "",
        age: null,

        category: "Institute",
        platform: "RESEARCH_NETWORK",
        platform_user_id: String(userId),

        // institute extra fields
        extra_data: {
          institute_website: formData.instituteWebsite,
          admin_name: formData.adminName,
          professional_role: formData.professionalRole,
        },
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
        }
      );

      const commonText = await commonResponse.text();

      let commonData = {};
      try {
        commonData = commonText ? JSON.parse(commonText) : {};
      } catch (err) {
        commonData = { rawResponse: commonText };
      }

      if (!commonResponse.ok || commonData.status === false) {
        console.error("Institute Common User API Sync Failed:", commonData);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Institute Common User API Error:", error);
      return false;
    }
  };
  // sync Common User Api end vijay

  // ── REGISTER API → on success, open OTP modal ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      const requestData = {
        user_type: "institute",
        institute_name: formData.instituteName,
        email: formData.email,
        contact_no: formData.contactNumber,
        address: formData.address,
        website: formData.instituteWebsite,
        name: formData.adminName,
        professional_role: formData.professionalRole,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      };

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/auth/register-institute`,
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
      console.log("API RESPONSE:", data);

      if (
        response.ok &&
        (data.status === true ||
          data.status === "success" ||
          data.message?.includes("success"))
      ) {
        // Store response. No localStorage write yet — OTP pending.
        setRegisteredUserData(data);
        setOtp("");
        setShowOtpModal(true);
        toast.success("OTP sent to your email");
      }
      // ⭐ EMAIL ALREADY REGISTERED
      else if (
        data.message?.toLowerCase().includes("email") &&
        data.message?.toLowerCase().includes("exist")
      ) {
        setStep(1);
        setFieldErrors({
          email: "This email is already registered. Please login.",
        });
        toast.error("Email already registered");
      } else {
        toast.error(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Verify OTP → write localStorage, sync, navigate ──
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
        await syncCommonUserApi(reg?.data || reg?.user_id || reg?.id);

        // token from register or verify-otp response
        if (reg.token || data.token) {
          localStorage.setItem("token", reg.token || data.token);
        }

        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userType", "institute");
        localStorage.setItem("instituteName", formData.instituteName);
        localStorage.setItem("isLoggedIn", "true");

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: reg?.data || data?.data || "",
            user_id: reg?.data || data?.data || "",
            user_type: "institute",
            institute_name: formData.instituteName,
            name: formData.adminName,
            email: formData.email,
            contact: formData.contactNumber,
            address: formData.address,
            role: formData.professionalRole,
            website: formData.instituteWebsite,
          }),
        );
        localStorage.setItem("user_id", reg?.data || data?.data || "");
        localStorage.removeItem("formData");

        toast.success("Verified! Welcome aboard.");
        setShowOtpModal(false);

        setTimeout(() => {
          navigate("/application-approved", {
            state: { userType: "institute", email: formData.email },
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
    "w-full bg-[#f1f5f9] dark:bg-slate-950/70 border border-gray-300 dark:border-white/10 rounded-lg py-3 pl-11 pr-12 outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/30 transition-all text-slate-900 dark:text-white placeholder:text-slate-500 dark:text-slate-500 dark:placeholder:text-slate-600";
  const errorInputClass =
    "border-red-500 focus:border-red-500 focus:ring-red-500/30";
  const errorMessageClass =
    "text-red-500 text-xs mt-1 ml-1 flex items-start gap-1";

  return (
    <div className="min-h-screen relative overflow-y-auto bg-white text-slate-900 dark:bg-black text-slate-900 dark:text-white font-sans">
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
          <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-10 shadow-[0_0_50px_rgba(0,255,136,0.1)]">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight mb-2">
                {step === 1 ? "Institute Details" : "Institute Representative"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                {step === 1
                  ? "Register your institute for research collaborations"
                  : "Add representative details to complete registration"}
              </p>
            </div>
            {/* STEP 1 FORM */}
            {step === 1 && (
              <form onSubmit={(e) => e.preventDefault()} noValidate>
                {/* Institute Name */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                    Institute Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                      apartment
                    </span>
                    <input
                      name="instituteName"
                      value={formData.instituteName}
                      onChange={handleChange}
                      className={`${inputClass} ${fieldErrors.instituteName ? errorInputClass : ""}`}
                      placeholder="Stanford University"
                      type="text"
                      disabled={isLoading}
                    />
                  </div>
                  {fieldErrors.instituteName && (
                    <p className={errorMessageClass}>
                      <span className="material-symbols-outlined text-xs">
                        error
                      </span>
                      {fieldErrors.instituteName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                    Email ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                      mail
                    </span>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${inputClass} ${fieldErrors.email ? errorInputClass : ""}`}
                      placeholder="admin@university.edu"
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

                {/* Contact Number */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                      phone
                    </span>
                    <input
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className={`${inputClass} ${fieldErrors.contactNumber ? errorInputClass : ""}`}
                      placeholder="9876543210"
                      type="text"
                      maxLength={10}
                      disabled={isLoading}
                    />
                    {fieldErrors.contactNumber && (
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-lg">
                        warning
                      </span>
                    )}
                  </div>
                  {fieldErrors.contactNumber && (
                    <p className={errorMessageClass}>
                      <span className="material-symbols-outlined text-xs">
                        error
                      </span>
                      {fieldErrors.contactNumber}
                    </p>
                  )}
                </div>

                {/* ADDRESS */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-500 dark:text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                      location_on
                    </span>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className={`${inputClass} pt-3 resize-none ${fieldErrors.address ? errorInputClass : ""}`}
                      placeholder="123 University Ave, City, State, Country"
                      disabled={isLoading}
                    />
                    {fieldErrors.address && (
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-lg">
                        warning
                      </span>
                    )}
                  </div>
                  {fieldErrors.address && (
                    <p className={errorMessageClass}>
                      <span className="material-symbols-outlined text-xs">
                        error
                      </span>
                      {fieldErrors.address}
                    </p>
                  )}
                </div>

                {/* INSTITUTE WEBSITE */}
                <div className="space-y-1.5 mb-6">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                    Institute Website <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                      language
                    </span>
                    <input
                      name="instituteWebsite"
                      value={formData.instituteWebsite}
                      onChange={handleChange}
                      className={`${inputClass} ${fieldErrors.instituteWebsite ? errorInputClass : ""}`}
                      placeholder="https://www.university.edu"
                      type="url"
                      disabled={isLoading}
                    />
                    {fieldErrors.instituteWebsite && (
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-lg">
                        warning
                      </span>
                    )}
                  </div>
                  {fieldErrors.instituteWebsite && (
                    <p className={errorMessageClass}>
                      <span className="material-symbols-outlined text-xs">
                        error
                      </span>
                      {fieldErrors.instituteWebsite}
                    </p>
                  )}
                </div>

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-full bg-[#00ff88] hover:bg-[#00e67a] text-black font-bold py-3 px-4 rounded-lg 
                           transition-all flex items-center justify-center gap-2 text-sm uppercase 
                           active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </button>
              </form>
            )}

            {/* STEP 2 FORM */}
            {step === 2 && (
              <form onSubmit={handleSubmit} noValidate>
                {/* Admin Name */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                    Representative Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                      person
                    </span>
                    <input
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleChange}
                      className={`${inputClass} ${fieldErrors.adminName ? errorInputClass : ""}`}
                      placeholder="Dr. John Smith"
                      type="text"
                      disabled={isLoading}
                    />
                  </div>
                  {fieldErrors.adminName && (
                    <p className={errorMessageClass}>
                      <span className="material-symbols-outlined text-xs">
                        error
                      </span>
                      {fieldErrors.adminName}
                    </p>
                  )}
                </div>

                {/* Professional Role */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                    Professional Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 text-lg group-focus-within:text-[#00ff88]">
                      work
                    </span>
                    <input
                      name="professionalRole"
                      value={formData.professionalRole}
                      onChange={handleChange}
                      className={`${inputClass} ${fieldErrors.professionalRole ? errorInputClass : ""}`}
                      placeholder="Director of Research"
                      type="text"
                      disabled={isLoading}
                    />
                  </div>
                  {fieldErrors.professionalRole && (
                    <p className={errorMessageClass}>
                      <span className="material-symbols-outlined text-xs">
                        error
                      </span>
                      {fieldErrors.professionalRole}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 text-lg group-focus-within:text-[#00ff88]">
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-5000 hover:text-slate-900 dark:text-white transition-colors"
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
                  <p className="text-xs text-slate-500 ml-1">
                    Min 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 text-lg group-focus-within:text-[#00ff88]">
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-5000 hover:text-slate-900 dark:text-white transition-colors"
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
                      className="text-xs text-slate-600 dark:text-slate-400 leading-snug"
                    >
                      I agree to{" "}
                      <Link
                        to="/terms"
                        className="text-[#00ff88] text-sm underline decoration-slate-00 underline-offset-2"
                      >
                        Terms
                      </Link>{" "}
                      &{" "}
                      <Link
                        to="/privacy"
                        className="text-[#00ff88] text-sm underline decoration-slate-00 underline-offset-1"
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

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="w-48 border border-white/10 hover:border-white/20 text-slate-900 dark:text-white font-bold py-3 px-1 rounded-lg 
                             transition-all flex items-center justify-center gap-4 text-sm uppercase 
                             active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-lg">
                      arrow_back
                    </span>
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-[#00ff88] hover:bg-[#00e67a] text-black font-bold py-3 px-4 rounded-lg 
           transition-all flex items-center justify-center gap-2 text-sm uppercase 
           active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative"
                  >
                    <span className="invisible">Creating Account...</span>

                    <span className="absolute flex items-center gap-2">
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
                    </span>
                  </button>
                </div>
              </form>
            )}

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

export default InstituteRegister;