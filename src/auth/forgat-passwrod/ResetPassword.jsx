import React, { useState } from "react";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API_CONFIG from "../../config/api.config";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
 
  const email = location.state?.email || localStorage.getItem("userEmail");
  const otp = location.state?.otp || localStorage.getItem("userOtp");
  
  // ✅ YEH CHECK KAREIN KI VERIFICATION ACTUALLY HUI HAI YA NAHI
  const isVerified = location.state?.isVerified || localStorage.getItem("isOtpVerified") === "true";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

      if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            otp: otp,
            password: password,
            confirm_password: confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (data.status === true) {
        toast.success("Password Updated Successfully ✅");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userOtp");
        localStorage.removeItem("isOtpVerified"); // ✅ CLEANUP
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        toast.error(data.message || "Something went wrong ❌");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server Error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10221a] text-white flex flex-col font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#ffffff05_1px,transparent_0)] bg-[size:24px_24px]" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[480px]">
          
          {/* ✅ SIRF TAB DIKHAYEN JAB VERIFICATION SUCCESSFUL HO */}
          {isVerified && (
            <div className="mb-8 flex items-center justify-center gap-3 bg-[#0df287]/10 border border-[#0df287]/20 rounded-xl px-4 py-3">
              <CheckCircle size={20} className="text-[#0df287]" />
              <p className="text-[#0df287] text-sm font-semibold">Identity successfully verified</p>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-3 tracking-tight">Set New Password</h1>
              <p className="text-white/60 text-sm leading-relaxed">
                Choose a strong password to secure your climate research data and simulation models.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">New Password</label>
                <div className="relative group">
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-12 px-4 focus:ring-1 focus:ring-[#0df287] focus:border-[#0df287] outline-none transition-all placeholder:text-white/20 text-white"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#0df287] transition-colors"
                    type="button"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                 {/* ✅ PASSWORD STRENGTH INDICATOR (OPTIONAL) */}
                {password.length > 0 && password.length < 6 && (
                  <p className="text-xs text-red-400 mt-1">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Confirm New Password</label>
                <div className="relative group">
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-12 px-4 focus:ring-1 focus:ring-[#0df287] focus:border-[#0df287] outline-none transition-all placeholder:text-white/20 text-white"
                    placeholder="••••••••"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#0df287] transition-colors"
                    type="button"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                className="w-full bg-[#0df287] hover:bg-[#0df287]/90 text-[#10221a] font-bold h-12 rounded-lg transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(13,242,135,0.2)] mt-4"
                type="submit"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-[12px] font-medium text-[#0df287]/40">
              <a className="hover:text-[#0df287] transition-colors cursor-pointer">Terms of service</a>
              <span className="opacity-50">•</span>
              <a className="hover:text-[#0df287] transition-colors cursor-pointer">Privacy policy</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;