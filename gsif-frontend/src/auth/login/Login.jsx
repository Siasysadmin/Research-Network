// ============================================
// LOGIN COMPONENT - WITH API INTEGRATION
// ============================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
// API config import - isme base URL store hai
import API_CONFIG from "../../config/api.config";

const Login = () => {
  const navigate = useNavigate();

  // ===== STATE MANAGEMENT =====
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    rememberMe: "",
  });

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
    if (e.target.checked) {
      setFieldErrors((prev) => ({ ...prev, rememberMe: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFieldErrors({ email: "", password: "", rememberMe: "" });

    let hasError = false;
    if (!email) {
      setFieldErrors((prev) => ({ ...prev, email: "Email is required" }));
      hasError = true;
    }
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: "Password is required" }));
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();


      if (data.token) {
     toast.success("✅ Login successful!", {
  // Mobile par center, laptop par right
  position: window.innerWidth < 640 ? "top-center" : "top-right",
  autoClose: 2000,
  theme: "dark",
  hideProgressBar: true, // Mobile par clean look ke liye progress bar hata sakte hain
});

        localStorage.setItem("authToken", data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);

        localStorage.setItem("registration_id", data.data.registration_id);
        localStorage.setItem("user_type", data.data.user_type);
        localStorage.setItem("userName", data.data.name);
        // ===== ✅ STORE USER_ID - THE KEY FIX =====
        // Try multiple possible locations where user_id might be in response
        let userId = null;

        // Check 1: data.user.id
        if (data.user && data.user.id) {
          userId = data.user.id;
          localStorage.setItem("user", JSON.stringify(data.user));
          console.log("✅ Found user_id in data.user.id:", userId);
        }
        // Check 2: data.user.user_id
        else if (data.user && data.user.user_id) {
          userId = data.user.user_id;
          localStorage.setItem("user", JSON.stringify(data.user));
          console.log("✅ Found user_id in data.user.user_id:", userId);
        }
        // Check 3: data.id (at top level)
        else if (data.id) {
          userId = data.id;
          console.log("✅ Found user_id in data.id:", userId);
        }
        // Check 4: data.user_id (at top level)
        else if (data.user_id) {
          userId = data.user_id;
          console.log("✅ Found user_id in data.user_id:", userId);
        }
        // Check 5: Check in data.data for id
        else if (data.data && data.data.id) {
          userId = data.data.id;
          console.log("✅ Found user_id in data.data.id:", userId);
        }
        // Check 6: Check entire response for any id field
        else {
          // Search through response keys for 'id'
          for (const key in data) {
            if (key === 'id' || key === 'user_id' || key === 'userId') {
              userId = data[key];
              console.log(`✅ Found user_id in data.${key}:`, userId);
              break;
            }
          }
        }

        // Store userId if found
        if (userId) {
          localStorage.setItem("user_id", String(userId));
          console.log("✅ Successfully stored user_id in localStorage:", userId);
        } else {
          console.warn("⚠️ user_id not found in response. Check API response structure.");
          console.warn("Response keys:", Object.keys(data));
        }

        // Store entire data object if available
       // ✅ FIXED - User data properly store karo
const userData = data.user || data.data || {};

// Ensure id field exists (multiple fallbacks)
if (!userData.id) {
  userData.id = data.data?.id || 
                data.data?.registration_id || 
                data.id || 
                data.user_id || 
                null;
}

localStorage.setItem("user", JSON.stringify(userData));

if (userData.id) {
  localStorage.setItem("user_id", String(userData.id));
  console.log("✅ User stored with id:", userData.id);
} else {
  console.warn("⚠️ No id found. Full response:", data);
}

        if (email === "admin@gmail.com") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else if (data.message === "Invalid Email") {
        setFieldErrors({
          email: "Email not registered",
          password: "",
          rememberMe: "",
        });
      } else if (data.message && data.message.toLowerCase().includes("password")) {
        setFieldErrors({
          email: "",
          password: "Incorrect password",
          rememberMe: "",
        });
      } else {
        setFieldErrors({
          email: "Login failed",
          password: "Please try again",
          rememberMe: "",
        });
        toast.error("❌ Login failed");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setFieldErrors({
        email: "Server error",
        password: "Please try again later",
        rememberMe: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // UI Classes
  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/30 transition-all text-white placeholder:text-slate-600";
  const inputClassWithPassword =
    "w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/30 transition-all text-white placeholder:text-slate-600";
  const errorInputClass = "border-red-500/50 focus:border-red-500/50";
  const errorMessageClass = "text-red-400 text-xs mt-1 flex items-center gap-1";

  return (
    <div className="bg-black text-white font-sans min-h-screen flex flex-col overflow-x-hidden relative">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: `radial-gradient(#ffffff08 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      <main className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-lg relative">
          <div
            className="bg-slate-900/40 backdrop-blur-xl border border-[#00ff88]/30 rounded-[2.5rem] p-6 sm:p-8 md:p-10 relative overflow-hidden z-10"
            style={{ boxShadow: "0 0 20px rgba(0, 255, 136, 0.15)" }}
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00ff88]/10 blur-[80px] rounded-full"></div>

            {/* Header */}
            <div className="text-center mb-10 relative z-10 pt-4">
              <h1 className="text-4xl font-black tracking-tight mb-3">Welcome Back</h1>
              <p className="text-slate-400 text-sm">Access your sustainability research portal</p>
            </div>

            {/* Form */}
            <div className="relative z-10">
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* ===== EMAIL FIELD ===== */}
                <div>
                  <label className="text-xs font-medium text-slate-300 ml-1 uppercase tracking-wider">
                    EMAIL ID
                  </label>
                  <div className="relative mt-1">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                      person
                    </span>
                    <input
                    
                      className={`${inputClass} ${fieldErrors.email ? errorInputClass : ""}`}
                      placeholder="researcher@domain.com"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      disabled={isLoading}
                    />
                    
                  </div>
                  {/* Email error - FIELD KE BAHAR */}
                  {fieldErrors.email && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* ===== PASSWORD FIELD ===== */}
                <div>
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate("/forgot")}
                      className="text-xs text-[#00ff88] hover:underline bg-transparent border-none"
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative mt-1">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                      lock
                    </span>
                    <input
                      className={`${inputClassWithPassword} ${fieldErrors.password ? errorInputClass : ""}`}
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      disabled={isLoading}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#00ff88] transition-colors"
                      disabled={isLoading}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>

                  {/* Password error - FIELD KE BAHAR */}
                  {fieldErrors.password && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* ===== REMEMBER ME CHECKBOX ===== */}
                <div>
                  {/* <div className="flex items-center gap-3 px-1">
                    <input
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#00ff88] focus:ring-[#00ff88]/20"
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={handleRememberMe}
                      disabled={isLoading}
                    />
                    <label className="text-sm text-slate-400" htmlFor="remember">
                      Keep me signed in <span className="text-red-500"></span>
                    </label>
                  </div> */}

                  {/* Remember me error - CHECKBOX KE BAHAR */}
                  {fieldErrors.rememberMe && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1 ml-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {fieldErrors.rememberMe}
                    </p>
                  )}
                </div>

                {/* ===== SUBMIT BUTTON ===== */}
                <div className="pt-4">
                  <button
                    className="w-full py-3.5 bg-[#00ff88] text-black font-black rounded-xl hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center relative z-10">
              <p className="text-[11px] text-slate-600 leading-relaxed px-6">
                By logging in, you agree to our{" "}
                <Link to="/terms" className="text-[#00ff88] underline decoration-slate-700 underline-offset-2">
  Terms & Conditions
</Link>
                and{" "}
                <Link to="/privacy" className="text-[#00ff88] underline decoration-slate-700 underline-offset-2">
  Privacy Policy
</Link>
              </p>
            </div>

            {/* User type selection */}
            <div className="relative z-10 mt-10 pt-8 border-t border-white/10">
              <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                JOIN THE NETWORK
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <div
                  onClick={() => !isLoading && navigate("/individual")}
                  className="flex-1 cursor-pointer p-3 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#00ff88]/30 transition-all duration-300 flex flex-col items-center text-center group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-xl text-slate-400 group-hover:text-[#00ff88]">
                      person
                    </span>
                  </div>
                  <h3 className="text-xs font-bold">Individual</h3>
                </div>

                <div
                  onClick={() => !isLoading && navigate("/institute")}
                  className="flex-1 cursor-pointer p-3 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#00ff88]/30 transition-all duration-300 flex flex-col items-center text-center group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-xl text-slate-400 group-hover:text-[#00ff88]">
                      account_balance
                    </span>
                  </div>
                  <h3 className="text-xs font-bold">Institute</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;