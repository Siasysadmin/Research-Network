import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import approved1 from "../../assets/images/approved1.png";
import approved2 from "../../assets/images/approved2.png";
import approved3 from "../../assets/images/approved3.png";
import API_CONFIG from "../../config/api.config";

const ApplicationApproved = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userType = location.state?.userType || localStorage.getItem("user_type") || "individual";

 const handleCompleteProfile = () => {
  
// ✅ finalType ko yahan define karein ya seedha userType use karein
  const storedType = localStorage.getItem("user_type"); 
  const finalType = userType || storedType;

  console.log("Navigating for Type:", finalType);
  if (finalType === "institute") {
    navigate("/organization-onboarding/1");
  } else {
    navigate("/profile-individual-flow/1", { replace: true });
  }
};
  const [applicationStatus, setApplicationStatus] = React.useState(null);
  const [loadingStatus, setLoadingStatus] = React.useState(true);

  React.useEffect(() => {
    if (userType !== "institute") return;

    const fetchUserStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;

        const response = await fetch(
          `${API_CONFIG.BASE_URL}/user/get-user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        // 👇 assuming API returns { status: 1 } or { status: 2 }
        setApplicationStatus(data.status);
      } catch (error) {
        console.error("Error fetching status:", error);
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchUserStatus();
  }, [userType]);
  return (
    <div className="bg-black text-white min-h-screen">
      {/* BACKGROUND CIRCLES */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#00ff88]/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#00ff88]/5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[#00ff88]/20 rounded-full"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 pt-24 px-6 md:px-12 lg:px-40 py-12 max-w-[1400px] mx-auto">
        {/* STATUS BANNER - ONLY FOR INSTITUTE */}
        {userType === "institute" && (
          <div className="relative overflow-hidden flex flex-col gap-3 p-8 md:p-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm min-h-[300px] justify-center mb-12">
            {/* Network Pattern */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, rgba(0, 255, 136, 0.15) 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                {/* <div
                  className="w-3 h-3 rounded-full bg-[#00ff88]"
                  style={{
                    boxShadow: "0 0 0 0 rgba(0, 255, 136, 0.7)",
                    animation: "pulse 2s infinite",
                  }}
                ></div> */}
                {/* <p className="text-[#00ff88] text-xs md:text-sm font-bold tracking-widest uppercase">
                  APPLICATION STATUS:
                  <span
                    className={`px-2 py-0.5 rounded ml-1 font-black ${
                      applicationStatus === 2
                        ? "bg-[#00ff88] text-black"
                        : "bg-orange-500 text-black"
                    }`}
                  >
                    {loadingStatus
                      ? "LOADING..."
                      : applicationStatus === 2
                        ? "APPROVED"
                        : "PENDING"}
                  </span>
                </p> */}
              </div>

              <div className="flex items-center gap-3 mt-4">
                <span
                  className="material-symbols-outlined text-[#00ff88] text-2xl md:text-4xl font-bold"
                  style={{
                    filter: "drop-shadow(0 0 10px rgba(0, 255, 136, 0.6))",
                  }}
                >
                  check_circle
                </span>
                <h1 className="text-white text-3xl md:text-5xl font-black leading-tight tracking-tight">
                  Welcome, esteemed researcher!
                </h1>
              </div>

              <p className="text-white/60 text-sm md:text-base max-w-xl mt-4 leading-relaxed">
                Your network access is confirmed. Start your journey toward
                pioneering sustainable breakthroughs today.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {/* Complete Profile Button */}
                <button
                  onClick={handleCompleteProfile}
                  className="bg-[#00ff88] text-black font-bold py-4 px-8 rounded-lg hover:bg-[#00ff88]/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#00ff88]/20 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  Complete Your Profile
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>

                {/* Dashboard Button */}
                <button
                  onClick={() => navigate("/dashboard")}
                  className="border border-[#00ff88] text-[#00ff88] font-bold py-4 px-8 rounded-lg hover:bg-[#00ff88]/10 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  Go to Dashboard
                  <span className="material-symbols-outlined">
                    {" "}
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WELCOME BANNER - ONLY FOR INDIVIDUAL */}
        {userType === "individual" && (
          <div className="relative overflow-hidden flex flex-col gap-3 p-8 md:p-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm min-h-[200px] justify-center mb-12">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mt-4">
                <span
                  className="material-symbols-outlined text-[#00ff88] text-2xl md:text-4xl font-bold"
                  style={{
                    filter: "drop-shadow(0 0 10px rgba(0, 255, 136, 0.6))",
                  }}
                >
                  check_circle
                </span>
                <h1 className="text-white text-3xl md:text-5xl font-black leading-tight tracking-tight">
                  Welcome, esteemed researcher!
                </h1>
              </div>

              <p className="text-white/60 text-sm md:text-base max-w-xl mt-4 leading-relaxed">
                Your network access is confirmed. Start your journey toward
                pioneering sustainable breakthroughs today.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {/* Complete Profile Button */}
                <button
                  onClick={handleCompleteProfile}
                  className="bg-[#00ff88] text-black font-bold py-4 px-8 rounded-lg hover:bg-[#00ff88]/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#00ff88]/20 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  Complete Your Profile
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>

                {/* Dashboard Button */}
                <button
                  onClick={() => navigate("/dashboard")}
                  className="border border-[#00ff88] text-[#00ff88] font-bold py-4 px-8 rounded-lg hover:bg-[#00ff88]/10 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  Go to Dashboard
                  <span className="material-symbols-outlined">
                    {" "}
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REST OF THE UI */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-3 space-y-8 md:space-y-12">
            {/* DAILY SUSTAINABILITY FACT */}
            <section>
              <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00ff88]">
                  eco
                </span>
                Daily Sustainability Fact
              </h2>

              <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 min-h-[350px] md:h-80 flex flex-col justify-end">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${approved1})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                </div>

                <div className="relative p-6 md:p-8">
                  <span className="bg-[#00ff88]/20 text-[#00ff88] px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 inline-block backdrop-blur-md">
                    Carbon Sink Fact
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">
                    Did you know?
                  </h3>
                  <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                    Restoring seagrass can sequester carbon{" "}
                    <span className="text-[#00ff88] font-bold">
                      35 times faster
                    </span>{" "}
                    than tropical rainforests.
                  </p>
                  <button className="flex items-center gap-2 text-[#00ff88] font-bold text-sm hover:translate-x-1 transition-transform">
                    Read full study{" "}
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* RESEARCH SPOTLIGHT */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00ff88]">
                    science
                  </span>
                  Research Spotlight
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* RESEARCH CARD 1 */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#00ff88]/50 transition-colors cursor-pointer group">
                  <div
                    className="h-40 sm:h-32 rounded-lg bg-center bg-cover mb-4"
                    style={{
                      backgroundImage: `url(${approved2})`,
                    }}
                  ></div>
                  <h4 className="font-bold text-lg mb-1 group-hover:text-[#00ff88] transition-colors">
                    Carbon Capture in Basalt
                  </h4>
                  <p className="text-white/50 text-xs line-clamp-2">
                    Exploring mineralization techniques in Iceland to turn
                    atmospheric CO2 into solid stone.
                  </p>
                </div>

                {/* RESEARCH CARD 2 */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#00ff88]/50 transition-colors cursor-pointer group">
                  <div
                    className="h-40 sm:h-32 rounded-lg bg-center bg-cover mb-4"
                    style={{
                      backgroundImage: `url(${approved3})`,
                    }}
                  ></div>
                  <h4 className="font-bold text-lg mb-1 group-hover:text-[#00ff88] transition-colors">
                    Perovskite Cells breakthrough
                  </h4>
                  <p className="text-white/50 text-xs line-clamp-2">
                    New findings in solar efficiency reaching 30% through tandem
                    cell layering technology.
                  </p>
                </div>

                {/* RESEARCH CARD 3 */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#00ff88]/50 transition-colors cursor-pointer group">
                  <div
                    className="h-40 sm:h-32 rounded-lg bg-center bg-cover mb-4"
                    style={{
                      backgroundImage: `url(${approved1})`,
                    }}
                  ></div>
                  <h4 className="font-bold text-lg mb-1 group-hover:text-[#00ff88] transition-colors">
                    Ocean Plastics Remediation
                  </h4>
                  <p className="text-white/50 text-xs line-clamp-2">
                    Bio-engineered enzymes capable of breaking down stubborn PET
                    plastics.
                  </p>
                </div>

                {/* RESEARCH CARD 4 */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#00ff88]/50 transition-colors cursor-pointer group">
                  <div
                    className="h-40 sm:h-32 rounded-lg bg-center bg-cover mb-4"
                    style={{
                      backgroundImage: `url(${approved2})`,
                    }}
                  ></div>
                  <h4 className="font-bold text-lg mb-1 group-hover:text-[#00ff88] transition-colors">
                    Vertical-Axis Wind Turbines
                  </h4>
                  <p className="text-white/50 text-xs line-clamp-2">
                    Reimagining urban wind capture with compact, low-noise
                    vertical rotation systems.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="lg:col-span-1 space-y-8">
            {/* CHALLENGE HUB */}
            <section>
              <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00ff88]">
                  psychology
                </span>
                Challenge Hub
              </h2>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-[#00ff88] text-3xl">
                    quiz
                  </span>
                  <div>
                    <h3 className="font-bold text-lg">Test Your Expertise</h3>
                    <p className="text-white/50 text-xs">Sustainability quiz</p>
                  </div>
                </div>
                <button className="w-full py-3 px-4 bg-[#00ff88] text-black font-bold rounded-lg">
                  Start Quiz
                </button>
              </div>
            </section>

            {/* HELP CENTER */}
            <section>
              <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00ff88]">
                  help_center
                </span>
                Help Center
              </h2>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
                <div className="size-16 rounded-full bg-[#00ff88]/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[#00ff88] text-3xl">
                    live_help
                  </span>
                </div>
                <h3 className="text-white font-bold mb-2">Need Guidance?</h3>
                <button className="w-full py-3 px-4 bg-[#00ff88] text-black font-bold rounded-lg">
                  Help Center
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 255, 136, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
};

export default ApplicationApproved;
