import React from "react";

const ConfirmPopups = ({
  showDeletePopup, showReportPopup, showBlockPopup,
  selectedPost, reportReason, setReportReason,
  confirmDelete, handleReportPost, handleBlockUser,
  setShowDeletePopup, setShowReportPopup, setShowBlockPopup, setSelectedPost,
}) => {
  return (
    <>
      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => { setShowDeletePopup(false); setSelectedPost(null); }}>
          <div className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-[350px] border border-white/10 shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-3">
              {selectedPost?.isPollPost ? "Delete Poll" : "Delete Post"}
            </h2>
            <p className="text-sm text-slate-400 mb-6">Are you sure you want to delete this?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowDeletePopup(false); setSelectedPost(null); }}
                className="px-4 py-2 rounded-lg text-sm bg-white/5 text-slate-300 hover:bg-white/10">Cancel</button>
              <button onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showReportPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => { setShowReportPopup(false); setSelectedPost(null); }}>
          <div className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-[400px] border border-white/10 shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-2">Report Post</h2>
            <p className="text-sm text-slate-400 mb-4">Please tell us why you're reporting this post.</p>
            <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none min-h-[100px] mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowReportPopup(false); setSelectedPost(null); }}
                className="px-4 py-2 rounded-lg text-sm bg-white/5 text-slate-300">Cancel</button>
              <button onClick={handleReportPost}
                className="px-4 py-2 rounded-lg text-sm bg-yellow-500 text-white hover:bg-yellow-600">Report</button>
            </div>
          </div>
        </div>
      )}

      {showBlockPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => { setShowBlockPopup(false); setSelectedPost(null); }}>
          <div className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-[350px] border border-white/10 shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-3">Block User</h2>
            <p className="text-sm text-slate-400 mb-6">Are you sure? You won't see their posts anymore.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowBlockPopup(false); setSelectedPost(null); }}
                className="px-4 py-2 rounded-lg text-sm bg-white/5 text-slate-300">Cancel</button>
              <button onClick={handleBlockUser}
                className="px-4 py-2 rounded-lg text-sm bg-orange-500 text-white hover:bg-orange-600">Block</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmPopups;