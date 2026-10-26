import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    pendingTeachers: 0,
  });

  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    audience: "all",
  });
  const [noticeMsg, setNoticeMsg] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(null);
  const [listData, setListData] = useState([]);
  const [isListLoading, setIsListLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    setActiveTab(null);
    setSearchTerm("");
    setStatusFilter("all");

    try {
      const [teachersRes, statsRes, noticesRes] = await Promise.all([
        api.get("/admin/teachers/pending"),
        api.get("/admin/stats"),
        api.get("/notices"),
      ]);
      setTeachers(teachersRes.data.teachers);
      setStats(statsRes.data.stats);
      setNotices(noticesRes.data.notices);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/login");
      } else {
        setError("Failed to load data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id, decision) => {
    try {
      await api.patch(`/admin/teachers/${id}/approval`, { decision });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    setNoticeMsg("");
    try {
      await api.post("/notices", newNotice);
      setNewNotice({ title: "", content: "", audience: "all" });
      setNoticeMsg("Notice posted successfully!");
      loadData();
      setTimeout(() => setNoticeMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post notice");
    }
  };

  const handleDeleteNotice = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await api.delete(`/notices/${id}`);
        loadData();
      } catch (err) {
        alert("Failed to delete notice");
      }
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this user? This action cannot be undone.",
      )
    ) {
      try {
        await api.delete(`/admin/users/${id}`);
        loadData();
        setSelectedUser(null);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleCardClick = async (type) => {
    if (activeTab === type) {
      setActiveTab(null);
      return;
    }

    setActiveTab(type);
    setIsListLoading(true);
    setListData([]);
    setSearchTerm("");
    setStatusFilter("all");

    try {
      let query = "";
      if (type === "students") query = "?role=student&status=active";
      if (type === "teachers") query = "?role=teacher";
      if (type === "pending") query = "?role=teacher&status=pending";

      const { data } = await api.get(`/admin/users${query}`);

      let finalData = data.users;
      if (type === "teachers") {
        finalData = data.users.filter((u) => u.status !== "pending");
      }

      setListData(finalData);
    } catch (err) {
      alert("Failed to load list. Please check backend.");
    } finally {
      setIsListLoading(false);
    }
  };

  const filteredList = listData.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors duration-300">
              Admin Dashboard
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300">
                Superuser
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium transition-colors duration-300">
              Manage teacher approvals and monitor platform stats.
            </p>
          </div>
          <button
            onClick={loadData}
            className="mt-4 md:mt-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
          >
            <svg
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            Refresh Page
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div
            onClick={() => handleCardClick("students")}
            className={`cursor-pointer p-6 rounded-3xl shadow-sm border relative overflow-hidden group hover:shadow-lg transition-all duration-300 animate-fade-in-up ${activeTab === "students" ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"}`}
            style={{ animationDelay: "0.1s" }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 transition-colors duration-300">
                  Total Students
                </p>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white transition-colors duration-300">
                  {stats.totalStudents}
                </h3>
              </div>
            </div>
          </div>

          <div
            onClick={() => handleCardClick("teachers")}
            className={`cursor-pointer p-6 rounded-3xl shadow-sm border relative overflow-hidden group hover:shadow-lg transition-all duration-300 animate-fade-in-up ${activeTab === "teachers" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"}`}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-none">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 transition-colors duration-300">
                  Teachers List
                </p>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white transition-colors duration-300">
                  {stats.totalTeachers}
                </h3>
              </div>
            </div>
          </div>

          <div
            onClick={() => handleCardClick("pending")}
            className={`cursor-pointer p-6 rounded-3xl shadow-sm border relative overflow-hidden group hover:shadow-lg transition-all duration-300 animate-fade-in-up ${activeTab === "pending" ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"}`}
            style={{ animationDelay: "0.3s" }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 dark:bg-yellow-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200 dark:shadow-none">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 transition-colors duration-300">
                  Pending Requests
                </p>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white transition-colors duration-300">
                  {stats.pendingTeachers}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC LIST SECTION */}
        {activeTab && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-8 animate-fade-in-up transition-colors duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 transition-colors duration-300">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white capitalize flex items-center gap-2 transition-colors duration-300">
                {activeTab === "students"
                  ? "All Students List"
                  : activeTab === "teachers"
                    ? "All Teachers List (Active & Rejected)"
                    : "Pending Requests List"}
              </h2>
              <button
                onClick={() => setActiveTab(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm transition-colors duration-300"
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
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-900 transition-colors duration-300">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300"
                />
              </div>

              {activeTab === "teachers" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer transition-colors duration-300"
                >
                  <option value="all">All Teachers</option>
                  <option value="active">Active Only</option>
                  <option value="rejected">Rejected Only</option>
                </select>
              )}
            </div>

            {isListLoading ? (
              <div className="p-10 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 dark:border-blue-400"></div>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">
                No users found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <tr>
                      <th className="px-8 py-4 font-bold">Name</th>
                      <th className="px-8 py-4 font-bold">Email</th>
                      <th className="px-8 py-4 font-bold">Status</th>
                      {activeTab === "pending" && (
                        <th className="px-8 py-4 font-bold text-right">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors duration-300">
                    {filteredList.map((u) => (
                      <tr
                        key={u._id}
                        onClick={() => setSelectedUser(u)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      >
                        <td className="px-8 py-4 font-bold text-gray-800 dark:text-white transition-colors duration-300">
                          {u.name}
                        </td>
                        <td className="px-8 py-4 text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          {u.email}
                        </td>
                        <td className="px-8 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize transition-colors duration-300 ${
                              u.status === "active"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : u.status === "pending"
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        {activeTab === "pending" && (
                          <td className="px-8 py-4 text-right flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(u._id, "approve");
                              }}
                              className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 shadow-md shadow-green-200 dark:shadow-none"
                            >
                              Approve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(u._id, "reject");
                              }}
                              className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Reject
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pending Teachers Table Section */}
        {!activeTab && (
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in-up transition-colors duration-300"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 transition-colors duration-300">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-indigo-500 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  ></path>
                </svg>
                Teacher Approval Requests
              </h2>
              <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 py-1 px-3 rounded-full text-sm font-bold transition-colors duration-300">
                {teachers.length} Pending
              </span>
            </div>

            {error && (
              <div className="p-6 text-red-500 font-medium text-center">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="p-10 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
              </div>
            ) : teachers.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center transition-colors duration-300">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 transition-colors duration-300">
                  <svg
                    className="w-10 h-10 text-gray-300 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white transition-colors duration-300">
                  All caught up!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                  No pending teacher requests at the moment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                      <th className="px-8 py-4 font-bold">Teacher Name</th>
                      <th className="px-8 py-4 font-bold">Contact Info</th>
                      <th className="px-8 py-4 font-bold">Department</th>
                      <th className="px-8 py-4 font-bold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors duration-300">
                    {teachers.map((t) => (
                      <tr
                        key={t._id}
                        onClick={() => setSelectedUser(t)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg transition-colors duration-300">
                              {t.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 dark:text-white transition-colors duration-300">
                                {t.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                {t.employeeId || "No ID"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                            {t.email}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-semibold transition-colors duration-300">
                            {t.department || "N/A"}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(t._id, "approve");
                              }}
                              className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 shadow-md shadow-green-200 dark:shadow-none transition-all hover:-translate-y-0.5 flex items-center gap-1"
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
                                  d="M5 13l4 4L19 7"
                                ></path>
                              </svg>{" "}
                              Approve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(t._id, "reject");
                              }}
                              className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:-translate-y-0.5 flex items-center gap-1"
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
                                  d="M6 18L18 6M6 6l12 12"
                                ></path>
                              </svg>{" "}
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* USER DETAILS MODAL (POPUP) */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm animate-fade-in transition-colors duration-300">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-transparent dark:border-gray-800 transition-colors duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 p-6 relative transition-colors duration-300">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
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
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-2xl font-black text-blue-600 dark:text-blue-400 shadow-lg transition-colors duration-300">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedUser.name}
                    </h3>
                    <p className="text-blue-200 dark:text-blue-300 text-sm transition-colors duration-300">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">
                      Role
                    </p>
                    <p className="font-bold text-gray-800 dark:text-white capitalize transition-colors duration-300">
                      {selectedUser.role}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">
                      Status
                    </p>
                    <p
                      className={`font-bold capitalize transition-colors duration-300 ${
                        selectedUser.status === "active"
                          ? "text-green-600 dark:text-green-400"
                          : selectedUser.status === "pending"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {selectedUser.status}
                    </p>
                  </div>
                </div>

                {selectedUser.role === "student" && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">
                      Student ID
                    </p>
                    <p className="font-bold text-gray-800 dark:text-white transition-colors duration-300">
                      {selectedUser.studentId || "Not Provided"}
                    </p>
                  </div>
                )}

                {selectedUser.role === "teacher" && (
                  <>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">
                        Employee ID
                      </p>
                      <p className="font-bold text-gray-800 dark:text-white transition-colors duration-300">
                        {selectedUser.employeeId || "Not Provided"}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">
                        Department
                      </p>
                      <p className="font-bold text-gray-800 dark:text-white transition-colors duration-300">
                        {selectedUser.department || "Not Provided"}
                      </p>
                    </div>
                  </>
                )}

                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">
                    Joined On
                  </p>
                  <p className="font-bold text-gray-800 dark:text-white transition-colors duration-300">
                    {new Date(selectedUser.createdAt).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </p>
                </div>
              </div>

              {/* FOOTER: Approve/Reject AND Delete Buttons */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-3 transition-colors duration-300">
                {selectedUser.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleApprove(selectedUser._id, "approve");
                        setSelectedUser(null);
                      }}
                      className="flex-1 bg-green-500 text-white py-2.5 rounded-xl font-bold hover:bg-green-600 transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleApprove(selectedUser._id, "reject");
                        setSelectedUser(null);
                      }}
                      className="flex-1 bg-white dark:bg-gray-700 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 py-2.5 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(selectedUser._id)}
                  className="w-full bg-red-600 text-white py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200 dark:shadow-none"
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
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
