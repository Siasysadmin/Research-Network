import React, { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import API_CONFIG from "../config/api.config";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const RequiredStar = () => <span className="text-red-500 ml-1">*</span>;

// TypeOfImpact Component
const TypeOfImpact = ({ formData, setFormData, errors }) => {
  const handleImpactChange = (value) => {
    setFormData((prev) => {
      const alreadySelected = prev.impactTypes.includes(value);

      if (alreadySelected) {
        return {
          ...prev,
          impactTypes: prev.impactTypes.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          impactTypes: [...prev.impactTypes, value],
        };
      }
    });
  };

  return (
    <div className="space-y-4 mt-6">
      <label className="block text-sm font-medium text-slate-300">
        Type of Impact
      </label>
      <div className="flex flex-wrap gap-6">
        {/* Environmental */}
        <label className="flex items-center gap-2 cursor-pointer group rounded- transition-all">
          <input
            type="checkbox"
            value="environmental"
            checked={formData.impactTypes.includes("environmental")}
            onChange={() => handleImpactChange("environmental")}
            className="w-4 h-4 rounded text-[#32ff99] bg-white/5 border-white/10 focus:ring-[#32ff99]"
          />
          <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
            Environmental
          </span>
        </label>

        {/* Social */}
        <label className="flex items-center gap-2 cursor-pointer group rounded-lg transition-all">
          <input
            type="checkbox"
            value="social"
            checked={formData.impactTypes.includes("social")}
            onChange={() => handleImpactChange("social")}
            className="w-4 h-4 rounded text-[#32ff99] bg-white/5 border-white/10 focus:ring-[#32ff99]"
          />
          <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
            Social
          </span>
        </label>

        {/* Economic */}
        <label className="flex items-center gap-2 cursor-pointer group rounded-lg transition-all">
          <input
            type="checkbox"
            value="economic"
            checked={formData.impactTypes.includes("economic")}
            onChange={() => handleImpactChange("economic")}
            className="w-4 h-4 rounded text-[#32ff99] bg-white/5 border-white/10 focus:ring-[#32ff99]"
          />
          <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
            Economic
          </span>
        </label>
      </div>
      {errors.impactTypes && (
        <p className="text-red-500 text-xs mt-1">{errors.impactTypes}</p>
      )}
    </div>
  );
};

// Review Status Modal Component
const ReviewStatusModal = ({ researchId, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[#32ff99]/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#32ff99]/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[#32ff99] text-2xl">
                assessment
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Under Review</h3>
<p className="text-xs text-slate-400">Research ID: {researchId}</p>            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Message */}
          <div className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              Your research profile is currently under review by our board members.
            </p>

            {/* Board Members Review Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#32ff99] text-lg flex-shrink-0 mt-0.5">
                  groups
                </span>
                <div>
                  <p className="text-sm font-medium text-white">Board Review</p>
                  <p className="text-xs text-slate-400 mt-1">
                    5 board members will evaluate your research
                  </p>
                </div>
              </div>
            </div>

            {/* Approval Requirement */}
            <div className="bg-white/5 border border-[#32ff99]/20 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#32ff99] text-lg flex-shrink-0 mt-0.5">
                  check_circle
                </span>
                <div>
                  <p className="text-sm font-medium text-white">Approval Requirement</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Your research will be made public only after 3 or more board members approve it
                  </p>
                </div>
              </div>
            </div>

            {/* Rejection Policy */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-500 text-lg flex-shrink-0 mt-0.5">
                  info
                </span>
                <div>
                  <p className="text-sm font-medium text-white">If Rejected</p>
                  <p className="text-xs text-slate-400 mt-1">
                    You will have 2 chances to reupload and resubmit the same research for approval
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Info */}
          <div className="bg-[#32ff99]/10 border border-[#32ff99]/20 rounded-xl p-3">
            <p className="text-xs text-slate-300 text-center">
              You will be notified once the review is complete
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#32ff99] hover:bg-[#32ff99]/90 text-black px-4 py-2.5 rounded-lg font-semibold text-sm transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

const ResearchUploadForm = () => {
  const [isIndividualUser, setIsIndividualUser] = useState(false);
  const [formData, setFormData] = useState(()=> {
      const savedData = localStorage.getItem("researchForm");

  return savedData
    ? JSON.parse(savedData)
    : {
    title: "",
    type: "",
    language: "",
    languageInput: "", // Adedd for custom language
    abstract: "",
    keywords: [],
    year: "",
    status: "",
    geography: "",
    district: "",
    state: "",
    country: "",
    primaryAuthor: "",
    coAuthors: [],
    sdgGoals: [],
    impactTypes: [],
    methodology: [],
    simpleSize: "",
    dataType: "",
    declaration: "",
    file: null,
    };
  });

  const [errors, setErrors] = useState({});
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [coAuthorInput, setCoAuthorInput] = useState("");
  const [showSdgDropdown, setShowSdgDropdown] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [declaration1, setDeclaration1] = useState(false);
  const [declaration2, setDeclaration2] = useState(false);

  // State for upload status
  const [uploadStatus, setUploadStatus] = useState({
    loading: false,
    success: false,
    error: null,
    researchId: null,
  });

  // State for review status modal
  const [showReviewModal, setShowReviewModal] = useState(false);

  // State for SDG goals
  const [sdgGoals, setSdgGoals] = useState([]);
  const [loadingSdg, setLoadingSdg] = useState(true);
  const [sdgError, setSdgError] = useState(null);

  // Function to get auth token
  const getAuthToken = () => {
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("authToken") ||
      sessionStorage.getItem("token");

    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.token) return user.token;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    return token;
  };

  // Fetch SDG goals from API
  useEffect(() => {
    const fetchSdgGoals = async () => {
      try {
        setLoadingSdg(true);
        setSdgError(null);

        const token = getAuthToken();

        if (!token) {
          throw new Error(
            "No authentication token found. Please log in again.",
          );
        }

        const apiUrl = `${API_CONFIG.BASE_URL}/research/get-sdg-goals`;
        console.log("Fetching from URL:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (result.status && Array.isArray(result.data)) {
          const formattedGoals = result.data.map((goal) => ({
            id: goal.id,
            title: goal.goals,
          }));
          setSdgGoals(formattedGoals);
        } else {
          throw new Error(result.message || "Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching SDG goals:", err);
        setSdgError(err.message);
      } finally {
        setLoadingSdg(false);
      }
    };

    fetchSdgGoals();
  }, []);

  // Save primary author ID to localStorage when it changes
  useEffect(() => {
    if (formData.primaryAuthor) {
      localStorage.setItem("primaryAuthorId", formData.primaryAuthor);
    }
  }, [formData.primaryAuthor]);

  // Load saved primary author ID on component mount
  useEffect(() => {
    const savedAuthorId = localStorage.getItem("primaryAuthorId");
    if (savedAuthorId) {
      setFormData((prev) => ({
        ...prev,
        primaryAuthor: savedAuthorId,
      }));
    }
  }, []);

  useEffect(() => {
  const userType = localStorage.getItem("user_type");
  const registrationId = localStorage.getItem("registration_id");

  if (userType === "individual" && registrationId) {
    setIsIndividualUser(true);
    setFormData((prev) => ({
      ...prev,
      primaryAuthor: registrationId,
    }));
  }
}, []);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Research Title is required.";
    if (!formData.type) newErrors.type = "Type of Research is required.";
    
    if (!formData.language) {
      newErrors.language = "Language is required.";
    } else if (formData.language === "Other" && (!formData.languageInput || !formData.languageInput.trim())) {
      newErrors.language = "Please specify the language.";
    }
    
    if (!formData.abstract.trim()) newErrors.abstract = "Abstract is required.";
    if (formData.keywords.length === 0)
      newErrors.keywords = "At least one keyword is required.";
    if (!formData.year) newErrors.year = "Year of Research is required.";
    if (!formData.geography)
      newErrors.geography = "Geographical Relevance is required.";
    
    // Updated Validation for Local
    if (formData.geography === "local") {
      if (!formData.district.trim()) newErrors.district = "District is required.";
      if (!formData.state.trim()) newErrors.state = "State is required.";
      if (!formData.country.trim()) newErrors.country = "Country is required.";
    }
    
    if (formData.geography === "state" && !formData.state)
      newErrors.state = "State is required.";
    if (formData.geography === "international" && !formData.country)
      newErrors.country = "Country is required.";
    if (!formData.primaryAuthor.trim())
      newErrors.primaryAuthor = "Primary Author ID is required.";
    if (formData.sdgGoals.length === 0)
      newErrors.sdgGoals = "At least one SDG Goal is required.";
    if (formData.methodology.length === 0)
      newErrors.methodology = "At least one methodology is required.";
    if (!formData.simpleSize.trim())
      newErrors.simpleSize = "Sample Size is required.";
    if (!formData.dataType) newErrors.dataType = "Data Type is required.";
    if (!formData.declaration.trim())
      newErrors.declaration = "Declaration of Study is required.";
    if (!formData.file)
      newErrors.file = "Please upload your research paper (PDF).";
    if (!declaration1)
      newErrors.declaration1 = "You must accept this declaration.";

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
     // ✅ Year field ke liye future year block karo
  if (name === "year") {
    const currentYear = new Date().getFullYear();
    if (value && parseInt(value) > currentYear) return;
  }
  
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "abstract") {
      setWordCount(value.split(/\s+/).filter((word) => word.length > 0).length);
    }
  };

  const handleGeographyChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      geography: value,
      district: "",
      state: "",
      country: "",
    }));
    if (errors.geography) setErrors((prev) => ({ ...prev, geography: "" }));
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      if (!formData.keywords.includes(keywordInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          keywords: [...prev.keywords, keywordInput.trim()],
        }));
        if (errors.keywords) setErrors((prev) => ({ ...prev, keywords: "" }));
      }
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const handleCoAuthorKeyDown = (e) => {
    if (e.key === "Enter" && coAuthorInput.trim()) {
      e.preventDefault();
      if (!formData.coAuthors.includes(coAuthorInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          coAuthors: [...prev.coAuthors, coAuthorInput.trim()],
        }));
      }
      setCoAuthorInput("");
    }
  };

  const removeCoAuthor = (author) => {
    setFormData((prev) => ({
      ...prev,
      coAuthors: prev.coAuthors.filter((a) => a !== author),
    }));
  };

  const handleSdgToggle = (goalId) => {
    setFormData((prev) => ({
      ...prev,
      sdgGoals: prev.sdgGoals.includes(goalId)
        ? prev.sdgGoals.filter((id) => id !== goalId)
        : [...prev.sdgGoals, goalId],
    }));
    if (errors.sdgGoals) setErrors((prev) => ({ ...prev, sdgGoals: "" }));
  };

  const handleMethodologyChange = (method) => {
    setFormData((prev) => ({
      ...prev,
      methodology: prev.methodology.includes(method)
        ? prev.methodology.filter((m) => m !== method)
        : [...prev.methodology, method],
    }));
    if (errors.methodology) setErrors((prev) => ({ ...prev, methodology: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData((prev) => ({ ...prev, file }));
      if (errors.file) setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  // Reset form function
  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      language: "",
      languageInput: "",
      abstract: "",
      keywords: [],
      year: "",
      status: "",
      geography: "",
      district: "",
      state: "",
      country: "",
      primaryAuthor: "",
      coAuthors: [],
      sdgGoals: [],
      impactTypes: [],
      methodology: [],
      simpleSize: "",
      dataType: "",
      declaration: "",
      file: null,
    });
    setKeywordInput("");
    setCoAuthorInput("");
    setWordCount(0);
    setDeclaration1(false);
  };

  // Updated handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorKey = Object.keys(newErrors)[0];
      const el =
        document.getElementById(firstErrorKey) ||
        document.querySelector(`[name="${firstErrorKey}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setUploadStatus({
      loading: true,
      success: false,
      error: null,
      researchId: null,
    });

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication token missing.");

      const formDataToSend = new FormData();

      // 1. BASIC FIELDS
      formDataToSend.append("research_title", formData.title);
      formDataToSend.append("research_type", formData.type);
      
      // ✅ FIX: Send inputted language if "Other" is selected
      const finalLanguage = formData.language === "Other" ? formData.languageInput : formData.language;
      formDataToSend.append("research_language", finalLanguage);
      
      formDataToSend.append("abstract", formData.abstract);
      formDataToSend.append("research_year", formData.year);
      formDataToSend.append("research_status", "p");

      // 2. KEYWORDS
      formData.keywords.forEach((kw) => {
        formDataToSend.append("keywords[]", kw);
      });

      // 3. GEOGRAPHY & PLACE (✅ UPDATED LOGIC HERE FOR PLACE)
      formDataToSend.append("level", formData.geography);
      let locationValue = "";
      
      if (formData.geography === "local") {
        // District, State, Country combine hokar place mein nahi jayenge, place empty jayega
        locationValue = ""; 
        formDataToSend.append("district", formData.district);
        formDataToSend.append("state", formData.state);
        formDataToSend.append("country", formData.country);
      } else if (formData.geography === "state") {
        locationValue = formData.state;
        formDataToSend.append("state", formData.state);
      } else if (formData.geography === "national") {
        locationValue = formData.state; 
        formDataToSend.append("country", formData.state);
      } else if (formData.geography === "international") {
        locationValue = formData.country;
        formDataToSend.append("country", formData.country);
      }
      
      formDataToSend.append("place", locationValue);

      // 4. AUTHORS
      formDataToSend.append("primary_author_id", formData.primaryAuthor);
      localStorage.setItem("primaryAuthorId", formData.primaryAuthor);
      formData.coAuthors.forEach((id) => {
        formDataToSend.append("co_author_id[]", id);
      });

      // 5. SDG GOALS
      formData.sdgGoals.forEach((goalId) => {
        formDataToSend.append("sdg[]", goalId);
      });

      // 6. IMPACT TYPES
      formData.impactTypes.forEach((type) => {
        formDataToSend.append("type_of_impact[]", type);
      });

      // 7. METHODOLOGY
      formData.methodology.forEach((method) => {
        formDataToSend.append("method_type[]", method);
      });

      // 8. OTHER FIELDS
      formDataToSend.append("simple_size", formData.simpleSize);
      formDataToSend.append("data_type", formData.dataType);
      formDataToSend.append("declaration_of_study", formData.declaration);

      // 9. FILE
      if (formData.file) {
        formDataToSend.append("research_file", formData.file);
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/research/upload-research`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        },
      );

      const result = await response.json();
      console.log("Full Server Response:", result);

      if (result.status) {
        setUploadStatus({
          loading: false,
          success: true,
          error: null,
          researchId: result.data?.research_id || null,
        });
        setShowReviewModal(true);
        resetForm();
      } else {
        throw new Error(result.message || "Server rejected the data.");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      setUploadStatus({
        loading: false,
        success: false,
        error: err.message,
        researchId: null,
      });
    }
  };

  const ErrorMsg = ({ field }) =>
    errors[field] ? (
      <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
    ) : null;

  const handleRetryFetch = () => {
    setLoadingSdg(true);
    setSdgError(null);

    setTimeout(() => {
      const fetchSdgGoals = async () => {
        try {
          const token = getAuthToken();

          if (!token) {
            throw new Error(
              "No authentication token found. Please log in again.",
            );
          }

          const apiUrl = `${API_CONFIG.BASE_URL}/research/get-sdg-goals`;
          const response = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          if (response.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          }

          const result = await response.json();

          if (result.status && Array.isArray(result.data)) {
            const formattedGoals = result.data.map((goal) => ({
              id: goal.id,
              title: goal.goals,
            }));
            setSdgGoals(formattedGoals);
          } else {
            throw new Error(result.message || "Invalid response format");
          }
        } catch (err) {
          setSdgError(err.message);
        } finally {
          setLoadingSdg(false);
        }
      };
      fetchSdgGoals();
    }, 100);
  };

  useEffect(() => {
  localStorage.setItem("researchForm", JSON.stringify(formData));
}, [formData]);
  const handleLoginRedirect = () => {
    window.location.href = "/login";
  };
  const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (files) {
    setFormData((prev) => ({
      ...prev,
      [name]: files[0], // file state me rahega but save nahi hoga
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};

useEffect(() => {
  const { file, ...rest } = formData; // file remove
  localStorage.setItem("researchForm", JSON.stringify(rest));
}, [formData]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Upload Status Messages */}
        {uploadStatus.error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500">
              error
            </span>
            <div>
              <p className="text-red-500 font-medium">Upload Failed</p>
            </div>
          </div>
        )}

        {uploadStatus.success && (
          <div className="mb-4 p-4 bg-[#32ff99]/10 border border-[#32ff99]/30 rounded-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-[#32ff99]">
              check_circle
            </span>
            <div>
              <p className="text-[#32ff99] font-medium">Upload Successful!</p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#32ff99]">
                  description
                </span>
                Research Approval Form
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6" noValidate>
              {/* Research Title */}
              <div className="space-y-1">
                <label
                  htmlFor="title"
                  className="block mb-2 text-sm font-medium text-slate-300"
                >
                  Research Title
                  <RequiredStar />
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter full research paper title"
                  className={`w-full px-4 py-2.5 bg-white/5 border text-white rounded-lg focus:ring-[#32ff99] focus:border-[#32ff99] transition-all outline-none ${errors.title ? "border-red-500" : "border-white/10"}`}
                />
                <ErrorMsg field="title" />
              </div>

              {/* Type and Language Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label
                    htmlFor="type"
                    className="block mb-2 text-sm font-medium text-slate-300"
                  >
                    Type of Research
                    <RequiredStar />
                  </label>
                  <div className="relative">
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#32ff99] focus:border-[#32ff99] transition-all outline-none appearance-none cursor-pointer ${errors.type ? "border-red-500" : ""}`}
                      style={{
                        backgroundColor: "#1E1E1E",
                        borderColor: errors.type
                          ? "#ef4444"
                          : "rgba(255,255,255,0.1)",
                        color: "#FFFFFF",
                      }}
                    >
                      <option
                        value=""
                        disabled
                        style={{ backgroundColor: "#1E1E1E", color: "#94A3B8" }}
                      >
                        Select type
                      </option>
                      <option
                        value="Field Study"
                        style={{ backgroundColor: "#1E1E1E", color: "#FFFFFF" }}
                      >
                        Field Study
                      </option>
                      <option
                        value="Survey"
                        style={{ backgroundColor: "#1E1E1E", color: "#FFFFFF" }}
                      >
                        Survey
                      </option>
                      <option
                        value="Laboratory"
                        style={{ backgroundColor: "#1E1E1E", color: "#FFFFFF" }}
                      >
                        Laboratory
                      </option>
                      <option
                        value="Review Paper"
                        style={{ backgroundColor: "#1E1E1E", color: "#FFFFFF" }}
                      >
                        Review Paper
                      </option>
                      <option
                        value="Policy Paper"
                        style={{ backgroundColor: "#1E1E1E", color: "#FFFFFF" }}
                      >
                        Policy Paper
                      </option>
                      <option
                        value="White Paper"
                        style={{ backgroundColor: "#1E1E1E", color: "#FFFFFF" }}
                      >
                        White Paper
                      </option>
                      <option
                        value="Case Study"
                        style={{ backgroundColor: "#1E1E1E", color: "#FFFFFF" }}
                      >
                        Case Study
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400">
                        expand_more
                      </span>
                    </div>
                  </div>
                  <ErrorMsg field="type" />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="language"
                    className="block mb-2 text-sm font-medium text-slate-300"
                  >
                    Language of Research
                    <RequiredStar />
                  </label>

                  <div className="relative">
                    {formData.language === "Other" ? (
                      <input
                        type="text"
                        name="language"
                        value={formData.languageInput || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            languageInput: e.target.value,
                          }))
                        }
                        placeholder="Enter language"
                        className="w-full px-4 py-2.5 bg-white/5 border text-white rounded-lg border-white/10 focus:ring-[#32ff99] focus:border-[#32ff99] outline-none"
                      />
                    ) : (
                      <select
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#32ff99] focus:border-[#32ff99] outline-none appearance-none cursor-pointer"
                        style={{
                          backgroundColor: "#1E1E1E",
                          borderColor: errors.language
                            ? "#ef4444"
                            : "rgba(255,255,255,0.1)",
                          color: "#FFFFFF",
                        }}
                      >
                        <option value="" disabled>
                          Select language
                        </option>
                        <option value="English">English</option>
                        <option value="French">French</option>
                        <option value="Spanish">Spanish</option>
                        <option value="German">German</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Other">Other</option>
                      </select>
                    )}
                  </div>

                  <ErrorMsg field="language" />
                </div>
              </div>

              {/* Abstract */}
              <div className="space-y-1">
                <div className="flex justify-between items-end">
                  <label
                    htmlFor="abstract"
                    className="block mb-2 text-sm font-medium text-slate-300"
                  >
                    Abstract
                    <RequiredStar />
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wide">
                    300–500 words limit
                  </span>
                </div>
                <textarea
                  id="abstract"
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleInputChange}
                  placeholder="Provide a concise summary of your research..."
                  rows="6"
                  className={`w-full px-4 py-2.5 bg-white/5 border text-white rounded-lg focus:ring-[#32ff99] focus:border-[#32ff99] transition-all outline-none ${errors.abstract ? "border-red-500" : "border-white/10"}`}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400 border border-white/5 font-mono">
                    {wordCount} / 500 words
                  </span>
                </div>
                <ErrorMsg field="abstract" />
              </div>

              {/* Keywords and Year */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-1">
                  <label
                    htmlFor="keywords"
                    className="block mb-2 text-sm font-medium text-slate-300"
                  >
                    Keywords
                    <RequiredStar />
                  </label>
                  <div className="relative group">
                    <div
                      className={`flex flex-wrap gap-2 p-2 bg-white/5 border rounded-lg focus-within:ring-[#32ff99] focus-within:border-[#32ff99] transition-all ${errors.keywords ? "border-red-500" : "border-white/10"}`}
                    >
                      {formData.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[#32ff99]/20 text-[#32ff99] text-xs rounded"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="hover:text-white"
                          >
                            <MaterialIcon name="close" className="text-sm" />
                          </button>
                        </span>
                      ))}
                      <input
                        id="keywords"
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleKeywordKeyDown}
                        placeholder={
                          formData.keywords.length === 0
                            ? "Type and press Enter to add tags"
                            : ""
                        }
                        className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 outline-none text-white placeholder-slate-500"
                      />
                    </div>
                    <div className="absolute right-3 top-2.5">
                      <span className="text-[10px] bg-[#32ff99]/20 text-[#32ff99] px-1.5 py-0.5 rounded font-bold">
                        {formData.keywords.length} added
                      </span>
                    </div>
                  </div>
                  <ErrorMsg field="keywords" />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="year"
                    className="block mb-2 text-sm font-medium text-slate-300"
                  >
                    Year of Research
                    <RequiredStar />
                  </label>
                 <input
  id="year"
  name="year"
  type="number"
  min="1900"
  max={new Date().getFullYear()}  // ✅ already tha
  value={formData.year}
  onChange={handleInputChange}
  onKeyDown={(e) => {
    // Sirf valid characters allow karo
    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
  }}
  placeholder="YYYY"
  step="1"
                    className={`w-full px-4 py-2.5 bg-white/5 border text-white rounded-lg focus:ring-[#32ff99] focus:border-[#32ff99] transition-all outline-none ${errors.year ? "border-red-500" : "border-white/10"}`}
                  />
                  <ErrorMsg field="year" />
                </div>
              </div>

              {/* Geographical Relevance */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Geographical Relevance
                  <RequiredStar />
                </label>
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: "local", label: "Local", sub: "District Level" },
                      { value: "state", label: "State", sub: "State Level" },
                      {
                        value: "national",
                        label: "National",
                        sub: "Country Level",
                      },
                      {
                        value: "international",
                        label: "International",
                        sub: "Global Level",
                      },
                    ].map((geo) => (
                      <label
                        key={geo.value}
                        className={`relative flex items-center justify-center border rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-all group ${
                          formData.geography === geo.value
                            ? "border-[#32ff99] bg-[#32ff99]/5"
                            : errors.geography
                              ? "border-red-500/50"
                              : "border-white/10"
                        }`}
                      >
                        <input
                          type="radio"
                          name="geography"
                          value={geo.value}
                          checked={formData.geography === geo.value}
                          onChange={() => handleGeographyChange(geo.value)}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div
                            className={`text-sm font-semibold ${formData.geography === geo.value ? "text-[#32ff99]" : "text-slate-400 group-hover:text-slate-200"} transition-colors`}
                          >
                            {geo.label}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">
                            {geo.sub}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <ErrorMsg field="geography" />

                  <div className="grid grid-cols-1 gap-4">
                    {formData.geography === "local" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* District */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-slate-300">
                            Enter District
                            <RequiredStar />
                          </label>
                          <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                district: e.target.value,
                              }));
                              if (errors.district)
                                setErrors((prev) => ({ ...prev, district: "" }));
                            }}
                            placeholder="Enter district name"
                            className={`w-full px-4 py-2.5 bg-white/5 border text-white rounded-lg focus:ring-[#32ff99] focus:border-[#32ff99] transition-all outline-none ${errors.district ? "border-red-500" : "border-white/10"}`}
                          />
                          <ErrorMsg field="district" />
                        </div>

                        {/* State */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-slate-300">
                            Enter State
                            <RequiredStar />
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                state: e.target.value,
                              }));
                              if (errors.state)
                                setErrors((prev) => ({ ...prev, state: "" }));
                            }}
                            placeholder="Enter state name"
                            className={`w-full px-4 py-2.5 bg-white/5 border text-white rounded-lg focus:ring-[#32ff99] focus:border-[#32ff99] transition-all outline-none ${errors.state ? "border-red-500" : "border-white/10"}`}
                          />
                          <ErrorMsg field="state" />
                        </div>

                        {/* Country */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-slate-300">
                            Enter Country
                            <RequiredStar />
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                country: e.target.value,
                              }));
                              if (errors.country)
                                setErrors((prev) => ({ ...prev, country: "" }));
                            }}
                            placeholder="Enter country name"
                            className={`w-full px-4 py-2.5 bg-white/5 border text-white rounded-lg focus:ring-[#32ff99] focus:border-[#32ff99] transition-all outline-none ${errors.country ? "border-red-500" : "border-white/10"}`}
                          />
                          <ErrorMsg field="country" />
                        </div>
                      </div>
                    )}

                    {formData.geography === "state" && (
                      <div>
                        <label
                          htmlFor="state"
                          className="block mb-2 text-sm font-medium text-slate-300"
                        >
                          Enter State
                          <RequiredStar />
                        </label>
                        <input
                          id="state"
                          name="state"
                          type="text"
                          value={formData.state}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              state: e.target.value,
                            }));
                            if (errors.state)
                              setErrors((prev) => ({ ...prev, state: "" }));
                          }}
                          placeholder="Enter state name"
                          className={`w-full px-4 py-2.5 bg-white/5 border text-white rounded-lg focus:ring-[#32ff99] focus:border-[#32ff99] transition-all outline-none ${errors.state ? "border-red-500" : "border-white/10"}`}
                        />
                        <ErrorMsg field="state" />
                      </div>
                    )}

                    {formData.geography === "national" && (
                      <div>
                        <label
                          htmlFor="country-readonly"
                          className="block mb-2 text-sm font-medium text-slate-300"
                        >
                          Enter Country
                          <RequiredStar />
                        </label>
                        <input
                          id="country"
                          type="text"
                          value={formData.state}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              state: e.target.value,
                            }));
                            if (errors.state)
                              setErrors((prev) => ({ ...prev, state: "" }));
                          }}
                          placeholder="Enter Country name"
                          className={`w-full px-4 py-2.5 bg-white/5 border text-white rounded-lg focus:ring-[#32ff99] focus:border-[#32ff99] transition-all outline-none ${errors.state ? "border-red-500" : "border-white/10"}`}
                        />
                      </div>
                    )}

                    {formData.geography === "international" && (
                      <div>
                        <label
                          htmlFor="country"
                          className="block mb-2 text-sm font-medium text-slate-300"
                        >
                          Enter Country
                          <RequiredStar />
                        </label>
                        <input
                          id="country"
                          name="country"
                          type="text"
                          value={formData.country}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              country: e.target.value,
                            }));
                            if (errors.country)
                              setErrors((prev) => ({ ...prev, country: "" }));
                          }}
                          placeholder="Enter country name"
                          className={`w-full px-4 py-2.5 bg-white/5 border text-white rounded-lg focus:ring-[#32ff99] focus:border-[#32ff99] transition-all outline-none ${errors.country ? "border-red-500" : "border-white/10"}`}
                        />
                        <ErrorMsg field="country" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Author Details */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[#32ff99] font-bold tracking-wider uppercase text-xs">
                  Author Details
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label
                      htmlFor="primary-author"
                      className="block mb-2 text-sm font-medium text-slate-300"
                    >
                      Primary Author ID
                      <RequiredStar />
                    </label>
                   <input
  id="primary-author"
  name="primaryAuthor"
  type="text"
  value={formData.primaryAuthor}
  onChange={isIndividualUser ? undefined : handleInputChange}
  readOnly={isIndividualUser}
  placeholder={isIndividualUser ? "" : "Enter ID"}
  className={`w-full px-4 py-2.5 bg-white/5 border text-white 
    rounded-lg transition-all outline-none
    ${isIndividualUser 
      ? "opacity-60 cursor-not-allowed border-white/5" 
      : "focus:ring-[#32ff99] focus:border-[#32ff99]"}
    ${errors.primaryAuthor ? "border-red-500" : "border-white/10"}`}
/>

                    <ErrorMsg field="primaryAuthor" />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label
                      htmlFor="co-authors"
                      className="block mb-2 text-sm font-medium text-slate-300"
                    >
                      Co-Author IDs
                    </label>
                    <div className="relative group">
                      <div className="flex flex-wrap gap-2 p-2 bg-white/5 border border-white/10 rounded-lg focus-within:ring-[#32ff99] focus-within:border-[#32ff99] transition-all">
                        {formData.coAuthors.map((author, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#32ff99]/20 text-[#32ff99] text-xs rounded"
                          >
                            {author}
                            <button
                              type="button"
                              onClick={() => removeCoAuthor(author)}
                              className="hover:text-white"
                            >
                              <MaterialIcon name="close" className="text-sm" />
                            </button>
                          </span>
                        ))}
                        <input
                          id="co-authors"
                          type="text"
                          value={coAuthorInput}
                          onChange={(e) => setCoAuthorInput(e.target.value)}
                          onKeyDown={handleCoAuthorKeyDown}
                          placeholder="Enter multiple IDs (press Enter)"
                          className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 outline-none text-white placeholder-slate-500"
                        />
                      </div>
                      <div className="absolute right-3 top-2.5">
                        <span className="text-[10px] bg-white/10 text-slate-400 px-1.5 py-0.5 rounded font-bold">
                          {formData.coAuthors.length} added
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SDG Goals Section */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#32ff99] text-xl">
                    eco
                  </span>
                  <label className="text-[#32ff99] font-bold tracking-wider uppercase text-xs mb-0">
                    Sustainability Theme
                  </label>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="sdg-selection"
                    className="block text-sm font-medium text-slate-300"
                  >
                    Sustainable Development Goals (SDGs)
                    <RequiredStar />
                  </label>
                  <p className="text-[10px] text-slate-500 -mt-1 mb-2">
                    Select all applicable goals from the dropdown
                  </p>

                  {loadingSdg ? (
                    <div className="flex items-center justify-center p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#32ff99]"></div>
                        <span className="text-[#32ff99] text-sm">
                          Loading SDG goals...
                        </span>
                      </div>
                    </div>
                  ) : sdgError ? (
                    <div className="flex flex-col items-center justify-center p-6 bg-red-500/10 rounded-lg border border-red-500/30 gap-4">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-red-500 text-3xl mb-2">
                          error
                        </span>
                        <p className="text-red-500 text-sm mb-1">{sdgError}</p>
                        {sdgError.includes("log in") && (
                          <p className="text-slate-400 text-xs">
                            Please log in to access SDG goals
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleRetryFetch}
                          className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">
                            refresh
                          </span>
                          Retry
                        </button>

                        {sdgError.includes("log in") && (
                          <button
                            type="button"
                            onClick={handleLoginRedirect}
                            className="px-4 py-2 bg-[#32ff99]/20 text-[#32ff99] rounded-lg hover:bg-[#32ff99]/30 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">
                              login
                            </span>
                            Go to Login
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Selected Tags Area */}
                      <div
                        id="sdg-selection"
                        className={`min-h-[42px] bg-white/5 border rounded-lg px-3 py-2 cursor-pointer focus-within:ring-2 focus-within:ring-[#32ff99] focus-within:border-[#32ff99] transition-all ${
                          errors.sdgGoals ? "border-red-500" : "border-white/10"
                        }`}
                        onClick={() => setShowSdgDropdown(!showSdgDropdown)}
                      >
                        <div className="flex flex-wrap gap-1.5 pr-6">
                          {formData.sdgGoals.length > 0 ? (
                            formData.sdgGoals.map((goalId) => {
                              const goal = sdgGoals.find(
                                (g) => g.id === goalId,
                              );
                              return (
                                <span
                                  key={goalId}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-[#32ff99]/10 text-[#32ff99] text-xs rounded-md group"
                                >
                                  <span
                                    className="font-medium truncate max-w-[150px]"
                                    title={goal?.title}
                                  >
                                    SDG {goalId}: {goal?.title}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSdgToggle(goalId);
                                    }}
                                    className="hover:text-white flex-shrink-0"
                                  >
                                    <MaterialIcon
                                      name="close"
                                      className="text-sm"
                                    />
                                  </button>
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-slate-400 text-sm py-0.5">
                              Click to select SDG goals...
                            </span>
                          )}
                        </div>
                        <div className="absolute right-3 top-2.5">
                          <span className="material-symbols-outlined text-slate-500 text-lg">
                            {showSdgDropdown ? "expand_less" : "expand_more"}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown */}
                      {showSdgDropdown && sdgGoals.length > 0 && (
                        <div className="absolute z-40 left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl max-h-96 overflow-y-auto custom-scrollbar">
                          <div className="sticky top-0 bg-[#1a1a1a] px-4 py-2 border-b border-white/10 text-xs text-slate-400 z-10">
                            {formData.sdgGoals.length} selected
                          </div>
                          {sdgGoals.map((goal) => (
                            <label
                              key={goal.id}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors group"
                            >
                              <input
                                type="checkbox"
                                checked={formData.sdgGoals.includes(goal.id)}
                                onChange={() => handleSdgToggle(goal.id)}
                                className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-[#32ff99] focus:ring-[#32ff99] flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-[#32ff99]/70 block">
                                  SDG {goal.id}
                                </span>
                                <span
                                  className="text-xs text-slate-300 group-hover:text-white truncate block"
                                  title={goal.title}
                                >
                                  {goal.title}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <ErrorMsg field="sdgGoals" />
                </div>

                {/* Type of Impact Component */}
                <TypeOfImpact
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
              </div>

              {/* Research Methodology */}
              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#32ff99] text-xl">
                    biotech
                  </span>
                  <label className="text-[#32ff99] font-bold tracking-wider uppercase text-xs mb-0">
                    Research Methodology
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="block mb-2 text-sm font-medium text-slate-300">
                    Method Type (Select all that apply)
                    <RequiredStar />
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      "Field Experiment",
                      "Survey",
                      "Sampling Remote Sensing",
                      "Model Based",
                      "Interview Based",
                      "Literature Review",
                    ].map((method) => (
                      <label
                        key={method}
                        className={`flex items-center gap-2 cursor-pointer group p-2.5 rounded-lg border hover:bg-white/5 transition-all ${errors.methodology && !formData.methodology.includes(method) ? "border-red-500/30" : "border-white/5"}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.methodology.includes(method)}
                          onChange={() => handleMethodologyChange(method)}
                          className="w-4 h-4 text-[#32ff99] bg-white/5 border-white/20 rounded focus:ring-[#32ff99] cursor-pointer"
                        />
                        <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                          {method}
                        </span>
                      </label>
                    ))}
                  </div>
                  <ErrorMsg field="methodology" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label
                      htmlFor="sample-size"
                      className="block mb-2 text-sm font-medium text-slate-300"
                    >
                      Sample Size
                      <RequiredStar />
                    </label>
                    <input
                      id="sample-size"
                      name="simpleSize"
                      type="text"
                      value={formData.simpleSize}
                      onChange={handleInputChange}
                      placeholder="e.g. 500 respondents, 20 sites"
                      className={`w-full px-4 py-2.5 bg-white/5 border text-white rounded-lg focus:ring-[#32ff99] focus:border-[#32ff99] transition-all outline-none ${errors.simpleSize ? "border-red-500" : "border-white/10"}`}
                    />
                    <ErrorMsg field="simpleSize" />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="data-type"
                      className="block mb-2 text-sm font-medium text-slate-300"
                    >
                      Data Type
                      <RequiredStar />
                    </label>
                    <div className="relative">
                      <select
                        id="data-type"
                        name="dataType"
                        value={formData.dataType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#32ff99] focus:border-[#32ff99] transition-all outline-none appearance-none cursor-pointer"
                        style={{
                          backgroundColor: "#1E1E1E",
                          borderColor: errors.dataType
                            ? "#ef4444"
                            : "rgba(255,255,255,0.1)",
                          color: "#FFFFFF",
                        }}
                      >
                        <option
                          value=""
                          disabled
                          style={{
                            backgroundColor: "#1E1E1E",
                            color: "#94A3B8",
                          }}
                        >
                          Select data type...
                        </option>
                        <option
                          value="Quantitative"
                          style={{
                            backgroundColor: "#1E1E1E",
                            color: "#FFFFFF",
                          }}
                        >
                          Quantitative
                        </option>
                        <option
                          value="Qualitative"
                          style={{
                            backgroundColor: "#1E1E1E",
                            color: "#FFFFFF",
                          }}
                        >
                          Qualitative
                        </option>
                        <option
                          value="Mixed"
                          style={{
                            backgroundColor: "#1E1E1E",
                            color: "#FFFFFF",
                          }}
                        >
                          Mixed
                        </option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400">
                          expand_more
                        </span>
                      </div>
                    </div>
                    <ErrorMsg field="dataType" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="declaration-methodology"
                    className="block mb-2 text-sm font-medium text-slate-300"
                  >
                    Declaration of Study
                    <RequiredStar />
                  </label>
                  <textarea
                    id="declaration-methodology"
                    name="declaration"
                    value={formData.declaration}
                    onChange={handleInputChange}
                    placeholder="Declare study protocols, ethics compliance, or funding sources..."
                    rows="4"
                    className={`w-full px-4 py-2.5 bg-white/5 border text-white rounded-lg focus:ring-[#32ff99] focus:border-[#32ff99] transition-all outline-none ${errors.declaration ? "border-red-500" : "border-white/10"}`}
                  />
                  <ErrorMsg field="declaration" />
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#32ff99] text-xl">
                    upload_file
                  </span>
                  <label className="text-[#32ff99] font-bold tracking-wider uppercase text-xs mb-0">
                    File Upload
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="block mb-2 text-sm font-medium text-slate-300">
                    Full Research Paper (PDF)
                    <RequiredStar />
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="file-upload"
                    />
                    <div
                      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 bg-white/5 transition-all ${errors.file ? "border-red-500/50" : "border-white/10 group-hover:border-[#32ff99]/50"}`}
                    >
                      <div className="w-14 h-14 bg-[#32ff99]/10 rounded-full flex items-center justify-center text-[#32ff99] group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">
                          cloud_upload
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-medium">
                          Drag & drop your PDF here
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          or click to browse from your device
                        </p>
                      </div>
                      {formData.file && (
                        <div className="text-sm text-[#32ff99]">
                          Selected: {formData.file.name}
                        </div>
                      )}
                      <div className="flex gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        <span>PDF only</span>
                      </div>
                    </div>
                  </div>
                  <ErrorMsg field="file" />
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#32ff99] text-xl">
                    gavel
                  </span>
                  <label className="text-[#32ff99] font-bold tracking-wider uppercase text-xs mb-0">
                    Declaration
                  </label>
                </div>

                <div>
                  <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer group hover:bg-[#32ff99]/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={declaration1}
                      onChange={(e) => {
                        setDeclaration1(e.target.checked);
                        if (errors.declaration1)
                          setErrors((prev) => ({ ...prev, declaration1: "" }));
                      }}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-[#32ff99] focus:ring-[#32ff99] cursor-pointer"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-white leading-relaxed">
                      By uploading your research on the GSIF Research Network
                      platform, you acknowledge and agree that your submitted
                      research may be viewed by other registered users of the
                      platform.
                      <RequiredStar />
                    </span>
                  </label>
                  <ErrorMsg field="declaration1" />
                </div>

                <div>
                  <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer group hover:bg-[#32ff99]/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={declaration2}
                      onChange={(e) => {
                        setDeclaration2(e.target.checked);
                        if (errors.declaration2)
                          setErrors((prev) => ({ ...prev, declaration2: "" }));
                      }}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-[#32ff99] focus:ring-[#32ff99] cursor-pointer"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-white leading-relaxed">
                      You grant GSIF Research Network the right to reference or
                      build upon your uploaded research for academic or
                      development purposes, with proper credit given to you as
                      the original contributor.
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-8 border-t border-white/5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-3 justify-end">
                    <button
                      type="submit"
                      disabled={uploadStatus.loading}
                      className={`md:w-64 bg-[#32ff99] hover:bg-[#32ff99]/90 text-black px-6 py-3.5 rounded-xl font-bold text-base transition-all shadow-lg shadow-[#32ff99]/20 flex items-center justify-center gap-2 ${
                        uploadStatus.loading
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {uploadStatus.loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined font-bold">
                            send
                          </span>
                          <span>Submit for Approval</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Review Status Modal */}
      {showReviewModal && (
        <ReviewStatusModal
          researchId={uploadStatus.researchId}
          onClose={() => setShowReviewModal(false)}
        />
      )}

      {/* FIXED CSS FOR AUTOFILL */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(20, 30, 25, 0.3); border-radius: 10px; border: 1px solid rgba(50, 255, 153, 0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(50, 255, 153, 0.4); border-radius: 10px; border: 1px solid rgba(20, 30, 25, 0.3); transition: all 0.3s ease; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(50, 255, 153, 0.7); cursor: pointer; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(50, 255, 153, 0.4) rgba(20, 30, 25, 0.3); }
        
        /* Fix for browser autofill background color */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active,
        textarea:-webkit-autofill,
        textarea:-webkit-autofill:hover,
        textarea:-webkit-autofill:focus,
        select:-webkit-autofill,
        select:-webkit-autofill:hover,
        select:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0px 1000px #1a1a1a inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
        }
           
  /* Chrome, Safari aur Opera ke liye */
  ::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  /* Firefox ke liye */
  * {
    scrollbar-width: none;
  }

  /* IE aur Edge ke liye */
  * {
    -ms-overflow-style: none;
  }
`}
      </style>
    </DashboardLayout>
  );
};

export default ResearchUploadForm;