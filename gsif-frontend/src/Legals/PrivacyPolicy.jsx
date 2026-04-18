import React from "react";

const PrivacyPolicy = () => {
  return (
    <div
      className="min-h-screen px-8 py-12"
      style={{ background: "#0d0d0d", color: "#c8d8d0" }}
    >
      <div className="max-w-3xl mx-auto">

        {/* ── Badge ── */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#00ffae" }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#00ffae" }}
          >
            Legal Documentation
          </span>
        </div>

        {/* ── Main Title ── */}
        <h1
          className="font-bold mb-3"
          style={{ color: "#ffffff", fontSize: "3rem", lineHeight: 1.1, letterSpacing: "-0.02em" }}
        >
          Privacy Policy
        </h1>

        {/* ── Last Updated ── */}
        <p className="text-sm mb-12" style={{ color: "#4d6b5c" }}>
          Last Updated: October 2024
        </p>

        {/* ── Sections ── */}
        <Section title="1. Introduction">
          This Privacy Policy explains how the GSIF Research Network collects, uses, stores, and
          protects your personal information. By using our platform, you agree to this policy.
        </Section>

        <Section title="2. About GSIF">
          The Global Sustainable Impact Foundation (GSIF) is a non-profit organization focused on
          sustainability, innovation, and global impact initiatives.
        </Section>

        <Section title="3. About the GSIF Research Network">
          A digital platform connecting researchers and institutes to publish research, share posts,
          collaborate, and participate in sustainability initiatives.
        </Section>

        <Section title="4. Who This Policy Applies To">
          <ul className="list-none space-y-2 mt-1">
            <ListItem>Individual Researchers</ListItem>
            <ListItem>Research Institutes (subject to admin approval)</ListItem>
          </ul>
        </Section>

        <Section title="5. Information We Collect">
          <SubTitle text="a) Individual Researcher" />
          <ul className="list-none space-y-2 mt-1 mb-4">
            <ListItem>Full Name, Email</ListItem>
            <ListItem>Location details</ListItem>
            <ListItem>Encrypted Password</ListItem>
            <ListItem>Research interests, background</ListItem>
          </ul>

          <SubTitle text="b) Research Institute" />
          <ul className="list-none space-y-2 mt-1 mb-4">
            <ListItem>Institute details & contact info</ListItem>
            <ListItem>Representative details</ListItem>
            <ListItem>Encrypted Password</ListItem>
          </ul>

          <SubTitle text="c) Activity Data" />
          <ul className="list-none space-y-2 mt-1 mb-4">
            <ListItem>Research uploads (PDF)</ListItem>
            <ListItem>Posts (images, articles, etc.)</ListItem>
            <ListItem>Likes, comments, shares</ListItem>
            <ListItem>Chat messages & events</ListItem>
          </ul>

          <SubTitle text="d) Technical Data" />
          <p className="text-sm leading-7" style={{ color: "#c8d8d0" }}>
            IP address, browser, device info, and usage behavior.
          </p>
        </Section>

        <Section title="6. Cookies & Tracking">
          We use cookies to maintain sessions, remember preferences, and improve performance.
          Disabling cookies may affect functionality.
        </Section>

        <Section title="7. How We Use Your Information">
          <ul className="list-none space-y-2 mt-1">
            <ListItem>Account management</ListItem>
            <ListItem>Research publishing & interaction</ListItem>
            <ListItem>User communication</ListItem>
            <ListItem>Platform improvement & security</ListItem>
          </ul>
        </Section>

        <Section title="8. How We Protect Your Data">
          <ul className="list-none space-y-2 mt-1 mb-3">
            <ListItem>Encrypted storage</ListItem>
            <ListItem>Access control systems</ListItem>
            <ListItem>Monitoring & security checks</ListItem>
          </ul>
          <p className="text-xs leading-6" style={{ color: "#4d6b5c" }}>
            Note: No system is 100% secure, but we take all reasonable measures.
          </p>
        </Section>

        <Section title="9. Data Sharing">
          We do not sell user data. Sharing happens only for legal, operational, or security purposes.
        </Section>

        <Section title="10. Data Retention">
          Data is retained while your account is active and removed upon deletion, unless legally required.
        </Section>

        <Section title="11. Changes to This Policy">
          We may update this policy. Continued use means acceptance of updates.
        </Section>

        <Section title="12. Contact Us">
          <div className="space-y-1 text-sm leading-7" style={{ color: "#c8d8d0" }}>
            <p>Global Sustainable Impact Foundation (GSIF)</p>
            <p>Website: —</p>
            <p>Email: —</p>
            <p>Support: —</p>
          </div>
        </Section>

      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2
      className="text-xl font-bold mb-4"
      style={{ color: "#00ffae" }}
    >
      {title}
    </h2>
    <div className="text-sm leading-7" style={{ color: "#c8d8d0" }}>
      {children}
    </div>
  </div>
);

const SubTitle = ({ text }) => (
  <h3
    className="text-sm font-semibold mt-4 mb-2"
    style={{ color: "#7dbf9e" }}
  >
    {text}
  </h3>
);

const ListItem = ({ children }) => (
  <li className="flex items-start gap-2 text-sm" style={{ color: "#c8d8d0" }}>
    <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#00ffae" }} />
    {children}
  </li>
);

export default PrivacyPolicy;