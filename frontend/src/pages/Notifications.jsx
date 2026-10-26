import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Send, X, Sun, Moon, Search } from "lucide-react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Notifications() {
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isReplyLoading, setIsReplyLoading] = useState(false);

  // Gmail-style States
  const [readNotices, setReadNotices] = useState([]);
  const [starredNotices, setStarredNotices] = useState([]);
  const [activeTab, setActiveTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Mail States
  const [showMailModal, setShowMailModal] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [mailForm, setMailForm] = useState({
    receiverId: "",
    subject: "",
    content: "",
  });
  const [toastMsg, setToastMsg] = useState("");

  // 👇 Naye States: Teacher Search ke liye
  const [teacherSearch, setTeacherSearch] = useState("");
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { data } = await api.get("/notices");
        setNotices(data.notices);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403)
          navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, [navigate]);

  const handleOpenNotice = async (notice) => {
    setSelectedNotice(notice);
    setMsg("");
    setReplyText("");
    setIsReplyLoading(true);

    if (!readNotices.includes(notice._id)) {
      setReadNotices([...readNotices, notice._id]);
    }

    try {
      const { data } = await api.get(`/notices/${notice._id}/replies`);
      setReplies(data.replies);
    } catch (err) {
      console.log(err);
    } finally {
      setIsReplyLoading(false);
    }
  };

  const getInitials = (name = "RRID TECH") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await api.post(`/notices/${selectedNotice._id}/reply`, {
        message: replyText,
      });
      setMsg("Reply sent successfully!");
      setReplyText("");
      const { data } = await api.get(`/notices/${selectedNotice._id}/replies`);
      setReplies(data.replies);
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("Failed to send reply.");
    }
  };

  const toggleStar = (id, e) => {
    e.stopPropagation();
    if (starredNotices.includes(id))
      setStarredNotices(starredNotices.filter((sid) => sid !== id));
    else setStarredNotices([...starredNotices, id]);
  };

  const markAsUnread = (id, e) => {
    e.stopPropagation();
    setReadNotices(readNotices.filter((rid) => rid !== id));
  };

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "starred") return starredNotices.includes(n._id);
    return true;
  });

  const unreadCount = notices.filter(
    (n) => !readNotices.includes(n._id),
  ).length;

  // Mail Functions
  const fetchTeachers = async () => {
    try {
      const { data } = await api.get("/messages/teachers");
      setTeachersList(data.teachers);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSendMail = async (e) => {
    e.preventDefault();

    // 👇 Validation: Check if teacher is selected
    if (!mailForm.receiverId) {
      setToastMsg("Please select a teacher from the list.");
      setTimeout(() => setToastMsg(""), 3000);
      return;
    }

    try {
      await api.post("/messages", mailForm);
      setToastMsg("Mail sent to teacher successfully!");
      setShowMailModal(false);
      setMailForm({ receiverId: "", subject: "", content: "" });
      setTeacherSearch(""); // Reset search
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      setToastMsg("Failed to send mail.");
      setTimeout(() => setToastMsg(""), 3000);
    }
  };

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-[1400px] mx-auto h-[calc(100vh-80px)] flex bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
        {/* ================= LEFT SIDEBAR ================= */}
        <div className="w-64 hidden md:flex flex-col border-r border-gray-100 dark:border-gray-800 bg-[#f8fafc] dark:bg-gray-900/50 p-4">
          <button
            onClick={() => {
              setSelectedNotice(null);
              setActiveTab("inbox");
            }}
            className="flex items-center gap-3 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-md hover:bg-blue-700 transition-all w-max mb-6"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              ></path>
            </svg>
            View All
          </button>

          <nav className="space-y-1">
            <button
              onClick={() => {
                setActiveTab("inbox");
                setSelectedNotice(null);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full font-bold text-sm transition-colors ${activeTab === "inbox" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"}`}
            >
              <div className="flex items-center gap-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  ></path>
                </svg>
                Inbox
              </div>
              {unreadCount > 0 && (
                <span className="text-xs font-bold">{unreadCount}</span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("starred");
                setSelectedNotice(null);
              }}
              className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-r-full font-bold text-sm transition-colors ${activeTab === "starred" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                ></path>
              </svg>
              Starred
            </button>

            {user?.role === "student" && (
              <button
                onClick={() => {
                  setShowMailModal(true);
                  fetchTeachers();
                }}
                className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-r-full font-bold text-sm transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800`}
              >
                <Mail size={20} />
                Send Mail
              </button>
            )}
          </nav>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 relative">
          <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20">
            <div className="relative flex-1 max-w-xl">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-gray-300 dark:focus:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white outline-none transition-all"
              />
            </div>
          </header>

          {selectedNotice ? (
            /* ================= GMAIL STYLE DETAIL VIEW ================= */
            <div className="flex flex-col h-full animate-fade-in absolute inset-0 bg-white dark:bg-gray-900 z-10 top-[73px]">
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-700 dark:text-gray-300"
                  title="Back"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    ></path>
                  </svg>
                </button>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                  title="Archive"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    ></path>
                  </svg>
                </button>
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                  title="Delete"
                >
                  <svg
                    className="w-5 h-5"
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
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>
                <button
                  onClick={(e) => {
                    markAsUnread(selectedNotice._id, e);
                    setSelectedNotice(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                  title="Mark as unread"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                    ></path>
                  </svg>
                </button>
                <button
                  onClick={(e) => toggleStar(selectedNotice._id, e)}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors ${starredNotices.includes(selectedNotice._id) ? "text-yellow-500" : "text-gray-500 dark:text-gray-400"}`}
                  title="Star"
                >
                  <svg
                    className="w-5 h-5"
                    fill={
                      starredNotices.includes(selectedNotice._id)
                        ? "currentColor"
                        : "none"
                    }
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
                <div className="mb-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${selectedNotice.postedByRole === "admin" ? "bg-purple-600" : "bg-orange-500"}`}
                      >
                        {selectedNotice.postedByRole === "admin" ? "A" : "T"}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {selectedNotice.postedByRole || "Admin"}
                          <span className="text-xs font-normal text-gray-400">
                            &lt;
                            {selectedNotice.postedBy?.email ||
                              "admin@rridtech.com"}
                            &gt;
                          </span>
                        </h2>
                        <p className="text-xs text-gray-500">to me</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(selectedNotice.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 ml-14">
                    {selectedNotice.title}
                  </h1>
                  <div className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-[15px] ml-14">
                    {selectedNotice.content}
                  </div>
                </div>

                <div className="ml-14 border-t border-gray-100 dark:border-gray-800 my-6"></div>

                <div className="ml-14 space-y-6">
                  {isReplyLoading ? (
                    <div className="flex py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : replies.length > 0 ? (
                    replies.map((r) => {
                      const isMyReply = r.repliedBy?._id === user.id;
                      return (
                        <div
                          key={r._id}
                          className={`flex flex-col ${isMyReply ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl p-4 ${isMyReply ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800" : "bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"}`}
                          >
                            <p className="text-xs font-bold text-gray-500 mb-1">
                              {r.repliedBy?.name} {isMyReply && "(You)"}
                            </p>
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              {r.message}
                            </p>
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1">
                            {new Date(r.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No replies yet.
                    </p>
                  )}
                </div>

                <div className="ml-14 mt-8 mb-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-white dark:bg-gray-800">
                      <form onSubmit={handleReply}>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Click here to reply..."
                          className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm text-gray-800 dark:text-gray-200"
                          rows="3"
                        ></textarea>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex gap-2">
                            <span className="text-xl cursor-pointer hover:bg-gray-100 p-1 rounded">
                              📎
                            </span>
                            <span className="text-xl cursor-pointer hover:bg-gray-100 p-1 rounded">
                              😊
                            </span>
                          </div>
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                          >
                            Send
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
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                  {msg && (
                    <p className="text-green-600 text-xs font-bold mt-2 ml-1">
                      {msg}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ================= LIST VIEW ================= */
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <div className="p-10 flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
                  </div>
                ) : filteredNotices.length === 0 ? (
                  <div className="p-10 text-center text-gray-500">
                    No messages found.
                  </div>
                ) : (
                  filteredNotices.map((n) => {
                    const isUnread = !readNotices.includes(n._id);
                    const isStarred = starredNotices.includes(n._id);

                    return (
                      <div
                        key={n._id}
                        onClick={() => handleOpenNotice(n)}
                        className={`flex items-center gap-4 px-6 py-4 cursor-pointer border-b border-gray-100 dark:border-gray-800/50 transition-colors group ${isUnread ? "bg-white dark:bg-gray-900 font-bold text-gray-900 dark:text-white hover:bg-gray-50" : "bg-[#f8fafc] dark:bg-gray-800/30 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                      >
                        <button
                          onClick={(e) => toggleStar(n._id, e)}
                          className={`shrink-0 transition-colors ${isStarred ? "text-yellow-400" : "text-gray-300 dark:text-gray-600 hover:text-yellow-400"}`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill={isStarred ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            ></path>
                          </svg>
                        </button>

                        <span
                          className={`shrink-0 w-24 text-sm truncate uppercase ${isUnread ? "text-gray-900 dark:text-white" : "text-gray-500"}`}
                        >
                          {n.postedByRole || "Admin"}
                        </span>

                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <span
                            className={`text-sm truncate w-1/3 ${isUnread ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                          >
                            {n.title}
                          </span>
                          <span className="text-sm text-gray-400 truncate flex-1">
                            {" "}
                            - {n.content}
                          </span>
                        </div>

                        <span
                          className={`shrink-0 text-xs ${isUnread ? "font-bold text-gray-800" : "text-gray-400"}`}
                        >
                          {new Date(n.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 👇 Mail Modal (Search Feature ke saath) 👇 */}
      {showMailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Mail size={20} className="text-blue-500" /> New Message
              </h2>
              <button
                onClick={() => setShowMailModal(false)}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendMail} className="space-y-4">
              {/* 👇 Teacher Search Input 👇 */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search Teacher
                </label>

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Type teacher's name..."
                    value={teacherSearch}
                    onChange={(e) => {
                      setTeacherSearch(e.target.value);
                      setShowTeacherDropdown(true);
                      if (mailForm.receiverId)
                        setMailForm({ ...mailForm, receiverId: "" });
                    }}
                    onFocus={() => setShowTeacherDropdown(true)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Dropdown Suggestions */}
                {showTeacherDropdown && teacherSearch && (
                  <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                    {teachersList
                      .filter((t) =>
                        t.name
                          .toLowerCase()
                          .includes(teacherSearch.toLowerCase()),
                      )
                      .map((t) => (
                        <div
                          key={t._id}
                          onClick={() => {
                            setMailForm({ ...mailForm, receiverId: t._id });
                            setTeacherSearch(t.name);
                            setShowTeacherDropdown(false);
                          }}
                          className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
                        >
                          <span className="font-bold">{t.name}</span>{" "}
                          <span className="text-xs text-gray-500">
                            ({t.department})
                          </span>
                        </div>
                      ))}
                    {teachersList.filter((t) =>
                      t.name
                        .toLowerCase()
                        .includes(teacherSearch.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No teacher found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={mailForm.subject}
                  onChange={(e) =>
                    setMailForm({ ...mailForm, subject: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={mailForm.content}
                  onChange={(e) =>
                    setMailForm({ ...mailForm, content: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm outline-none resize-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your message here..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-lg"
              >
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 👇 Toast Notification 👇 */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-medium text-white shadow-2xl animate-fade-in-up">
          <svg
            className="w-5 h-5 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
