import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [formData, setFormData] = useState({ employeeId: "", department: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  // 👇 Popup Logic: Sirf tab dikhao jab employeeId ya department khali ho
  // 👇 Popup Logic: Sirf tab dikhao jab teacher ho aur details database (localStorage) mein na hon
  useEffect(() => {
    if (user?.role === "teacher" && (!user.employeeId || !user.department)) {
      setShowCompleteProfile(true);
    } else {
      setShowCompleteProfile(false);
    }
  }, [user]);

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.department) {
      setMsg("Please fill both fields.");
      return;
    }

    try {
      // Backend ko update bhejein
      const { data } = await api.patch("/users/me", formData);

      // 👇 Sabse Important: LocalStorage mein purana data update karein
      const localUser = JSON.parse(localStorage.getItem("user"));
      localUser.employeeId = data.user.employeeId;
      localUser.department = data.user.department;
      localStorage.setItem("user", JSON.stringify(localUser));

      // Popup band karein aur page reload karein
      setShowCompleteProfile(false);
      window.location.reload();
    } catch (err) {
      setMsg("Failed to update profile. Try again.");
    }
  };
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                {user?.name?.split(" ")[0]}
              </span>
              ! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium transition-colors duration-300">
              Here is what's happening with your account today.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-3">
            <Link
              to="/profile"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm flex items-center gap-2"
            >
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              My Profile
            </Link>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Stat 1 */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center transition-colors duration-300">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Account Status
                </p>
                <h3 className="text-2xl font-black text-gray-800 dark:text-white capitalize">
                  {user?.status || "Active"}
                </h3>
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center transition-colors duration-300">
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
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Role
                </p>
                <h3 className="text-2xl font-black text-gray-800 dark:text-white capitalize">
                  {user?.role || "Student"}
                </h3>
              </div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 p-6 rounded-3xl shadow-lg border border-blue-500 dark:border-blue-800 relative overflow-hidden group transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-blue-100 dark:text-blue-300 uppercase tracking-wider mb-2">
                Need Help?
              </p>
              <h3 className="text-xl font-bold text-white mb-4">
                Check our documentation
              </h3>
              <button className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-2 px-4 rounded-lg backdrop-blur-sm transition-all">
                View Docs
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-500 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/profile"
                className="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white">
                  Update Profile
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Keep your personal information up to date.
                </p>
              </Link>

              <div className="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl opacity-60 cursor-not-allowed">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl flex items-center justify-center mb-4">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    ></path>
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white">
                  My Courses
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Coming soon in the next update.
                </p>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              System Info
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors duration-300">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Platform
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  RRID Tech Portal
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors duration-300">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Security
                </span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>{" "}
                  JWT Protected
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors duration-300">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Version
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  v1.0.0
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center transition-colors duration-300">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                © 2026 RRID Tech Private Limited.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 👇 Complete Profile Modal (Popup) 👇 */}
      {showCompleteProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up border border-gray-100 dark:border-gray-800">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Complete Your Profile
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Please provide your Employee ID and Department to continue as a
                Teacher.
              </p>
            </div>

            {msg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                {msg}
              </div>
            )}

            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="TCH-101"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="Computer Science"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
              >
                Submit Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
