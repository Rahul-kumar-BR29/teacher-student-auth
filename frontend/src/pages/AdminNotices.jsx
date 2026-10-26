import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    audience: "all",
  });
  const [noticeMsg, setNoticeMsg] = useState("");

  // Selected notice aur uske replies dekhne ke liye
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [replies, setReplies] = useState([]);

  const navigate = useNavigate();

  const loadNotices = async () => {
    try {
      const { data } = await api.get("/notices");
      setNotices(data.notices);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403)
        navigate("/login");
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handlePostNotice = async (e) => {
    e.preventDefault();
    setNoticeMsg("");
    try {
      await api.post("/notices", newNotice);
      setNewNotice({ title: "", content: "", audience: "all" });
      setNoticeMsg("Notice posted successfully!");
      loadNotices();
      setTimeout(() => setNoticeMsg(""), 3000);
    } catch (err) {
      alert("Failed to post notice");
    }
  };

  const handleDeleteNotice = async (id) => {
    if (window.confirm("Delete this notice?")) {
      await api.delete(`/notices/${id}`);
      loadNotices();
      setSelectedNotice(null);
    }
  };

  const handleViewReplies = async (notice) => {
    setSelectedNotice(notice);
    try {
      const { data } = await api.get(`/notices/${notice._id}/replies`);
      setReplies(data.replies);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Notice Board & Replies
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Send notices to students/teachers and view their replies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side: Create Notice & List */}
          <div className="space-y-6">
            {/* Form */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 animate-fade-in-up">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                📢 Post New Notice
              </h2>
              {noticeMsg && (
                <div className="bg-green-50 text-green-700 p-2 rounded-lg mb-3 text-sm">
                  {noticeMsg}
                </div>
              )}

              <form onSubmit={handlePostNotice} className="space-y-3">
                <input
                  type="text"
                  placeholder="Notice Title"
                  value={newNotice.title}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                />
                <textarea
                  placeholder="Notice Content / Message"
                  value={newNotice.content}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, content: e.target.value })
                  }
                  required
                  rows="3"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                ></textarea>
                <select
                  value={newNotice.audience}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, audience: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white text-sm font-bold"
                >
                  <option value="all">
                    📢 Send to All (Students & Teachers)
                  </option>
                  <option value="student">🎓 Send to Students Only</option>
                  <option value="teacher">👨‍🏫 Send to Teachers Only</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Send Notice
                </button>
              </form>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <h2 className="font-bold text-gray-800 dark:text-white">
                  Sent Notices
                </h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
                {notices.map((n) => (
                  <div
                    key={n._id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div
                        className="cursor-pointer"
                        onClick={() => handleViewReplies(n)}
                      >
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm hover:text-blue-600">
                          {n.title}
                        </h4>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${n.audience === "all" ? "bg-blue-100 text-blue-700" : n.audience === "student" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}
                        >
                          {n.audience === "all" ? "All Users" : n.audience}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteNotice(n._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Replies View */}
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {selectedNotice ? (
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {selectedNotice.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  {selectedNotice.content}
                </p>
                <hr className="my-4 border-gray-100 dark:border-gray-800" />
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">
                  Replies from Users ({replies.length})
                </h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {replies.length === 0 ? (
                    <p className="text-sm text-gray-500">No replies yet.</p>
                  ) : (
                    replies.map((r) => (
                      <div
                        key={r._id}
                        className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700"
                      >
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {r.repliedBy?.name}{" "}
                          <span className="text-gray-400 font-normal">
                            ({r.repliedBy?.role})
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {r.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-gray-500">
                <svg
                  className="w-16 h-16 text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  ></path>
                </svg>
                <p>Click on a notice from the left side to view replies.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
