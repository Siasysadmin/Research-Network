import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import API_CONFIG from "../config/api.config";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const CreatePost = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // Helper function to get auth token
  const getAuthToken = () => {
    const token =
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("auth_token");
    
    if (token) {
      console.log("Token preview:", `${token.substring(0, 50)}...`);
    }
    
    if (!token) {
      console.error("No authentication token found in localStorage");
      return null;
    }
    return token;
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    setUploadError("");
    
    if (isPollOpen) {
      setUploadError("You can only add one thing at a time. Discard the poll to upload a photo.");
      return;
    }

    if (file) {
      // Check file size - 100MB limit
      if (file.size > 100 * 1024 * 1024) {
        setUploadError(`File size (${formatFileSize(file.size)}) exceeds 100MB limit. Please select a smaller file.`);
        return;
      }

      // Allow all image types (no strict format restriction)
      if (file.type && !file.type.startsWith("image/")) {
        setUploadError(`Invalid file type (${file.type}). Please upload an image.`);
        return;
      }
      
      setPhotoFile(file);
      setSelectedPhoto(URL.createObjectURL(file));
      // Clear video if photo is selected
      if (selectedVideo) {
        setSelectedVideo(null);
        setVideoFile(null);
      }
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    setUploadError("");
    
    if (isPollOpen) {
      setUploadError("You can only add one thing at a time. Discard the poll to upload a video.");
      return;
    }

    if (file) {
      // Check file size - 100MB limit
      if (file.size > 100 * 1024 * 1024) {
        setUploadError(`File size (${formatFileSize(file.size)}) exceeds 100MB limit. Please select a smaller video.`);
        return;
      }

      // Allow all video types (no strict format restriction)
      if (file.type && !file.type.startsWith("video/")) {
        setUploadError(`Invalid file type (${file.type}). Please upload a video.`);
        return;
      }
      
      setVideoFile(file);
      setSelectedVideo(URL.createObjectURL(file));
      // Clear photo if video is selected
      if (selectedPhoto) {
        setSelectedPhoto(null);
        setPhotoFile(null);
      }
    }
  };

  const handleRemovePhoto = (e) => {
    e?.stopPropagation?.();
    setSelectedPhoto(null);
    setPhotoFile(null);
    setUploadError("");
  };

  const handleRemoveVideo = (e) => {
    e?.stopPropagation?.();
    setSelectedVideo(null);
    setVideoFile(null);
    setUploadError("");
  };

  const normalizeTag = (raw) =>
    raw
      .trim()
      .replace(/^#+/, "")
      .replace(/\s+/g, "")
      .slice(0, 32);

  const commitTag = () => {
    const normalized = normalizeTag(tagInput);
    if (!normalized) return;
    setTags((prev) => {
      const exists = prev.some((t) => t.toLowerCase() === normalized.toLowerCase());
      return exists ? prev : [...prev, normalized];
    });
    setTagInput("");
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const openPoll = () => {
    setUploadError("");
    if (photoFile || videoFile) {
      setUploadError("You can only add one thing at a time. Remove the media to create a poll.");
      return;
    }
    setIsPollOpen(true);
  };

  const discardPoll = () => {
    setIsPollOpen(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setUploadError("");
  };

  const updatePollOption = (index, value) => {
    setPollOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const removePollOption = (index) => {
    setPollOptions((prev) => {
      if (prev.length <= 2) return prev.map((opt, i) => (i === index ? "" : opt));
      return prev.filter((_, i) => i !== index);
    });
  };

  const addPollOption = () => setPollOptions((prev) => [...prev, ""]);

  const getPollPayload = () => {
    if (!isPollOpen) return { hasDraft: false, isValid: false, payload: null };

    const hasDraft =
      Boolean(pollQuestion.trim()) ||
      pollOptions.some((o) => Boolean(String(o ?? "").trim()));

    const question = pollQuestion.trim();
    const options = pollOptions
      .map((o) => String(o ?? "").trim())
      .filter(Boolean)
      .slice(0, 10);

    const isValid = Boolean(question) && options.length >= 2;

    return {
      hasDraft,
      isValid,
      payload: isValid ? { question, options } : null,
    };
  };

  const createPoll = async ({ token, question, options }) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/poll/create-poll`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, options }),
    });

    const responseText = await response.text();

    if (responseText.includes("PHP Error") || responseText.includes("<div")) {
      console.error("Poll server returned HTML error");
      throw new Error("Server error occurred while creating poll.");
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse poll response as JSON:", parseError);
      throw new Error("Invalid response format from server (poll).");
    }

    if (!data?.status) {
      throw new Error(data?.message || "Failed to create poll.");
    }

    return data.poll_id;
  };

  const handlePublish = async () => {
    setUploadError("");
    
    const poll = getPollPayload();
    if (poll.hasDraft && !poll.isValid) {
      alert("Please complete the poll (question + at least 2 options) or discard it.");
      return;
    }

    // Basic validation
    if (!content.trim() && !photoFile && !videoFile && !poll.isValid) {
      console.log("Validation failed: No content, media, or poll");
      alert("Please add some text, media, or a poll before publishing.");
      return;
    }

    if ((photoFile || videoFile) && !content.trim()) {
      alert("Please add some text with your photo/video before publishing.");
      return;
    }

    if (poll.isValid && (photoFile || videoFile)) {
      alert("You can only publish one type at a time. Please remove the media or discard the poll.");
      return;
    }

    // Check for authentication token
    const token = getAuthToken();
    
    if (!token) {
      alert("Authentication required. Please login again.");
      navigate("/login");
      return;
    }

    setIsPublishing(true);

    try {
      let pollId = null;
      if (poll.payload) {
        pollId = await createPoll({
          token,
          question: poll.payload.question,
          options: poll.payload.options,
        });
        console.log("✅ Poll created! Poll ID:", pollId);
      }

      // Create FormData for file upload
      const formData = new FormData();
      
      // Add post_text
      const postText = content.trim() || (poll.payload ? poll.payload.question : "");
      formData.append("post_text", postText);

      // Tags/hashtags append karo
tags.forEach((tag) => {
  formData.append("hash_tag[]", `#${tag}`);
});

      if (pollId) {
        formData.append("poll_id", String(pollId));
      }
      
      // Add media based on type
      if (photoFile) {
        formData.append("post_image", photoFile);
        console.log("Photo file attached:", {
          name: photoFile.name,
          type: photoFile.type,
          size: formatFileSize(photoFile.size)
        });
      }
      
      if (videoFile) {
        formData.append("post_video", videoFile);
        console.log("Video file attached:", {
          name: videoFile.name,
          type: videoFile.type,
          size: formatFileSize(videoFile.size)
        });
      }

      
      // Make API call with authentication headers
      const response = await fetch(`${API_CONFIG.BASE_URL}/post/create-post`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

     
      // Get the raw response text
      const responseText = await response.text();

      // Check if response is HTML error
      if (responseText.includes("PHP Error") || responseText.includes("<div")) {
        console.error("Server returned HTML error");
        
        if (responseText.includes("CI::$upload") || responseText.includes("initialize() on null")) {
          alert("Server upload configuration error. Please contact administrator.");
        } else {
          alert("Server error occurred. Please try again later.");
        }
        return;
      }

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("  Parsed JSON:", data);
      } catch (parseError) {
        console.error("  Failed to parse response as JSON:", parseError);
        throw new Error("Invalid response format from server");
      }

      if (data.status) {
        console.log("✅ SUCCESS: Post created! Post ID:", data.post_id);
        navigate("/dashboard");
      } else {
        console.log("❌ API ERROR:", data.message || data.msg);
        
        if (data.message === "Token missing" || data.message === "Invalid token") {
          alert("Session expired. Please login again.");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("token");
          sessionStorage.removeItem("auth_token");
          navigate("/login");
        } else {
          alert(data.message || data.msg || "Failed to create post. Please try again.");
        }
      }
    } catch (error) {
      console.error("❌ NETWORK ERROR:", error);
      alert(error?.message || "Network error. Please check your connection and try again.");
    } finally {
      setIsPublishing(false);
      console.log("=== PUBLISH POST ENDED ===\n");
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full flex justify-center px-4 sm:px-6 py-6 md:py-10 font-sans">
        <div className="w-full max-w-3xl bg-[#1a1c1b]/35 border border-[#3b4b3d]/20 rounded-xl p-6 sm:p-8 md:p-10 shadow-[0_0_25px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-8">
            {/* Text */}
            <div className="flex flex-col gap-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                Research Abstract & Insights
              </label>
              <textarea
                className="w-full bg-[#1e201f] rounded-xl border border-[#3b4b3d]/25 focus:border-[#00ff88]/60 focus:ring-0 text-slate-200 p-6 min-h-[160px] resize-y placeholder:text-slate-500/50 text-lg leading-relaxed shadow-[inset_0_0_10px_rgba(0,0,0,0.2)] transition-all outline-none"
                placeholder="What breakthroughs have you made today?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPublishing}
              />
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-[#3b4b3d]/25 pb-2 focus-within:border-[#00ff88]/50 transition-colors">
                <MaterialIcon name="tag" className="text-slate-400/70 text-sm" />
                <input
                  className="bg-transparent border-none focus:ring-0 text-slate-200 text-sm w-full placeholder:text-slate-500/60 outline-none"
                  placeholder="Add relevant tags... (press Enter)"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      commitTag();
                    }
                    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
                      removeTag(tags[tags.length - 1]);
                    }
                  }}
                  disabled={isPublishing}
                />
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="bg-[#333534] text-[#00ff88] px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-[#00ff88]/20"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="hover:text-red-400 transition-colors"
                        disabled={isPublishing}
                      >
                        <MaterialIcon name="close" className="text-[14px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Poll */}
            {!isPollOpen ? (
              <button
                type="button"
                onClick={openPoll}
                disabled={isPublishing || Boolean(photoFile || videoFile)}
                className="w-full flex items-center justify-between p-6 bg-[#1e201f]/40 hover:bg-[#1e201f]/60 border-2 border-dashed border-[#3b4b3d]/30 hover:border-[#00ff88]/40 rounded-xl transition-all duration-300 relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#282a29] flex items-center justify-center border border-[#3b4b3d]/30 group-hover:border-[#00ff88]/35 group-hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] transition-all duration-300">
                    <MaterialIcon
                      name="poll"
                      className="text-slate-400 group-hover:text-[#00ff88] text-2xl transition-colors"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-black text-slate-400 group-hover:text-slate-200 uppercase tracking-[0.15em] transition-colors">
                      Create Research Poll
                    </h3>
                    <p className="text-[10px] text-slate-500/70 uppercase font-bold tracking-wider mt-1 group-hover:text-slate-400/80">
                      Incorporate quantitative data points from your network
                    </p>
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-3 text-slate-500/50 group-hover:text-[#00ff88] transition-all">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                    Launch
                  </span>
                  <MaterialIcon name="add_circle" className="text-2xl" />
                </div>
              </button>
            ) : (
              <div className="flex flex-col gap-4 bg-[#1e201f] rounded-xl p-6 border border-[#3b4b3d]/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-transparent pointer-events-none" />
                <div className="flex justify-between items-center z-10">
                  <div className="flex items-center gap-2 text-[#00ff88] font-bold text-xs uppercase tracking-widest">
                    <MaterialIcon name="poll" className="text-lg" />
                    Active Poll Creator
                  </div>
                  <button
                    type="button"
                    onClick={discardPoll}
                    className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold tracking-tighter"
                    disabled={isPublishing}
                  >
                    Discard Poll
                  </button>
                </div>

                <div className="bg-[#121413] rounded-lg p-5 border border-[#3b4b3d]/30 flex flex-col gap-5 z-10 shadow-lg">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Question
                    </label>
                    <input
                      className="w-full bg-[#1a1c1b] border border-[#3b4b3d]/25 focus:border-[#00ff88]/60 focus:ring-1 focus:ring-[#00ff88]/15 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-500/60 transition-all outline-none"
                      placeholder="Poll Question..."
                      type="text"
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      disabled={isPublishing}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Options
                    </label>
                    <div className="flex flex-col gap-2">
                      {pollOptions.map((opt, idx) => (
                        <div key={idx} className="group relative flex items-center">
                          <input
                            className="w-full bg-[#1a1c1b] border border-[#3b4b3d]/25 focus:border-[#00ff88]/60 focus:ring-1 focus:ring-[#00ff88]/15 rounded-lg p-3 pr-10 text-sm text-slate-300 placeholder:text-slate-500/60 transition-all outline-none"
                            type="text"
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={(e) => updatePollOption(idx, e.target.value)}
                            disabled={isPublishing}
                          />
                          <button
                            type="button"
                            onClick={() => removePollOption(idx)}
                            className="absolute right-3 text-slate-500/70 hover:text-red-400 transition-colors"
                            disabled={isPublishing}
                          >
                            <MaterialIcon name="delete" className="text-[18px]" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addPollOption}
                        className="w-full py-3 rounded-lg border-2 border-dashed border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/5 hover:border-[#00ff88]/45 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isPublishing}
                      >
                        <MaterialIcon name="add_circle" className="text-[18px]" />
                        Add Option
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Media */}
            <div className="flex flex-col gap-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                Visual Media (Max 100MB)
              </label>

              {uploadError && (
                <div className="p-3 bg-red-500/10 border border-red-500/35 rounded-lg text-red-300 text-sm">
                  <MaterialIcon name="error" className="text-sm mr-1 align-middle" />
                  <span className="align-middle">{uploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`bg-[#1e201f] hover:bg-[#333534] border-2 border-dashed border-[#3b4b3d]/40 hover:border-[#00ff88]/50 rounded-xl h-32 flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer ${
                    isPublishing || videoFile || isPollOpen ? "opacity-50 cursor-not-allowed hover:bg-[#1e201f]" : ""
                  }`}
                >
                  <MaterialIcon
                    name="image"
                    className="text-slate-400 group-hover:text-[#00ff88] text-3xl transition-colors"
                  />
                  <span className="text-xs text-slate-300 group-hover:text-[#00ff88] font-medium uppercase tracking-tighter">
                    Upload Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={isPublishing || videoFile !== null || isPollOpen}
                  />
                </label>

                <label
                  className={`bg-[#1e201f] hover:bg-[#333534] border-2 border-dashed border-[#3b4b3d]/40 hover:border-[#00ff88]/50 rounded-xl h-32 flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer ${
                    isPublishing || photoFile || isPollOpen ? "opacity-50 cursor-not-allowed hover:bg-[#1e201f]" : ""
                  }`}
                >
                  <MaterialIcon
                    name="movie"
                    className="text-slate-400 group-hover:text-[#00ff88] text-3xl transition-colors"
                  />
                  <span className="text-xs text-slate-300 group-hover:text-[#00ff88] font-medium uppercase tracking-tighter">
                    Upload Video
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoUpload}
                    disabled={isPublishing || photoFile !== null || isPollOpen}
                  />
                </label>
              </div>

              {(selectedPhoto || selectedVideo) && (
                <div className="rounded-xl border border-[#3b4b3d]/30 bg-[#121413] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#3b4b3d]/20">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      Preview
                    </div>
                    <button
                      type="button"
                      onClick={selectedPhoto ? handleRemovePhoto : handleRemoveVideo}
                      className="text-xs font-bold text-red-300 hover:text-red-200 bg-red-500/10 border border-red-500/25 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={isPublishing}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="bg-black/40 flex items-center justify-center p-3">
                    {selectedPhoto ? (
                      <img
                        src={selectedPhoto}
                        alt="Selected preview"
                        className="w-full max-h-[340px] object-contain"
                      />
                    ) : (
                      <video
                        src={selectedVideo}
                        controls
                        className="w-full max-h-[340px]"
                      />
                    )}
                  </div>
                  <div className="px-4 py-3 text-xs text-slate-500 flex items-center justify-between gap-4">
                    <span className="truncate">
                      {photoFile?.name || videoFile?.name || ""}
                    </span>
                    <span className="shrink-0">
                      {photoFile
                        ? formatFileSize(photoFile.size)
                        : videoFile
                        ? formatFileSize(videoFile.size)
                        : ""}
                    </span>
                  </div>
                </div>
              )}

              {(photoFile || videoFile) && (
                <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                  Only one media type (Photo or Video) can be uploaded per post.
                </p>
              )}
            </div>

            {/* Publish */}
            <div className="pt-6 border-t border-[#3b4b3d]/25 flex justify-end">
              <button
                type="button"
                onClick={handlePublish}
                disabled={
                  isPublishing ||
                  (!content.trim() && !photoFile && !videoFile && !getPollPayload().isValid)
                }
                className="bg-gradient-to-br from-[#00ff88] to-[#7dda94] text-[#003919] font-black py-4 px-10 rounded-xl shadow-[0_0_20px_rgba(0,255,136,0.25)] hover:shadow-[0_0_35px_rgba(0,255,136,0.45)] transition-all duration-300 flex items-center gap-3 uppercase tracking-widest text-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPublishing ? (
                  <>
                    Publishing
                    <MaterialIcon name="sync" className="text-sm animate-spin" />
                  </>
                ) : (
                  <>
                    Publish Insight
                    <MaterialIcon name="send" className="text-sm" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreatePost;
