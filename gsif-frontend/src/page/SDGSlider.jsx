import "../styles/SDGSlider.css";

const sdgs = [
  { id: "01", title: "No Poverty", icon: "volunteer_activism" },
  { id: "02", title: "Zero Hunger", icon: "nutrition" },
  { id: "03", title: "Good Health and Well-being", icon: "favorite" },
  { id: "04", title: "Quality Education", icon: "school" },
  { id: "05", title: "Gender Equality", icon: "diversity_3" },
  { id: "06", title: "Clean Water and Sanitation", icon: "water_drop" },
  { id: "07", title: "Affordable and Clean Energy", icon: "bolt" },
  { id: "08", title: "Decent Work and Economic Growth", icon: "trending_up" },
  { id: "09", title: "Industry, Innovation and Infrastructure", icon: "precision_manufacturing" },
  { id: "10", title: "Reduced Inequalities", icon: "balance" },
  { id: "11", title: "Sustainable Cities and Communities", icon: "location_city" },
  { id: "12", title: "Responsible Consumption and Production", icon: "recycling" },
  { id: "13", title: "Climate Action", icon: "eco" },
  { id: "14", title: "Life Below Water", icon: "tsunami" },
  { id: "15", title: "Life on Land", icon: "forest" },
  { id: "16", title: "Peace, Justice and Strong Institutions", icon: "gavel" },
  { id: "17", title: "Partnerships for the Goals", icon: "handshake" },
];

export default function SDGSlider() {
  const items = [...sdgs, ...sdgs];

  return (
    <section className="sdg-section">
      {/* Heading */}
      <div className="sdg-heading">
        <span className="sdg-label">UN Sustainable Development Goals</span>
        <h2 className="sdg-title">
          Aligned with <span className="sdg-title-accent">Global Goals</span>
        </h2>
        <p className="sdg-subtitle">
          Our research network supports all 17 United Nations SDGs — driving
          science-backed solutions for a sustainable future.
        </p>
      </div>

      {/* Slider */}
      <div className="sdg-slider-wrapper">
        <div className="sdg-fade sdg-fade-left" />
        <div className="sdg-fade sdg-fade-right" />

        <div className="sdg-track">
          {items.map((sdg, index) => (
            <div key={index} className="sdg-card">
              {/* Visual area — icon fills top like an image */}
              <div className="sdg-card-visual">
                <span className="material-symbols-outlined sdg-card-icon">
                  {sdg.icon}
                </span>
                {/* Subtle inner glow orb */}
                <div className="sdg-card-orb" />
              </div>

              {/* Overlay — number + title at bottom left, same as field cards */}
              <div className="sdg-card-overlay">
                <span className="sdg-card-number">{sdg.id}</span>
                <p className="sdg-card-title">{sdg.title}</p>
              </div>

              {/* Neon glow pseudo effect handled in CSS ::after */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}