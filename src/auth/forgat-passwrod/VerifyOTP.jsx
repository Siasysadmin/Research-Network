import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputRefs = useRef([]);

  // Email setup effect
  useEffect(() => {
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem("userEmail");
    
    if (emailFromState) {
      setEmail(emailFromState);
      localStorage.setItem("userEmail", emailFromState);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      toast.error("Email not found. Please try again.");
      navigate("/forgot-password");
    }
  }, []);

  // ⏱️ TIMER COUNTDOWN EFFECT - YEH ADD KARO
  useEffect(() => {
    let interval;
    
    if (timer > 0 && isResendDisabled) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }

    return () => clearInterval(interval);
  }, [timer, isResendDisabled]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    // Basic validation
    if (enteredOtp.length !== 6) {
      toast.error("Please enter complete 6-digit OTP");
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: enteredOtp,
        }),
      });

      const data = await response.json();

      if (data.status === true) {
        toast.success("OTP Verified Successfully ✅");
        localStorage.setItem("userOtp", enteredOtp);
        localStorage.setItem("isOtpVerified", "true");
        
        navigate("/reset", {
          state: {
            email: email,
            otp: enteredOtp,
            isVerified: true,
          },
        });
      } else {
        toast.error(data.message || "Invalid OTP ❌");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Server Error ❌");
    }
  };

  const handleResendOTP = async () => {
    if (!isResendDisabled) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/auth/resend-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (data.status === true) {
          toast.success(data.message || "OTP Sent Successfully 📩");
          setTimer(59);
          setIsResendDisabled(true); // ⏱️ Timer restart
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Server Error ❌");
      }
    }
  };

  
  return (
    <div className="bg-[#f5f8f7] dark:bg-[#030806] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans">
      <main className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background Blur */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0df287]/5 rounded-full blur-[160px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-[480px]">
          <div className="bg-white dark:bg-[#061a13] p-8 md:p-12 rounded-xl shadow-2xl border border-white/5 dark:border-[#0df287]/10 mb-6 transition-all duration-300">
            {/* Icon Header */}
            <div className="flex justify-center mb-8">
              <div className="size-16 rounded-full bg-[#0df287]/10 flex items-center justify-center border border-[#0df287]/20">
                <span className="material-symbols-outlined text-[#0df287] text-3xl">
                  verified_user
                </span>
              </div>
            </div>

            <div className="text-center space-y-3 mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Verify OTP
              </h1>
              <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed max-w-[320px] mx-auto">
                A 6-digit security code has been sent to <br />
                <span className="text-[#0df287] font-medium">
                  {email || "Loading..."}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-between gap-2 md:gap-3">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    placeholder="·"
                    className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-slate-50 dark:bg-black/20 border-2 border-slate-200 dark:border-[#0df287]/20 rounded-lg focus:border-[#0df287] focus:ring-1 focus:ring-[#0df287]/30 outline-none transition-all text-slate-900 dark:text-white"
                  />
                ))}
              </div>

              <div className="space-y-6">
                <button
                  type="submit"
                  className="w-full bg-[#0df287] hover:bg-[#0df287]/90 text-[#030806] font-bold py-4 rounded-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  Verify & Proceed
                  <span className="material-symbols-outlined text-xl">
                    arrow_forward
                  </span>
                </button>

                <div className="text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Didn't receive the code?
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={timer > 0}
                      className={`inline-block ml-1 font-medium text-[#0df287] hover:underline cursor-pointer ${timer > 0 ? "opacity-50 cursor-not-allowed" : "opacity-90"}`}
                    >
                      {timer > 0
                        ? `Resend OTP in 0:${timer.toString().padStart(2, "0")}`
                        : "Resend OTP now"}
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Links */}
          <div className="flex justify-center items-center gap-4 text-[10px] sm:text-xs font-normal text-[#0df287]/40">
            <a
              className="hover:text-[#0df287] transition-colors duration-200"
              href="#terms"
            >
              Terms of Services
            </a>
            <span className="w-[3px] h-[3px] rounded-full bg-[#0df287]/20"></span>
            <a
              className="hover:text-[#0df287] transition-colors duration-200"
              href="#privacy"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOTP;
