import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, X, Search, Megaphone, Mail, CheckCircle } from "lucide-react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function TeacherNotifications() {
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [replies, setReplies] = useState([]);
  const [noticeReplyText, setNoticeReplyText] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isReplyLoading, setIsReplyLoading] = useState(false);

  // Gmail-style States
  const [readNotices, setReadNotices] = useState([]);
  const [starredNotices, setStarredNotices] = useState([]);
  const [activeTab, setActiveTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");

  // Student Mails States
  const [studentMails, setStudentMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [mailReplies, setMailReplies] = useState([]);
  const [mailReplyText, setMailReplyText] = useState("");
  const [isMailReplyLoading, setIsMailReplyLoading] = useState(false);

  // Post Notice Modal States
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: "", content: "" });
  const [toastMsg, setToastMsg] = useState("");

  // Student Info Modal State
  const [selectedStudentInfo, setSelectedStudentInfo] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const noticesRes = await api.get("/notices");
        setNotices(noticesRes.data.notices);

        const mailsRes = await api.get("/messages/inbox");
        setStudentMails(mailsRes.data.messages || []);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403)
          navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // ================= NOTICE LOGIC =================
  const handleOpenNotice = async (notice) => {
    setSelectedNotice(notice);
    setSelectedMail(null);
    setMsg("");
    setNoticeReplyText("");
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

  const handleNoticeReply = async (e) => {
    e.preventDefault();
    if (!noticeReplyText.trim()) return;

    try {
      await api.post(`/notices/${selectedNotice._id}/reply`, {
        message: noticeReplyText,
      });
      setToastMsg("Reply sent successfully!");
      setNoticeReplyText("");

      const { data } = await api.get(`/notices/${selectedNotice._id}/replies`);
      setReplies(data.replies);

      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      setToastMsg("Failed to send reply.");
      setTimeout(() => setToastMsg(""), 3000);
    }
  };

  // ================= MAIL LOGIC =================
  const handleOpenMail = async (mail) => {
    setSelectedMail(mail);
    setSelectedNotice(null);
    setMailReplyText("");
    setIsMailReplyLoading(true);

    try {
      const { data } = await api.get(`/messages/${mail._id}/replies`);
      setMailReplies(data.replies || []);
    } catch (err) {
      console.log(err);
    } finally {
      setIsMailReplyLoading(false);
    }
  };

  const handleMailReply = async (e) => {
    e.preventDefault();
    if (!mailReplyText.trim()) return;

    try {
      await api.post(`/messages/${selectedMail._id}/reply`, {
        message: mailReplyText,
      });
      setToastMsg("Reply sent successfully!");
      setMailReplyText("");

      const { data } = await api.get(`/messages/${selectedMail._id}/replies`);
      setMailReplies(data.replies || []);

      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      setToastMsg("Failed to send reply.");
      setTimeout(() => setToastMsg(""), 3000);
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

  const filteredMails = studentMails.filter((m) => {
    return (
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const combinedMessages = [
    ...filteredNotices.map((n) => ({ ...n, type: "notice" })),
    ...filteredMails.map((m) => ({ ...m, type: "mail" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const unreadCount = notices.filter(
    (n) => !readNotices.includes(n._id),
  ).length;

  const handlePostNotice = async (e) => {
    e.preventDefault();
    try {
      await api.post("/notices", { ...noticeForm, audience: "student" });
      setToastMsg("Notice sent to students successfully!");
      setShowNoticeModal(false);
      setNoticeForm({ title: "", content: "" });

      const { data } = await api.get("/notices");
      setNotices(data.notices);

      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      setToastMsg("Failed to send notice.");
      setTimeout(() => setToastMsg(""), 3000);
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
              setSelectedMail(null);
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
                setSelectedMail(null);
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
                setSelectedMail(null);
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

            <button
              onClick={() => setShowNoticeModal(true)}
              className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-r-full font-bold text-sm transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800`}
            >
              <Megaphone size={20} />
              Send Notice
            </button>
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
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-gray-300 dark:focus:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white outline-none transition-all"
              />
            </div>
          </header>

          {/* ================= 1. STUDENT MAIL DETAIL VIEW ================= */}
          {selectedMail ? (
            <div className="flex flex-col animate-fade-in absolute left-0 right-0 bottom-0 top-[73px] bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                <button
                  onClick={() => setSelectedMail(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-700 dark:text-gray-300"
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
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
                <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() =>
                          setSelectedStudentInfo(selectedMail.sender)
                        }
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg cursor-pointer hover:ring-4 ring-indigo-200 dark:ring-indigo-900 transition-all"
                      >
                        {selectedMail.sender?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {selectedMail.sender?.name || "Student"}
                          <span className="text-sm font-normal text-gray-500">
                            &lt;{selectedMail.sender?.email}&gt;
                          </span>
                        </h2>
                        <p className="text-xs text-gray-500">to me</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(selectedMail.createdAt).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 ml-14">
                    {selectedMail.subject}
                  </h1>
                  <div className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-[15px] ml-14">
                    {selectedMail.content}
                  </div>
                </div>

                <div className="ml-14 space-y-4 mb-6">
                  {isMailReplyLoading ? (
                    <div className="flex py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : mailReplies.length > 0 ? (
                    mailReplies.map((r) => (
                      <div
                        key={r._id}
                        className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700"
                      >
                        <p className="text-xs font-bold text-gray-500 mb-1">
                          {r.repliedBy?.name} ({r.repliedBy?.role})
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {r.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No replies yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Fixed Reply Box (Mail) */}
              <div className="p-4 bg-[#f0f2f5] dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
                <form
                  onSubmit={handleMailReply}
                  className="flex items-center gap-3 max-w-5xl mx-auto"
                >
                  <button
                    type="button"
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-500 hover:text-gray-700 transition-colors shrink-0"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      ></path>
                    </svg>
                  </button>
                  <div className="flex-1 relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-sm h-12 px-4">
                    <input
                      type="text"
                      value={mailReplyText}
                      onChange={(e) => setMailReplyText(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-800 dark:text-white outline-none"
                    />
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md transition-transform hover:scale-105 shrink-0"
                  >
                    <svg
                      className="w-5 h-5 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          ) : selectedNotice ? (
            /* ================= 2. NOTICE DETAIL VIEW ================= */
            <div className="flex flex-col animate-fade-in absolute left-0 right-0 bottom-0 top-[73px] bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-700 dark:text-gray-300"
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
                  onClick={(e) => {
                    markAsUnread(selectedNotice._id, e);
                    setSelectedNotice(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
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
              </div>

              {/* Fixed Reply Box (Notice) */}
              <div className="p-4 bg-[#f0f2f5] dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
                <form
                  onSubmit={handleNoticeReply}
                  className="flex items-center gap-3 max-w-5xl mx-auto"
                >
                  <button
                    type="button"
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-500 hover:text-gray-700 transition-colors shrink-0"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      ></path>
                    </svg>
                  </button>
                  <div className="flex-1 relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-sm h-12 px-4">
                    <input
                      type="text"
                      value={noticeReplyText}
                      onChange={(e) => setNoticeReplyText(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-800 dark:text-white outline-none"
                    />
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md transition-transform hover:scale-105 shrink-0"
                  >
                    <svg
                      className="w-5 h-5 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* ================= 3. COMBINED LIST VIEW ================= */
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900">
                {isLoading ? (
                  <div className="p-10 flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
                  </div>
                ) : combinedMessages.length === 0 ? (
                  <div className="p-10 text-center text-gray-500">
                    No messages found.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                    {combinedMessages.map((item) => {
                      if (item.type === "notice") {
                        const isUnread = !readNotices.includes(item._id);
                        const isStarred = starredNotices.includes(item._id);
                        return (
                          <div
                            key={`notice-${item._id}`}
                            onClick={() => handleOpenNotice(item)}
                            className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors group ${isUnread ? "bg-white dark:bg-gray-900 font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800" : "bg-[#f8fafc] dark:bg-gray-800/30 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                          >
                            <button
                              onClick={(e) => toggleStar(item._id, e)}
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
                              {item.postedByRole || "Admin"}
                            </span>
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <span
                                className={`text-sm truncate w-1/3 ${isUnread ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                              >
                                {item.title}
                              </span>
                              <span className="text-sm text-gray-400 truncate flex-1">
                                - {item.content}
                              </span>
                            </div>
                            <span
                              className={`shrink-0 text-xs ${isUnread ? "font-bold text-gray-800 dark:text-gray-200" : "text-gray-400"}`}
                            >
                              {new Date(item.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={`mail-${item._id}`}
                          onClick={() => handleOpenMail(item)}
                          className="flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors group bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="shrink-0 w-5 flex justify-center text-indigo-500">
                            <Mail size={18} />
                          </div>
                          <span className="shrink-0 w-24 text-sm truncate uppercase text-indigo-600 dark:text-indigo-400 font-bold">
                            {item.sender?.name || "Student"}
                          </span>
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="text-sm font-semibold truncate w-1/3 text-gray-900 dark:text-white">
                              {item.subject}
                            </span>
                            <span className="text-sm text-gray-400 truncate flex-1">
                              - {item.content}
                            </span>
                          </div>
                          <span className="shrink-0 text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Megaphone size={20} className="text-blue-500" /> Send Notice
              </h2>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePostNotice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notice Title
                </label>
                <input
                  type="text"
                  required
                  value={noticeForm.title}
                  onChange={(e) =>
                    setNoticeForm({ ...noticeForm, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={noticeForm.content}
                  onChange={(e) =>
                    setNoticeForm({ ...noticeForm, content: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm outline-none resize-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your notice here..."
                />
              </div>
              <div className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 text-sm font-bold text-center">
                🎓 Send to Students Only
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-lg"
              >
                <Send size={18} /> Send Notice
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedStudentInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl w-full max-w-sm border border-gray-100 dark:border-gray-800 animate-fade-in-up">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                  {selectedStudentInfo.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedStudentInfo.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedStudentInfo.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentInfo(null)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="text-sm text-gray-500 font-medium">Role</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                  {selectedStudentInfo.role || "Student"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="text-sm text-gray-500 font-medium">
                  Status
                </span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400 capitalize flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {selectedStudentInfo.status || "Active"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedStudentInfo(null)}
              className="w-full mt-6 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-medium text-white shadow-2xl animate-fade-in-up">
          <CheckCircle className="w-5 h-5 text-green-400" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
