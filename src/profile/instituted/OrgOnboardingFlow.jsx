import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Step1 from "./OrganizationOnboarding";
import Step2 from "./OrganizationLocation";
import Step3 from "./OrgFocusAreas";
import Step4 from "./OrgGoals";
import Step5 from "./OrgProfileLinks";

const OrgOnboardingFlow = () => {

  const { step } = useParams();
  const navigate = useNavigate();

  const totalSteps = 5;

  // Word → Number mapping
  const stepMap = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
  };

  // Number → Word mapping
  const reverseStepMap = {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
  };

  const currentStep = stepMap[step] || 1;

  // Progress calculation
  const progress = ((currentStep - 1) / totalSteps) * 100;

  // Next Step
  const next = () => {
    if (currentStep < totalSteps) {
      navigate(
        `/organization-onboarding/${reverseStepMap[currentStep + 1]}`
      );
    }
  };

  // Previous Step
  const back = () => {
    if (currentStep > 1) {
      navigate(
        `/organization-onboarding/${reverseStepMap[currentStep - 1]}`
      );
    }
  };

  return (
    <div className="bg-[#10221a] min-h-screen">

      {currentStep === 1 && (
        <Step1 onNext={next} progress={progress} />
      )}

      {currentStep === 2 && (
        <Step2 onNext={next} onBack={back} progress={progress} />
      )}

      {currentStep === 3 && (
        <Step3 onNext={next} onBack={back} progress={progress} />
      )}

      {currentStep === 4 && (
        <Step4 onNext={next} onBack={back} progress={progress} />
      )}

      {currentStep === 5 && (
        <Step5 onNext={next} onBack={back} progress={progress} />
      )}

    </div>
  );
};

export default OrgOnboardingFlow;