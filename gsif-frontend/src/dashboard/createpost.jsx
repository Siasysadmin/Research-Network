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

  // Helper function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    
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
    
    if (file) {
      // Check file size - 100MB limit
      if (file.size > 100 * 1024 * 1024) {
        setUploadError(`File size (${formatFileSize(file.size)}) exceeds 100MB limit. Please select a smaller file.`);
        return;
      }
      
      // Validate image type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setUploadError(`Invalid file type (${file.type}). Please upload JPG, JPEG, PNG, GIF, or WEBP image.`);
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
    
    if (file) {
      // Check file size - 100MB limit
      if (file.size > 100 * 1024 * 1024) {
        setUploadError(`File size (${formatFileSize(file.size)}) exceeds 100MB limit. Please select a smaller video.`);
        return;
      }
      
      // Validate video type
      const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        setUploadError(`Invalid file type (${file.type}). Please upload MP4, MOV, AVI, MKV, or WEBM video.`);
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
    e.stopPropagation();
    setSelectedPhoto(null);
    setPhotoFile(null);
    setUploadError("");
  };

  const handleRemoveVideo = (e) => {
    e.stopPropagation();
    setSelectedVideo(null);
    setVideoFile(null);
    setUploadError("");
  };

  const handlePublish = async () => {
    setUploadError("");
    
    // Basic validation
    if (!content.trim() && !photoFile && !videoFile) {
      console.log("Validation failed: No content or media");
      alert("Please add some text or media before publishing.");
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
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add post_text
      formData.append("post_text", content.trim());
      
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
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          alert(data.message || data.msg || "Failed to create post. Please try again.");
        }
      }
    } catch (error) {
      console.error("❌ NETWORK ERROR:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsPublishing(false);
      console.log("=== PUBLISH POST ENDED ===\n");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 w-full font-sans">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            Compose Research Insight
          </h1>
          <p className="text-slate-400 text-lg">
            Share your latest findings with the global elite network.
          </p>
        </header>

        <div className="w-full">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
            
            {/* Text Area Section */}
            <div className="p-8 border-b border-[#1e293b]/50">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                Research Abstract & Insights
              </label>
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 text-xl text-slate-200 placeholder-slate-600 resize-none min-h-[300px] outline-none"
                placeholder="What breakthroughs have you made today?"
                rows="10"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPublishing}
              ></textarea>
            </div>

            {/* Media Upload Section */}
            <div className="p-8 bg-[#020617]/40">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                  Visual Media (Max 100MB)
                </label>
                
                {/* Error Message */}
                {uploadError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    <MaterialIcon name="error" className="text-sm mr-1 align-middle" />
                    <span className="align-middle">{uploadError}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Photo Upload Area */}
                  <div className="relative w-full h-full min-h-[200px]">
                    {selectedPhoto ? (
                      <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-700 bg-black flex items-center justify-center">
                        <img 
                          src={selectedPhoto} 
                          alt="Selected preview" 
                          className="w-full h-full object-contain max-h-[300px]" 
                        />
                        <button 
                          onClick={handleRemovePhoto}
                          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors z-10"
                          disabled={isPublishing}
                        >
                          <MaterialIcon name="close" className="text-sm" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {photoFile && formatFileSize(photoFile.size)}
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-full p-14 rounded-xl border border-dashed border-slate-700 hover:border-[#0fbd6c]/50 hover:bg-[#0fbd6c]/5 transition-all group cursor-pointer h-[200px]">
                        <MaterialIcon 
                          name="image" 
                          className="text-slate-500 group-hover:text-[#0fbd6c] mb-2 text-5xl transition-colors" 
                        />
                        <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                          Upload Photo
                        </span>
                        <span className="text-xs text-slate-500 mt-1">Max 100MB (JPG, PNG, GIF)</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={handlePhotoUpload}
                          disabled={isPublishing || videoFile !== null}
                        />
                      </label>
                    )}
                  </div>

                  {/* Video Upload Area */}
                  <div className="relative w-full h-full min-h-[200px]">
                    {selectedVideo ? (
                      <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-700 bg-black flex items-center justify-center">
                        <video 
                          src={selectedVideo} 
                          controls 
                          className="w-full h-full max-h-[300px]" 
                        />
                        <button 
                          onClick={handleRemoveVideo}
                          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors z-10"
                          disabled={isPublishing}
                        >
                          <MaterialIcon name="close" className="text-sm" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {videoFile && formatFileSize(videoFile.size)}
                        </div>
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center justify-center h-full p-14 rounded-xl border border-dashed border-slate-700 hover:border-[#0fbd6c]/50 hover:bg-[#0fbd6c]/5 transition-all group cursor-pointer h-[200px] ${photoFile ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <MaterialIcon 
                          name="videocam" 
                          className="text-slate-500 group-hover:text-[#0fbd6c] mb-2 text-5xl transition-colors" 
                        />
                        <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                          Upload Video
                        </span>
                        <span className="text-xs text-slate-500 mt-1">Max 100MB (MP4, MOV, AVI)</span>
                        <input 
                          type="file" 
                          accept="video/*" 
                          className="hidden"
                          onChange={handleVideoUpload}
                          disabled={isPublishing || photoFile !== null}
                        />
                      </label>
                    )}
                  </div>

                </div>
                {(photoFile || videoFile) && (
                  <p className="text-xs text-slate-500 mt-3 text-center">
                    {photoFile ? `Photo selected (${formatFileSize(photoFile.size)})` : `Video selected (${formatFileSize(videoFile.size)})`}
                    <br />
                    Only one media type (Photo or Video) can be uploaded per post.
                  </p>
                )}
              </div>
            </div>

            {/* Submit Section */}
            <div className="p-8 flex items-center justify-center bg-[#0f172a]/80 border-t border-[#1e293b]">
              <button 
                onClick={handlePublish}
                disabled={isPublishing || (!content.trim() && !photoFile && !videoFile)}
                className={`w-full md:w-auto px-24 py-5 rounded-xl text-base font-extrabold text-[#020617] bg-[#0fbd6c] transition-all 
                  ${isPublishing ? 'opacity-70 cursor-wait' : 'shadow-[0_0_25px_rgba(15,189,108,0.3)] hover:shadow-[0_0_40px_rgba(15,189,108,0.6)] active:scale-95'}
                  ${(!content.trim() && !photoFile && !videoFile) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isPublishing ? (
                  <span className="flex items-center gap-2">
                    <MaterialIcon name="sync" className="animate-spin" /> Publishing...
                  </span>
                ) : (
                  "Publish Insight"
                )}
              </button>
            </div>
            
          </div>

          {/* Footer Text */}
          <div className="mt-12 text-center">
            <p className="text-slate-600 text-xs font-medium uppercase tracking-[0.2em]">
              Research Protocol v2.4 Active | Max file size: 100MB
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreatePost;