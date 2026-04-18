import "../styles/Fields.css";
import "../styles/Movement.css";
import heroImg from "../assets/images/hero.png";
import field1Img from "../assets/images/field1.png";
import field2Img from "../assets/images/field2.png";
import field3Img from "../assets/images/field3.png";
import field4Img from "../assets/images/field4.png";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const fields = [
    {
      title: "Sustainable Agriculture & Food System",
      img: field1Img,
    },
    {
      title: "Water Resources and Conversion",
      img: field2Img,
    },
    {
      title: "Climate Change & Environment",
      img: field3Img,
    },
    {
      title: "Circular Economy and Waste Management",
      img: field4Img,
    },
  ];

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-screen bg-black overflow-hidden">
        {/* TOP BAR */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-center z-50">
          {/* LOGO */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-[#00FF88] text-3xl sm:text-4xl md:text-5xl font-black tracking-wider">
              GSIF
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-white text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.15em] sm:tracking-[0.25em]">
                RESEARCH
              </span>
              <span className="text-white text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.15em] sm:tracking-[0.25em]">
                NETWORK
              </span>
            </div>
          </div>

          {/* LOGIN */}
          <button
            onClick={() => navigate("/login")}
            className="px-3 py-1.5 sm:px-5 sm:py-2 border border-[#00FF88] text-[#00FF88] rounded-md font-semibold hover:bg-[#00FF88] hover:text-black transition text-sm sm:text-base"
          >
            Login
          </button>
        </div>

        {/* HERO CONTENT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 items-center min-h-screen">
          {/* LEFT TEXT */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 lg:space-y-8 mt-24 lg:mt-0 text-center lg:text-left z-20 relative">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black leading-tight">
              <span className="text-white">A Global Network for </span>
              <span className="text-[#00FF88]">Sustainability</span>{" "}
              <span className="text-white">Researchers & Institutions</span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto lg:mx-0">
              Publish research, organize events, and connect with sustainability
              leaders through GSIF's collaborative platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 pt-2 sm:pt-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/individual")}
                className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-[#00FF88] text-black font-bold rounded-lg hover:scale-105 transition text-sm sm:text-base"
              >
                Join as Individual
              </button>

              <button
                onClick={() => navigate("/institute")}
                className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-[#00FF88] text-black font-bold rounded-lg hover:scale-105 transition text-sm sm:text-base"
              >
                Join as Institute
              </button>
            </div>
          </div>

          {/* RIGHT IMAGE - PROFESSIONALLY BLENDED */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end mt-12 lg:mt-0 relative z-10">
            {/* Subtle Neon Glow behind the image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[350px] lg:w-[450px] h-[250px] sm:h-[350px] lg:h-[450px] bg-[#00FF88]/20 blur-[100px] rounded-full pointer-events-none" />

            {/* The Image with faded edges using CSS Mask */}
            <img
              src={heroImg}
              alt="GSIF Network"
              className="w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px] object-contain relative z-10 pointer-events-none"
              style={{
                // Fades out the borders of the image smoothly into transparency
                WebkitMaskImage:
                  "radial-gradient(circle at center, black 40%, transparent 75%)",
                maskImage:
                  "radial-gradient(circle at center, black 40%, transparent 75%)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ================= About SECTION ================= */}
      <section id="about" className="py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden bg-black relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20 items-center">
            {/* Left Content */}
            <div className="space-y-8 lg:space-y-12">
              <div className="space-y-4 lg:space-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-center lg:text-left">
                  About <span className="text-[#00FF88]">GSIF</span>{" "}
                  <span className="text-white">Research Network</span>
                </h2>

                <p className="text-slate-400 text-base sm:text-lg md:text-xl leading-relaxed text-center lg:text-left">
                  The GSIF Research Network exists to bridge the gap between
                  individual researchers and research institutions by offering a
                  trusted space for collaboration, visibility, and knowledge
                  exchange.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:gap-8">
                {/* Mission */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 group text-center sm:text-left">
                  <div className="flex justify-center sm:justify-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#00FF88]/10 flex items-center justify-center border border-[#00FF88]/20 group-hover:bg-[#00FF88]/20 transition-colors">
                      <span className="material-symbols-outlined text-[#00FF88] text-xl sm:text-2xl">
                        rocket_launch
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="text-lg sm:text-xl font-bold">
                      Our Mission
                    </h4>
                    <p className="text-slate-500 text-sm sm:text-base">
                      Our mission is to support and empower
                      sustainability-focused researchers and research
                      institutions by providing a centralized digital platform
                      for publishing, discovering, and sharing impactful
                      research.
                    </p>
                  </div>
                </div>

                {/* Vision */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 group text-center sm:text-left">
                  <div className="flex justify-center sm:justify-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#00FF88]/10 flex items-center justify-center border border-[#00FF88]/20 group-hover:bg-[#00FF88]/20 transition-colors">
                      <span className="material-symbols-outlined text-[#00FF88] text-xl sm:text-2xl">
                        visibility
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="text-lg sm:text-xl font-bold">Our Vision</h4>
                    <p className="text-slate-500 text-sm sm:text-base">
                      Our vision is to build the world's leading global research
                      network dedicated to sustainability. We envision a
                      connected ecosystem where researchers and institutions
                      across the world collaborate seamlessly, exchange
                      knowledge freely, and contribute collectively to solving
                      environmental and social challenges.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="relative mt-8 lg:mt-0">
              <div className="absolute -inset-4 bg-[#00FF88]/5 rounded-[3rem] blur-3xl"></div>

              <div className="relative p-1 bg-gradient-to-br from-[#00FF88]/30 to-transparent rounded-2xl sm:rounded-3xl">
                <div className="bg-[#0a0a0a] rounded-xl sm:rounded-[1.4rem] p-6 sm:p-8 lg:p-12 space-y-6 lg:space-y-8 border border-white/5">
                  <div className="space-y-3 sm:space-y-4">
                    <span className="text-[#00FF88] font-bold uppercase tracking-widest text-xs sm:text-sm block text-center lg:text-left">
                      Our Impact
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold leading-tight text-center lg:text-left">
                      Where Research Drives Change
                    </h3>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed italic text-center lg:text-left">
                      “Through the GSIF Research Network, we are building a
                      growing global ecosystem that supports
                      sustainability-focused research and collaboration”
                    </p>

                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed text-center lg:text-left">
                      By centralizing sustainability-focused studies and
                      fostering collaboration, the platform contributes to
                      informed decision-making and meaningful global
                      sustainability outcomes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHO CAN JOIN SECTION ================= */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-white/5 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Heading */}
          <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase">
              Who Can Join?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed px-4">
              Open to individual researchers and institutions working toward
              sustainability
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* Individual Researcher */}
            <div className="group relative p-1 border-2 border-[#00FF88] rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-500 hover:bg-gradient-to-br hover:from-[#00FF88]/40 hover:to-transparent">
              <div className="h-full bg-black rounded-[1.4rem] sm:rounded-[1.85rem] p-6 sm:p-8 lg:p-10 flex flex-col items-center text-center space-y-4 sm:space-y-6 transition-all duration-500 group-hover:bg-black/90">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-[#00FF88]/20 group-hover:shadow-[0_0_30px_rgba(0,255,136,0.2)]">
                  <span className="material-symbols-outlined text-[#00FF88] text-3xl sm:text-4xl lg:text-5xl">
                    person_search
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-4">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    Individual Researcher
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    Perfect for academics, PhD candidates, and independent
                    scientists. Build your personal brand, connect with global
                    peers, and access a vast library of sustainability data to
                    fuel your personal discoveries.
                  </p>
                </div>

                <ul className="text-left text-slate-500 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00FF88] text-sm">
                      check_circle
                    </span>
                    Personal research portfolio
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00FF88] text-sm">
                      check_circle
                    </span>
                    Peer-to-peer collaboration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00FF88] text-sm">
                      check_circle
                    </span>
                    Global visibility for your work
                  </li>
                </ul>
              </div>
            </div>

            {/* Institute Researcher */}
            <div className="group relative p-1 border-2 border-[#00FF88] rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-500 hover:bg-gradient-to-br hover:from-[#00FF88]/40 hover:to-transparent">
              <div className="h-full bg-black rounded-[1.4rem] sm:rounded-[1.85rem] p-6 sm:p-8 lg:p-10 flex flex-col items-center text-center space-y-4 sm:space-y-6 transition-all duration-500 group-hover:bg-black/90">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-[#00FF88]/20 group-hover:shadow-[0_0_30px_rgba(0,255,136,0.2)]">
                  <span className="material-symbols-outlined text-[#00FF88] text-3xl sm:text-4xl lg:text-5xl">
                    account_balance
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-4">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    Institute Researcher
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    Tailored for academic institutions, universities, and
                    dedicated research centers. Facilitate large-scale research
                    projects, manage multiple researcher profiles, and elevate
                    your institution's global scientific impact.
                  </p>
                </div>

                <ul className="text-left text-slate-500 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00FF88] text-sm">
                      check_circle
                    </span>
                    Centralized research group management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00FF88] text-sm">
                      check_circle
                    </span>
                    Institutional publication oversight
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00FF88] text-sm">
                      check_circle
                    </span>
                    Grant and funding opportunity aggregation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Background Glow */}
        <div className="absolute -bottom-20 -right-20 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-[#00FF88]/5 blur-[60px] sm:blur-[80px] lg:blur-[120px] rounded-full"></div>
      </section>

      {/* ================= RESEARCH ECOSYSTEM SECTION ================= */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight uppercase">
              OUR RESEARCH ECOSYSTEM
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed px-4">
              Our platform brings researchers and institutions together to
              publish, discover, and collaborate on sustainability-focused
              research.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: "publish",
                title: "Research Publishing Platform",
                desc: "A centralized space for individuals and institutions to publish sustainability-focused research with structured metadata, ensuring global visibility and accessibility.",
              },
              {
                icon: "library_books",
                title: "Research Discovery & Library",
                desc: "An organized research library that allows users to explore, search, and filter sustainability research across disciplines, institutions, and regions.",
              },
              {
                icon: "account_circle",
                title: "Researcher & Institute Profiles",
                desc: "Dedicated profiles that showcase researcher expertise and institutional contributions, helping build credibility, visibility, and collaboration opportunities.",
              },
              {
                icon: "handshake",
                title: "Collaboration & Networking",
                desc: "Tools that enable researchers and institutions to connect, communicate, and collaborate with peers working on similar sustainability challenges.",
              },
              {
                icon: "public",
                title: "Global Research Visibility",
                desc: "A platform that amplifies the reach of sustainability research by connecting local studies to a global audience focused on environmental and social impact.",
              },
              {
                icon: "notifications",
                title: "Smart Notifications & Updates",
                desc: "Timely alerts that keep users informed about research activity, collaboration opportunities, and platform updates.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 sm:p-8 lg:p-10 rounded-2xl bg-gradient-to-br from-black to-slate-900 border-2 border-[#00FF88]/50 shadow-inner shadow-[#00FF88]/20 transition-all neon-glow-hover group"
              >
                <div className="mb-4 sm:mb-6 lg:mb-8 block">
                  <span className="material-symbols-outlined text-[#00FF88] text-3xl sm:text-4xl lg:text-5xl">
                    {item.icon}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= RESEARCH STEPS SECTION ================= */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 lg:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6">
              How Research Moves Forward
            </h2>
            <p className="text-slate-400 text-base sm:text-lg md:text-xl leading-relaxed px-4">
              A streamlined journey to connect, discover, and share impactful
              research.
            </p>
          </div>

          <div className="max-w-5xl mx-auto flex flex-col gap-8 sm:gap-12 lg:gap-16">
            {[
              {
                step: 1,
                title: "Create Your Profile",
                desc: "Build a detailed researcher or institute profile highlighting expertise and research interests.",
              },
              {
                step: 2,
                title: "Discover Opportunities",
                desc: "Explore relevant projects, collaborations, and research networks in your domain.",
              },
              {
                step: 3,
                title: "Connect & Collaborate",
                desc: "Reach out to peers, join teams, and engage in meaningful research partnerships.",
              },
              {
                step: 4,
                title: "Share Insights & Advance Research",
                desc: "Contribute findings, publish updates, and track your research impact effortlessly.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`relative ${i !== 3 ? "step-connector" : ""}`}
              >
                <div
                  className="p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl bg-black 
  border-2 border-white/10
  flex flex-col md:flex-row items-center gap-6 sm:gap-8 lg:gap-12 group
  transition-all duration-500
  hover:border-[#00FF88]
  hover:shadow-[0_0_30px_rgba(0,255,163,0.35)]"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl bg-[#00FF88] text-black flex items-center justify-center text-2xl sm:text-3xl lg:text-5xl font-black flex-shrink-0 neon-glow overflow-hidden">
                    <span className="relative z-10">{item.step}</span>
                  </div>

                  <div className="space-y-2 sm:space-y-3 lg:space-y-4 text-center md:text-left">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold">
                      Step {item.step}: {item.title}
                    </h3>
                    <p className="text-slate-400 text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FIELDS SECTION ================= */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-[#00FF88]/5 border-y border-[#00FF88]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="space-y-10 lg:space-y-16">
            <div className="space-y-3 sm:space-y-4 lg:space-y-6 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">
                Built for Every Field
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-400 leading-relaxed max-w-4xl mx-auto lg:mx-0">
                Our platform supports sustainability research across diverse
                disciplines, enabling interdisciplinary collaboration and global
                impact
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className="field-card relative aspect-[4/3] rounded-xl sm:rounded-2xl lg:rounded-3xl group cursor-pointer"
                >
                  <img
                    src={field.img}
                    alt={field.title}
                    className="w-full h-full object-cover grayscale opacity-60 transition-all duration-1000 group-hover:grayscale-0 rounded-xl sm:rounded-2xl lg:rounded-3xl"
                  />
                  <div className="overlay absolute inset-0 flex items-end p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl">
                    <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold">
                      {field.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= RESEARCH MOVEMENT SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="rounded-2xl sm:rounded-3xl lg:rounded-[3rem] bg-gradient-to-br from-[#00FF88]/20 via-black to-black border border-[#00FF88]/20 p-6 sm:p-8 md:p-12 lg:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 rounded-2xl sm:rounded-3xl lg:rounded-[3rem] blur-[40px] sm:blur-[60px] lg:blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black leading-snug tracking-tight break-words">
              Be part of a global sustainability research movement
            </h2>

            <p className="text-slate-400 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
              Contribute to global sustainability research, collaborate across
              disciplines, and create real-world environmental and social impact
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6 pt-2 sm:pt-3 lg:pt-4">
              {/* Buttons */}
              <button
                className="w-full sm:w-auto px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-[#00FF88] text-black font-bold rounded-lg hover:scale-105 transition text-sm sm:text-base"
                onClick={() => navigate("/individual")}
              >
                Join as Individual
              </button>

              <button
                className="w-full sm:w-auto px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-[#00FF88] text-black font-bold rounded-lg hover:scale-105 transition text-sm sm:text-base"
                onClick={() => navigate("/institute")}
              >
                Join as Institute
              </button>
            </div>
          </div>
        </div>
      </section>

     {/* ================= FOOTER ================= */}
      <footer className="bg-black border-t border-white/10 px-8 py-14">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 text-center">

          {/* Logo - Center */}
          <div>
            <p className="text-2xl sm:text-3xl font-black tracking-widest">
              <span className="text-[#00FF88]">GSIF </span>
              <span className="text-white">RESEARCH NETWORK</span>
            </p>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-6 sm:gap-10 flex-wrap justify-center">
          <button
  onClick={() => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  }}
  className="text-slate-400 hover:text-[#00FF88] text-sm sm:text-base font-medium transition-colors"
>
  About Us
</button>
           <Link to="/privacy" className="text-slate-400 hover:text-[#00FF88] text-sm sm:text-base font-medium transition-colors">Privacy Policy</Link>
           <Link to="/terms" className="text-slate-400 hover:text-[#00FF88] text-sm sm:text-base font-medium transition-colors">Terms & Conditions</Link>
            <span className="text-slate-400 text-sm sm:text-base font-medium">
              Contact: <span className="text-[#00FF88] font-semibold">research@gsif.org</span>
            </span>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-white/10 pt-4">
            <p className="text-slate-500 text-sm">
              © 2024 GSIF Research Network. All rights reserved.
            </p>
          </div>

        

        </div>
      </footer>
    </>
  );
}
