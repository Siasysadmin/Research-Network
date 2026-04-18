import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";

const IndividualFlow = () => {
  const { step } = useParams();
  const navigate = useNavigate();
  const totalSteps = 6;

  // Mapping words to numbers
  const stepMap = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
  };

  // Reverse mapping numbers to words
  const reverseStepMap = {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
  };

  const currentStep = stepMap[step] || 1;

  const progress = (currentStep / totalSteps) * 100;

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Redirect if step invalid
  useEffect(() => {
    if (!stepMap[step]) {
      navigate("/profile-individual-flow/one");
    }
  }, [step, navigate]);

  const goNext = () => {
    if (currentStep < totalSteps) {
      navigate(
        `/profile-individual-flow/${reverseStepMap[currentStep + 1]}`
      );
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      navigate(
        `/profile-individual-flow/${reverseStepMap[currentStep - 1]}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0f231a]">
      {currentStep === 1 && (
        <Step1 progress={progress} onNext={goNext} />
      )}
      {currentStep === 2 && (
        <Step2 progress={progress} onNext={goNext} onBack={goBack} />
      )}
      {currentStep === 3 && (
        <Step3 progress={progress} onNext={goNext} onBack={goBack} />
      )}
      {currentStep === 4 && (
        <Step4 progress={progress} onNext={goNext} onBack={goBack} />
      )}
      {currentStep === 5 && (
        <Step5 progress={progress} onNext={goNext} onBack={goBack} />
      )}
      {currentStep === 6 && (
        <Step6 progress={progress} onBack={goBack} />
      )}
    </div>
  );
};

export default IndividualFlow;