// ============================================
// INSTITUTE REGISTRATION - ADDRESS FIRST, THEN WEBSITE
// ============================================

import React, { useState ,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import API_CONFIG from "../../config/api.config";
import { useReducer } from "react";

const InstituteRegister = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState( () => {
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

    // Address validation - pehle
    if (!formData.address.trim()) errors.address = "Address is required";

    // Website validation - baad mein
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
        address: formData.address, // Address
        website: formData.instituteWebsite, // Website
        name: formData.adminName,
        professional_role: formData.professionalRole,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      };
      console.log(JSON.parse(localStorage.getItem("user")));
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
        toast.success(" Registration successful!");
        localStorage.removeItem("formData");
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userType", "institute");
        localStorage.setItem("instituteName", formData.instituteName);
        localStorage.setItem("isLoggedIn", "true");

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data?.data || "",
            user_id: data?.data || "",
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
        localStorage.setItem("user_id", data?.data || "");
        setTimeout(() => {
          navigate("/application-approved", {
            state: { userType: "institute", email: formData.email },
          });
        }, 500);
      } // ⭐ EMAIL ALREADY REGISTERED LOGIC
      else if (
        data.message?.toLowerCase().includes("email") &&
        data.message?.toLowerCase().includes("exist")
      ) {
        // Step 1 pe wapas le jao
        setStep(1);

        // Email field error show karo
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

  useEffect(() => {
  localStorage.setItem("formData", JSON.stringify(formData));
}, [formData]);

  // EXACT same classes as IndividualRegister
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
                {step === 1 ? "Institute Details" : "Institute Representative"}
              </h1>
              <p className="text-slate-400 text-xs">
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
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
                    Institute Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
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
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
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

                {/* ADDRESS - pehle */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
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

                {/* INSTITUTE WEBSITE - baad mein */}
                <div className="space-y-1.5 mb-6">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
                    Institute Website <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
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

            {/* STEP 2 FORM - same as before */}
            {step === 2 && (
              <form onSubmit={handleSubmit} noValidate>
                {/* Admin Name */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
                    Representative Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
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
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-1">
                    Professional Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-[#00ff88]">
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
                  <p className="text-xs text-slate-500 ml-1">
                    Min 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
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
                <div className="pt-2 mb-6">
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

                {/* Buttons - Back button chhota kiya */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="w-48 border border-white/10 hover:border-white/20 text-white font-bold py-3 px-1 rounded-lg 
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
                    {/* Hidden text to keep width fixed */}
                    <span className="invisible">Creating Account...</span>

                    {/* Real content */}
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

export default InstituteRegister;
