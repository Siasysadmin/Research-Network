import React from "react";

const TermsConditions = () => {
  return (
    <div
      className="
min-h-screen px-8 py-12

bg-white text-slate-800
dark:bg-[#0d0d0d] dark:text-[#c8d8d0]
"
    >
      <div className="max-w-3xl mx-auto">
        {/* ── Badge ── */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#00ffae]" />

          <span
            className="
text-xs font-semibold uppercase tracking-widest
text-green-600
dark:text-[#00ffae]
"
          >
            Legal Documentation
          </span>
        </div>

        {/* ── Main Title ── */}
        <h1
          className="
font-bold mb-3 text-4xl leading-tight tracking-tight

text-slate-900
dark:text-white
"
        >
          Terms & Conditions
        </h1>

        {/* ── Last Updated ── */}
        <p
          className="
text-sm mb-12
text-slate-500
dark:text-[#4d6b5c]
"
        >
          Last Updated: October 2026
        </p>

        {/* ── Sections ── */}
        <Section title="1. Definitions">
          <ul className="list-none space-y-2 mt-1">
            <ListItem>
              <span className="text-green-600 dark:text-[#00ffae] font-medium">
                "GSIF"
              </span>{" "}
              — Global Sustainable Impact Foundation
            </ListItem>
            <ListItem>
              <span className="text-green-600 dark:text-[#00ffae] font-medium">
                "Platform"
              </span>{" "}
              — GSIF Research Network website
            </ListItem>
            <ListItem>
              <span className="text-green-600 dark:text-[#00ffae] font-medium">
                "Individual Researcher"
              </span>{" "}
              — Independent user
            </ListItem>
            <ListItem>
              <span className="text-green-600 dark:text-[#00ffae] font-medium">
                "Research Institute"
              </span>{" "}
              — Registered organization
            </ListItem>
            <ListItem>
              <span className="text-green-600 dark:text-[#00ffae] font-medium">
                "Representative"
              </span>{" "}
              — Institute account manager
            </ListItem>
            <ListItem>
              <span className="text-green-600 dark:text-[#00ffae] font-medium">
                "Research Publication"
              </span>{" "}
              — Uploaded PDF research
            </ListItem>
            <ListItem>
              <span className="text-green-600 dark:text-[#00ffae] font-medium">
                "Post"
              </span>{" "}
              — Article, image, video, etc.
            </ListItem>
            <ListItem>
              <span className="text-green-600 dark:text-[#00ffae] font-medium">
                "Event"
              </span>{" "}
              — Sustainability-related events
            </ListItem>
            <ListItem>
              <span className="text-green-600 dark:text-[#00ffae] font-medium">
                "Chat"
              </span>{" "}
              — Messaging feature
            </ListItem>
            <ListItem>
              <span className="text-green-600 dark:text-[#00ffae] font-medium">
                "Admin"
              </span>{" "}
              — Platform moderators
            </ListItem>
          </ul>
        </Section>

        <Section title="2. Acceptance of Terms">
          By using this platform, you confirm that you are at least 18 years old
          and agree to comply with these Terms. Continued use means acceptance
          of any updates.
        </Section>

        <Section title="3. User Registration">
          <div className="space-y-2 mt-1 text-slate-700 dark:text-[#c8d8d0]">
            <p>
              <span className="text-green-600 dark:text-[#7dbf9e] font-semibold">
                Individual Researcher:
              </span>{" "}
              Registration + 6-step profile setup required.
            </p>

            <p>
              <span className="text-green-600 dark:text-[#7dbf9e] font-semibold">
                Research Institute:
              </span>{" "}
              Requires admin approval + 5-step setup.
            </p>

            <p>
              <span className="text-green-600 dark:text-[#7dbf9e] font-semibold">
                Account Responsibility:
              </span>{" "}
              Users are responsible for their login credentials and activities.
            </p>
          </div>
        </Section>

        <Section title="4. User Conduct & Acceptable Use">
          <p className="mb-3">
            Users may upload research, create posts, interact, and use chat
            features.
          </p>
          <ul className="list-none space-y-2">
            <ListItem>No plagiarized or false content</ListItem>
            <ListItem>No abusive or offensive posts</ListItem>
            <ListItem>No impersonation or harassment</ListItem>
            <ListItem>No spam or illegal activity</ListItem>
          </ul>
        </Section>

        <Section title="5. Research Publications">
          Users can upload research in PDF format. GSIF does not verify
          scientific accuracy; platform is for sharing and discovery.
        </Section>

        <Section title="6. Posts & User Interactions">
          Users can create posts and interact via likes, comments, shares, and
          saves. Content must be respectful and relevant.
        </Section>

        <Section title="7. Events">
          Events may be organized by GSIF or approved users. Admin approval is
          required for third-party events.
        </Section>

        <Section title="8. Chat & Messaging">
          Chat must be used for professional communication. Abuse or spam is
          prohibited.
        </Section>

        <Section title="9. Intellectual Property">
          Users retain ownership of content but grant GSIF rights to display it.
          Platform assets belong to GSIF.
        </Section>

        <Section title="10. Privacy">
          User data is handled securely. Refer to Privacy Policy for full
          details.
        </Section>

        <Section title="11. Disclaimer & Limitation of Liability">
          Platform is provided "as is". GSIF is not responsible for data loss or
          user content accuracy.
        </Section>

        <Section title="12. Termination">
          Accounts may be suspended or terminated for violations.
        </Section>

        <Section title="13. Governing Law">
          These Terms are governed by the laws of India.
        </Section>

        <Section title="14. Contact Us">
          <div className="space-y-1 text-sm leading-7">
            <p>
              Email:{" "}
              <span className="text-green-600 dark:text-[#00ffae]">
connect@gsi.foundation
              </span>
            </p>
            <p>
              Support:{" "}
              <span className="text-green-600 dark:text-[#00ffae]">
srnsupport@gsi.foundation
              </span>
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2
      className="
text-xl font-bold mb-4 
text-green-700
dark:text-[#00ffae]
"
    >
      {title}
    </h2>

    <div
      className="
    text-sm leading-7
    text-slate-700
    dark:text-[#c8d8d0]
    "
    >
      {children}
    </div>
  </div>
);

const ListItem = ({ children }) => (
  <li
    className="
    flex items-start gap-2 text-sm
    text-slate-700
    dark:text-[#c8d8d0]
    "
  >
    <span
      className="
      mt-2 w-1 h-1 rounded-full
      bg-slate-400
      dark:bg-[#00ffae]
      "
    />
    {children}
  </li>
);
export default TermsConditions;
