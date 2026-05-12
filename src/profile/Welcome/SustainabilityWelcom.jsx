import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SustainabilityWelcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Push a new state into history to trap the user
    window.history.pushState(null, "", window.location.href);

    // Handle back button press
    const handlePopState = (event) => {
      // Push again to prevent going back
      window.history.pushState(null, "", window.location.href);

      // Optional: Show a warning or alert
      // alert("You cannot go back from this page");
    };

    // Add event listener for popstate (back button)
    window.addEventListener("popstate", handlePopState);

    // Disable right-click (optional)
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Disable keyboard shortcuts for back navigation
    const handleKeyDown = (e) => {
      // Disable Alt + Left Arrow (back)
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
      }
      // Disable Backspace (in some browsers)
      if (e.key === "Backspace") {
        e.preventDefault();
      }
      // Disable Alt + Right Arrow (forward)
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap");
        @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");

        body {
          margin: 0;
          padding: 0;
          background-color: white;
          font-family: "Open Sans", sans-serif;
        }

        .dark body {
          background-color: #010805;
        }
        /* 1. Base Layer: Dark Leaf Image (img.jpeg) */
        .hero-bg-exact {
          position: relative;
          min-height: 100vh;
          background-image: url("/img.jpeg");
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }

        /* Dark overlay */
        .dark .hero-bg-exact::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(1, 8, 5, 0.75),
            rgba(1, 8, 5, 0.9)
          );
        }

        /* Light overlay */
        .hero-bg-exact::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.7),
            rgba(255, 255, 255, 0.9)
          );
        }

        /* 2. Glow Effect Layer (Screenshot jaisa subtle green aura) */
        .glow-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(0, 255, 136, 0.05) 0%,
            transparent 60%
          );

          pointer-events: none;
        }
        .dark .glow-overlay {
          background: radial-gradient(
            circle at 50% 50%,
            rgba(0, 255, 136, 0.08) 0%,
            transparent 60%
          );
        }

        /* 3. Grid Pattern (Screenshot jaisa subtle network feel) */
        .grid-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            rgba(0, 0, 0, 0.05) 1px,
            transparent 1px
          );
          background-size: 40px 40px;
          pointer-events: none;
        }

        .dark .grid-pattern {
          background-image: radial-gradient(
            rgba(255, 255, 255, 0.05) 1px,
            transparent 1px
          );
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
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border-gray-300 text-gray-700
dark:bg-white/5 dark:border-white/10 dark:text-[#00ff88] text-[10px] font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-sm">science</span>
            Sustainability Research
          </div>

          {/* Main Heading */}
          <h1 className="text-slate-900 dark:text-white text-4xl md:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            Welcome to the <br />
            <span className="text-[#00ff88] text-glow">
              Sustainability Research Network
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-zinc-400 text-sm md:text-lg max-w-xl mb-10 leading-relaxed">
            Connect with over 50,000 scientists dedicated to global
            sustainability. Access groundbreaking research and real-time data
            visualizations.
          </p>

          {/* Buttons Area */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto min-w-[240px] h-14 bg-[#00ff88] text-black hover:brightness-95
dark:hover:brightness-110 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:scale-105 primary-glow active:scale-95 group"
            >
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
