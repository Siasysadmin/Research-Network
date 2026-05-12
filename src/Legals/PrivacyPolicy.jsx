import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen px-8 py-12 bg-white text-slate-800 dark:bg-[#0d0d0d] dark:text-[#c8d8d0]">
      
      <div className="max-w-3xl mx-auto">

        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-[#00ffae]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-green-600 dark:text-[#00ffae]">
            Legal Documentation
          </span>
        </div>

        {/* Title */}
       <h1 className="text-4xl font-bold mb-3 tracking-tight 
text-slate-900 dark:text-white">
  Privacy Policy
</h1>

        {/* Date */}
        <p className="text-sm mb-12 text-slate-500 dark:text-[#4d6b5c]">
          Last Updated: October 2024
        </p>

        {/* Sections */}
        <Section title="1. Introduction">
          This Privacy Policy explains how the GSIF Research Network collects, uses, stores, and
          protects your personal information.
        </Section>

        <Section title="2. About GSIF">
          The Global Sustainable Impact Foundation (GSIF) is a non-profit organization focused on
          sustainability and innovation.
        </Section>

        <Section title="3. About the Platform">
          A digital platform connecting researchers and institutes.
        </Section>

        <Section title="4. Who This Policy Applies To">
          <ul className="space-y-2 mt-1">
            <ListItem>Individual Researchers</ListItem>
            <ListItem>Research Institutes</ListItem>
          </ul>
        </Section>

        <Section title="5. Information We Collect">
          <SubTitle text="a) Individual Researcher" />
          <ul className="space-y-2 mt-1 mb-4">
            <ListItem>Full Name, Email</ListItem>
            <ListItem>Location details</ListItem>
          </ul>

          <SubTitle text="b) Technical Data" />
          <p className="text-sm leading-7 text-slate-700 dark:text-[#c8d8d0]">
            IP address, browser, device info, and usage behavior.
          </p>
        </Section>

        <Section title="6. Cookies">
          We use cookies to improve experience.
        </Section>

        <Section title="7. Contact Us">
          <div className="space-y-1 text-sm">
            <p>Global Sustainable Impact Foundation</p>
            <p>Email: — connect@gsi.foundation</p>
          </div>
        </Section>

      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="
      text-xl font-bold mb-4 
      text-green-700 dark:text-[#00ffae]
    ">
      {title}
    </h2>

    <div className="text-sm leading-7 text-slate-700 dark:text-[#c8d8d0]">
      {children}
    </div>
  </div>
);

const SubTitle = ({ text }) => (
  <h3 className="
    text-sm font-semibold mt-4 mb-2 
    text-green-600 dark:text-[#7dbf9e]
  ">
    {text}
  </h3>
);

const ListItem = ({ children }) => (
  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-[#c8d8d0]">
    <span className="mt-2 w-1 h-1 rounded-full 
    bg-green-600 dark:bg-[#00ffae]" />
    {children}
  </li>
);
export default PrivacyPolicy;