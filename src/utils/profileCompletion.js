export const isFilled = (value) => {
  if (Array.isArray(value)) {
    return value.some((item) => {
      if (typeof item === "string") return item.trim() !== "";
      return Boolean(item);
    });
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

export const calculateIndividualProfileCompletion = (profile) => {
  let percent = 0;

  // Steps 1-5 = 80%
  const mainStepFields = [
    "describes",
    "developement_goals",
    "current_research",
    "job_role",
    "interest",
  ];

  const mainCompleted = mainStepFields.filter((field) =>
    isFilled(profile?.[field])
  ).length;

  percent += Math.round((mainCompleted / mainStepFields.length) * 80);

  // Step 6 = 4 links divided inside same step
  const linkFields = [
    "linkedin",
    "research_gate",
    "orc_id",
    "personal_website",
  ];

  const linkCompleted = linkFields.filter((field) =>
    isFilled(profile?.[field])
  ).length;

  // Step 6 ka weight = 1 step jaisa = 80 / 6
  const step6Weight = 80 / 6;
  percent += Math.round((linkCompleted / linkFields.length) * step6Weight);

  // Edit Profile = 20%
  const editProfileFields = [
    "profile_image",
    "date_of_birth",
    "short_bio",
  ];

  const editCompleted = editProfileFields.filter((field) =>
    isFilled(profile?.[field])
  ).length;

  percent += Math.round((editCompleted / editProfileFields.length) * 20);

  return Math.min(percent, 100);
};

export const calculateInstituteProfileCompletion = (profile) => {
  let percent = 0;

  // Step 1-4 = 64% => 16% each
  const mainStepFields = [
    "organization_type",
    "research_focus",
    "developement_goals",
    "interest",
  ];

  const mainCompleted = mainStepFields.filter((field) =>
    isFilled(profile?.[field])
  ).length;

  percent += Math.round((mainCompleted / mainStepFields.length) * 64);

  // Step 5 links = 16%
  const linkFields = [
    "linkedin",
    "research_gate",
    "orc_id",
    "personal_website",
  ];

  const linkCompleted = linkFields.filter((field) =>
    isFilled(profile?.[field])
  ).length;

  percent += Math.round((linkCompleted / linkFields.length) * 16);

  // Edit profile = 20%
  const editProfileFields = [
    "profile_image",
    "short_bio",
    "establishment_year",
  ];

  const editCompleted = editProfileFields.filter((field) =>
    isFilled(profile?.[field])
  ).length;

  percent += Math.round((editCompleted / editProfileFields.length) * 20);

  return Math.min(percent, 100);
};