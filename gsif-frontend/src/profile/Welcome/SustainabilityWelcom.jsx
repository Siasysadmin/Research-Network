import React from "react";
import { useNavigate } from "react-router-dom";
const SustainabilityWelcome = () => {
   const navigate = useNavigate();
  return (
    <div className="dark">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap");
        @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");

        body {
          margin: 0;
          padding: 0;
          background-color: #010805;
          font-family: "Open Sans", sans-serif;
        }

        /* 1. Base Layer: Dark Leaf Image (img.jpeg) */
        .hero-bg-exact {
          position: relative;
          min-h-screen: 100vh;
          background-image: linear-gradient(
              to bottom,
              rgba(1, 8, 5, 0.75),
              rgba(1, 8, 5, 0.9)
            ),
            url("/img.jpeg"); /* Aapki dark leaf image ka path */
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          overflow-x: hidden;
        }

        /* 2. Glow Effect Layer (Screenshot jaisa subtle green aura) */
        .glow-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(0, 255, 136, 0.08) 0%,
            transparent 60%
          );
          pointer-events: none;
        }

        /* 3. Grid Pattern (Screenshot jaisa subtle network feel) */
        .grid-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .primary-glow {
          box-shadow: 0 0 25px rgba(0, 255, 136, 0.4);
        }

        .text-glow {
          text-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
        }
      `}</style>

      <div className="hero-bg-exact flex flex-col items-center justify-center min-h-screen relative">
        {/* Background Layers */}
        <div className="grid-pattern"></div>
        <div className="glow-overlay"></div>

        <main className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#00ff88] text-[10px] font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
            <span className="material-symbols-outlined text-sm">science</span>
            Sustainability Research
          </div>

          {/* Main Heading */}
          <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            Welcome to the <br />
            <span className="text-[#00ff88] text-glow">
              Sustainability Research Network
            </span>
          </h1>

          {/* Description */}
          <p className="text-zinc-400 text-sm md:text-lg max-w-xl mb-10 leading-relaxed">
            Connect with over 50,000 scientists dedicated to global
            sustainability. Access groundbreaking research and real-time data
            visualizations.
          </p>

          {/* Buttons Area */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
            <button  
             onClick={() => navigate("/dashboard")}
             className="w-full sm:w-auto min-w-[240px] h-14 bg-[#00ff88] text-black rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:scale-105 primary-glow active:scale-95 group">
              Go to Dashboard
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SustainabilityWelcome;