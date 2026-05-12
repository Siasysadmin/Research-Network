import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import API_CONFIG from "../../config/api.config"; // Make sure the path is correct
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();
      if(data.status==true){
        navigate("/verify",{state:{email:email}});
      }
       else {
        toast.error(" to send OTP. Please check your email and try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center relative font-sans">
      <main className="w-full max-w-[480px] px-4 py-12">
        <div className="bg-white/5 dark:bg-[#183427]/40 backdrop-blur-md border border-primary/15 rounded-2xl p-8 md:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
              <span 
                className="material-symbols-outlined text-primary text-4xl" 
                style={{ fontVariationSettings: "'wght' 300" }}
              >
                lock_reset
              </span>
            </div>
            <h1 className="text-white text-3xl font-semibold tracking-tight mb-4">
              Forgot Password
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-[320px]">
              Enter your registered email below to receive a secure recovery code.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2.5">
              <label 
                className="text-white/90 text-sm font-medium px-1" 
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors text-xl">
                  mail
                </span>
                <input
                  className="w-full h-14 pl-12 pr-4 bg-[#183427]/60 border border-[#31684e] rounded-xl text-white placeholder:text-[#90cbaf]/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base font-normal"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@institution.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
             disabled={loading}
              className="w-full h-14 bg-primary text-background-dark font-bold text-lg rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(13,242,135,0.2)]"
              type="submit"
            >
              <span>{loading ? 'Sending...' : 'Send OTP'}</span>
              <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-primary/10 text-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors font-medium group text-sm bg-transparent border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              Back to Login
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 text-gray-600 text-xs font-medium">
            <a 
              className="hover:text-gray-400 transition-colors" 
              href="/terms" // Update this to your actual terms route
            >
              Terms of Services
            </a>
            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
            <a 
              className="hover:text-gray-400 transition-colors" 
              href="/privacy" // Update this to your actual privacy policy route
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;