import React from "react";

export default function PostActionModals({ ctx }) {
  const {
    showDeletePopup,
    closeDeletePopup,
    selectedPost,
    confirmDelete,
    showReportPopup,
    closeReportPopup,
    reportStep,
    isReportingLoading,
    reportReasons,
    handleReportPost,
    showBlockPopup,
    closeBlockPopup,
    handleBlockUser,
  } = ctx;

  return (
    <>
      {showDeletePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 dark:bg-[#000302]/60 backdrop-blur-sm px-2 sm:px-4"
          onClick={closeDeletePopup}
        >
          <div
            className="
    bg-white dark:bg-[#1e293b]
    rounded-lg sm:rounded-2xl
    p-4 sm:p-5 md:p-6
    w-full max-w-[350px]
    border border-slate-200 dark:border-white/10
    shadow-[0_10px_40px_rgba(0,0,0,0.08)]
    dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)]
    animate-fadeInScale
  "
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
              {selectedPost?.isPollPost ? "Delete Poll" : "Delete Post"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-5 md:mb-6 break-words">
              {" "}
              {selectedPost?.isPollPost
                ? "Are you sure you want to delete this poll?"
                : "Are you sure you want to delete this post?"}
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={closeDeletePopup}
                className="
  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm
  bg-slate-100 dark:bg-white/5
  text-slate-700 dark:text-slate-300
  hover:bg-slate-200 dark:hover:bg-white/10
  transition-colors
"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="
  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm
  bg-red-500 text-white
  hover:bg-red-600
  transition-colors
"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportPopup && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-100 dark:bg-[#000302]/80 backdrop-blur-md px-4"
          onClick={closeReportPopup}
        >
          <div
            className="bg-slate-100 dark:bg-[#0d0f0e] rounded-t-[25px] sm:rounded-2xl w-full max-w-[450px] overflow-hidden animate-fadeInScale border border-[#00ff88]/20 shadow-[0_0_50px_rgba(0,255,136,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Handle Bar */}
            <div className="w-12 h-1.5 bg-[#00ff88]/20 rounded-full mx-auto mt-3 mb-2 sm:hidden"></div>

            {reportStep === 1 ? (
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ff88]">
                      flag
                    </span>
                    Report Content
                  </h2>
                  <button
                    onClick={closeReportPopup}
                    className="text-slate-400 hover:text-slate-900 dark:text-white"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-emerald-600 dark:text-[#00ff88] mb-2">
                    Why are you reporting this?
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your report is anonymous. We use this feedback to improve
                    your network experience.
                  </p>
                </div>

                <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1 scrollbar-hidden">
                  {reportReasons.map((reason, index) => (
                    <button
                      key={index}
                      onClick={() => handleReportPost(reason)}
                      disabled={isReportingLoading}
                      className="w-full flex items-center justify-between px-3 py-4 hover:bg-[#00ff88]/5 border-b border-white/5 last:border-0 group transition-all rounded-lg"
                    >
                      <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {" "}
                        {reason}
                      </span>
                      <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ff88]/40 group-hover:text-emerald-600 dark:text-[#00ff88] group-hover:translate-x-1 transition-all">
                        chevron_right
                      </span>
                    </button>
                  ))}
                </div>

                {isReportingLoading && (
                  <div className="absolute inset-0 bg-slate-100 dark:bg-[#000302]/50 flex items-center justify-center backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff88]"></div>
                  </div>
                )}
              </div>
            ) : (
              /* Step 2: Success Screen */
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-[#031a11] border border-[#00ff88]/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,136,0.2)]">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ff88] text-4xl">
                    check_circle
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Feedback Received
                </h2>
                <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-[280px]">
                  Thank you for helping us keep the network safe. We'll review
                  this post shortly.
                </p>
                <button
                  onClick={closeReportPopup}
                  className="w-full py-3 bg-[#00ff88] text-[#003919] font-black rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)] uppercase tracking-widest text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showBlockPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 dark:bg-[#000302]/60 backdrop-blur-sm px-2 sm:px-4"
          onClick={closeBlockPopup}
        >
          <div
            className="
  bg-white dark:bg-[#1e293b]
  rounded-lg sm:rounded-2xl
  p-4 sm:p-5 md:p-6
  w-full max-w-[350px]
  border border-slate-200 dark:border-white/10
  shadow-[0_10px_40px_rgba(0,0,0,0.08)]
  dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)]
  animate-fadeInScale
"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
              Block User
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-5 md:mb-6 break-words">
              {" "}
              Are you sure you want to block this user? You won't see their
              posts anymore.
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={closeBlockPopup}
                className="
  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm
  bg-slate-100 dark:bg-white/5
  text-slate-700 dark:text-slate-300
  hover:bg-slate-200 dark:hover:bg-white/10
  transition-colors
"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="
  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm
  bg-orange-500 text-white
  hover:bg-orange-600
  transition-colors
"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
