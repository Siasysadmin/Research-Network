export const isFilled = (value) => {
  if (Array.isArray(value)) {
    return value.some((item) => isFilled(item));
  }

  if (typeof value === "object" && value !== null) {
    return Object.values(value).some((v) => isFilled(v));
  }

  if (typeof value === "string") {
    const cleaned = value.trim().toLowerCase();

    return (
      cleaned !== "" &&
      cleaned !== "00-00-0000" &&
      cleaned !== "0000-00-00" &&
      cleaned !== "null" &&
      cleaned !== "undefined" &&
      cleaned !== "-"
    );
  }

  return Boolean(value);
};

const toArrayValue = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    const cleaned = value.trim();

    if (
      cleaned === "" ||
      cleaned.toLowerCase() === "null" ||
      cleaned.toLowerCase() === "undefined" ||
      cleaned === "[]"
    ) {
      return [];
    }

    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}

    return [cleaned];
  }

  return [];
};



/* ✅ Individual Profile ke full fields */
export const INDIVIDUAL_PROFILE_FIELDS = [
  "name",
  "email",
  "country",
  "state",
  "city",
  "pincode",

  "describes",
  "developement_goals",
  "current_research",

  "job_role",
  "company",
  "duration",
  "description",

  "interest",

  "linkedin",
  "research_gate",
  "orc_id",
  "personal_website",

  "date_of_birth",
  "short_bio",
  // "language",
  // "location",
  "profile_image",
];

/* ✅ Institute Dashboard + Modal + Edit Profile sabke liye same fields */
export const INSTITUTE_PROFILE_FIELDS = [
  "organization_name",
  "organization_type",
  "country",
  "state",
  "city",
  "address",
  "email",
  "contact_no",
  "name",
  "professional_role",
  "establishment_year",
  "institute_description",
  "research_focus",
  "platform",
  "linkedin",
  "research_gate",
  "orc_id",
  "personal_website",
  "profile_image",
];

export const normalizeInstituteProfile = (profile = {}) => {
  return {
    organization_name:
      profile.organization_name ||
      profile.institute_name ||
      profile.institute_details?.institute_name ||
      profile.profile_institute_details?.organization_name ||
      profile.profile_institute_details?.institute_name ||
      "",

    organization_type:
      profile.organization_type ||
      profile.institute_details?.organization_type ||
      profile.profile_institute_details?.organization_type ||
      "",

    country: profile.country || "",
    state: profile.state || "",
    city: profile.city || "",
    address: profile.address || "",

    email: profile.email || "",
    contact_no: profile.contact_no || "",
    name: profile.name || "",
    professional_role: profile.professional_role || "",
    establishment_year: profile.establishment_year || "",
    institute_description: profile.institute_description || "",

    research_focus: toArrayValue(profile.research_focus),

    platform: toArrayValue(
      profile.platform || profile.developement_goals || profile.goals
    ),

    linkedin: profile.linkedin || "",
    research_gate: profile.research_gate || profile.researchGate || "",
    orc_id: profile.orc_id || profile.orcid || "",
    personal_website: profile.personal_website || profile.website || "",

    profile_image: profile.profile_image || "",
  };
};

export const normalizeIndividualProfile = (profile = {}) => {
  return {
    name: profile.name || "",
    email: profile.email || "",
    country: profile.country || "",
    state: profile.state || "",
    city: profile.city || "",
    pincode: profile.pincode || "",

    describes: profile.describes || "",

    developement_goals: toArrayValue(
      profile.developement_goals || profile.goals
    ),

    current_research: profile.current_research || "",

    job_role: toArrayValue(profile.job_role),
    company: toArrayValue(profile.company),
    duration: toArrayValue(profile.duration),
    description: toArrayValue(profile.description),

    interest: toArrayValue(profile.interest),

    linkedin: profile.linkedin || "",
    research_gate: profile.research_gate || profile.researchGate || "",
    orc_id: profile.orc_id || profile.orcid || "",
    personal_website: profile.personal_website || profile.website || "",

    date_of_birth: profile.date_of_birth || "",
    short_bio: profile.short_bio || "",
    // language: profile.language || "",
    // location: profile.location || "",
    profile_image: profile.profile_image || "",
  };
};

export const calculateByValueCount = (profile = {}, fields = []) => {
  const totalFields = fields.length;

  if (totalFields === 0) return 0;

  const filledFields = fields.filter((field) => isFilled(profile?.[field]));

  console.log("TOTAL FIELDS:", totalFields);
  console.log("FILLED FIELDS:", filledFields);
  console.log(
    "EMPTY FIELDS:",
    fields.filter((field) => !isFilled(profile?.[field]))
  );

  return Math.round((filledFields.length / totalFields) * 100);
};

/* ✅ Individual Dashboard/Edit Profile */
export const calculateIndividualProfileCompletion = (profile = {}) => {
  const normalizedProfile = normalizeIndividualProfile(profile);

  return calculateByValueCount(normalizedProfile, INDIVIDUAL_PROFILE_FIELDS);
};

/* ✅ Institute Dashboard/Edit Profile/Modal sabke liye same */
export const calculateInstituteProfileCompletion = (profile = {}) => {
  const normalizedProfile = normalizeInstituteProfile(profile);

  return calculateByValueCount(normalizedProfile, INSTITUTE_PROFILE_FIELDS);
};

/*
  ✅ Backward compatibility:
  Agar kisi purani file me calculateInstituteOnboardingCompletion import/use ho raha hai,
  to bhi ab ye same dashboard wala percentage dega.
*/
export const calculateInstituteOnboardingCompletion = (profile = {}) => {
  return calculateInstituteProfileCompletion(profile);
};