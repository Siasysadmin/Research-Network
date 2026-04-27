import React from "react";
import approved1 from "../../assets/images/approved1.png";
import approved2 from "../../assets/images/approved2.png";
import approved3 from "../../assets/images/approved3.png";

const ApplicationReview = () => {
  // Static research spotlight data
  const researchProjects = [
    {
      id: 1,
      title: "Carbon Capture in Basalt",
      description:
        "Exploring mineralization techniques in Iceland to turn atmospheric CO2 into solid stone.",
      image: approved2,
    },
    {
      id: 2,
      title: "Perovskite Cells breakthrough",
      description:
        "New findings in solar efficiency reaching 30% through tandem cell layering technology.",
      image: approved3,
    },
    {
      id: 3,
      title: "Ocean Plastics Remediation",
      description:
        "Bio-engineered enzymes capable of breaking down stubborn PET plastics in marine environments.",
      image: approved1,
    },
    {
      id: 4,
      title: "Vertical-Axis Wind Turbines",
      description:
        "Reimagining urban wind capture with compact, low-noise vertical rotation systems.",
      image: approved2,
    },
  ];

  return (
    <div className="bg-background-dark text-white min-h-screen selection:bg-primary selection:text-black overflow-x-hidden font-sans">
      {/* Global Styles */}
      <style>{`
        .status-pulse {
          box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.7);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(251, 146, 60, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(251, 146, 60, 0); }
        }
        .network-pattern {
          background-image: radial-gradient(circle at 2px 2px, rgba(251, 146, 60, 0.15) 1px, transparent 0);
          background-size: 24px 24px;
        }
        .amber-glow {
          filter: drop-shadow(0 0 10px rgba(251, 146, 60, 0.6));
        }
      `}</style>

      {/* Background Circles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-orange-400/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-orange-400/5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-orange-400/20 rounded-full"></div>
      </div>

      <div className="relative z-10 layout-container flex flex-col min-h-screen">
        {/* Main Content */}
        <main className="flex-1 px-6 md:px-12 lg:px-40 py-8 md:py-10 max-w-[1400px] mx-auto w-full pb-20">
          {/* Status Banner */}
          <div className="mb-8 md:mb-12">
            <div className="relative overflow-hidden flex flex-col gap-3 p-8 md:p-10 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm min-h-[200px] justify-center">
              <div className="absolute inset-0 network-pattern opacity-40 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 via-transparent to-orange-400/5 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-orange-400 status-pulse"></div>
                  <p className="text-orange-400 text-xs md:text-sm font-bold tracking-widest uppercase">
                    APPLICATION STATUS:{" "}
                    <span className="bg-orange-400 text-black px-2 py-0.5 rounded ml-1 font-extrabold">
                      UNDER REVIEW
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <span className="material-symbols-outlined text-orange-400 text-2xl md:text-4xl font-bold amber-glow">
                    hourglass_empty
                  </span>
                  <h1 className="text-white text-3xl md:text-5xl font-extrabold leading-tight tracking-tight font-display">
                    Your Application is Under Review
                  </h1>
                </div>

                <p className="text-white/60 text-sm max-w-xl mt-3 leading-relaxed">
                  Thank you for your submission. Our team is carefully reviewing
                  your application and will notify you of the outcome shortly.
                </p>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - 3 cols */}
            <div className="lg:col-span-3 space-y-8 md:space-y-12">
              {/* Daily Sustainability Fact */}
              <section>
                <h2 className="text-white text-xl font-bold mb-4 font-display flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
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
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 inline-block backdrop-blur-md">
                      Carbon Sink Fact
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">
                      Did you know?
                    </h3>
                    <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                      Restoring seagrass can sequester carbon{" "}
                      <span className="text-primary font-bold">
                        35 times faster
                      </span>{" "}
                      than tropical rainforests, making them one of our most
                      potent tools in climate mitigation.
                    </p>
                    <button className="flex items-center gap-2 text-primary font-bold text-sm hover:translate-x-1 transition-transform touch-manipulation">
                      Read full study{" "}
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Research Spotlight */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-xl font-bold font-display flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">
                      science
                    </span>
                    Research Spotlight
                  </h2>
                  <div className="hidden md:flex gap-2">
                    <button className="size-10 rounded border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined text-sm">
                        chevron_left
                      </span>
                    </button>
                    <button className="size-10 rounded border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined text-sm">
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  {researchProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors cursor-pointer group"
                    >
                      <div
                        className="h-40 sm:h-32 rounded-lg bg-center bg-cover mb-4"
                        style={{ backgroundImage: `url(${project.image})` }}
                      ></div>
                      <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                        {project.title}
                      </h4>
                      <p className="text-white/50 text-xs line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column - 1 col (Sidebar) */}
            <aside className="lg:col-span-1 space-y-8">
             
              {/* Challenge Hub */}
              <section>
                <h2 className="text-white text-xl font-bold mb-4 font-display flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    psychology
                  </span>
                  Challenge Hub
                </h2>

                <div className="p-6 md:p-8 lg:p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary text-3xl">
                      quiz
                    </span>
                    <div>
                      <h3 className="font-bold text-lg">Test Your Expertise</h3>
                      <p className="text-white/50 text-xs">
                        Verify your sustainability knowledge
                      </p>
                    </div>
                  </div>

                  <p className="text-white/70 text-sm mb-6 leading-relaxed">
                    Participate in our weekly challenge to unlock early access
                    to premium research datasets.
                  </p>

                  <button className="w-full py-4 px-4 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 touch-manipulation">
                    Start Quiz{" "}
                    <span className="material-symbols-outlined">
                      play_arrow
                    </span>
                  </button>

                  <a
                    href="#"
                    className="block text-center mt-6 text-xs text-white/40 hover:text-primary transition-colors py-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    Explore Public Archive
                  </a>
                </div>
              </section>

              {/* Support */}
              <section>
                <h2 className="text-white text-xl font-bold mb-4 font-display flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    support_agent
                  </span>
                  Support
                </h2>

                <div className="p-6 md:p-8 lg:p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-white/70 text-sm mb-6">
                    Having trouble with your application or need technical
                    assistance? Our team is here to help.
                  </p>

                  <a
                    href="mailto:admin@researchnetwork.io"
                    className="flex items-center justify-center gap-2 w-full py-4 px-4 border border-white/20 hover:bg-white/5 rounded-lg font-bold text-sm transition-colors touch-manipulation"
                  >
                    <span className="material-symbols-outlined text-sm">
                      contact_support
                    </span>
                    Contact Admin
                  </a>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplicationReview;