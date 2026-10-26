import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState(""); // 👈 Naya State
  const [department, setDepartment] = useState(""); // 👈 Naya State

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/users/me");
        setUser(data.user);
        setName(data.user.name);
        setEmployeeId(data.user.employeeId || ""); // 👈 Data load karein
        setDepartment(data.user.department || ""); // 👈 Data load karein
      } catch (err) {
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      // 👇 Ab hum teeno fields bhej rahe hain
      const payload = { name };
      if (user.role === "teacher") {
        payload.employeeId = employeeId;
        payload.department = department;
      }

      const { data } = await api.patch("/users/me", payload);
      setMsg("Profile updated successfully!");
      setIsEditing(false);

      // LocalStorage update karein
      const localUser = JSON.parse(localStorage.getItem("user"));
      localUser.name = data.user.name;
      if (user.role === "teacher") {
        localUser.employeeId = data.user.employeeId;
        localUser.department = data.user.department;
      }
      localStorage.setItem("user", JSON.stringify(localUser));

      // State update karein
      setUser(data.user);

      window.dispatchEvent(new Event("storage"));
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-fade-in-up transition-colors duration-300">
          {/* Cover Banner */}
          <div className="h-64 bg-[#0f172a] dark:bg-black relative overflow-hidden transition-colors duration-300">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 dark:bg-blue-800 rounded-full mix-blend-screen filter blur-[80px] opacity-50 animate-pulse transition-colors duration-300"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 dark:bg-purple-900 rounded-full mix-blend-screen filter blur-[80px] opacity-40 transition-colors duration-300"></div>

            <div className="absolute top-6 right-8">
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-bold tracking-widest uppercase shadow-lg">
                {user.role} Portal
              </span>
            </div>
          </div>

          <div className="px-8 pb-10">
            {/* Avatar Area */}
            <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-8 gap-6">
              <div className="relative group">
                <div className="w-36 h-36 bg-white dark:bg-gray-800 rounded-full p-2 shadow-2xl transition-all duration-500 group-hover:scale-105">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 text-[#4f46e5] dark:text-blue-400 rounded-full flex items-center justify-center text-6xl font-black border-2 border-white dark:border-gray-800 transition-colors duration-300">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full flex items-center justify-center shadow-md transition-colors duration-300">
                  <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
                </div>
              </div>

              <div className="text-center sm:text-left flex-1 pb-2">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight transition-colors duration-300">
                  {user.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mt-1 flex items-center justify-center sm:justify-start gap-2 transition-colors duration-300">
                  <svg
                    className="w-5 h-5 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                  {user.email}
                </p>
              </div>

              <div className="hidden sm:block pb-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-all shadow-lg flex items-center gap-2 hover:-translate-y-0.5"
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
                  {isEditing ? "Cancel Edit" : "Edit Profile"}
                </button>
              </div>
            </div>

            {msg && (
              <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-2xl mb-6 text-sm text-center font-bold border border-green-200 dark:border-green-800 animate-fade-in-up transition-colors duration-300">
                {msg}
              </div>
            )}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-sm text-center font-bold border border-red-200 dark:border-red-800 transition-colors duration-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Account Details Box */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-500 dark:text-blue-400"
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
                    Account Info
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold mb-1">
                        Status
                      </p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-bold capitalize">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {user.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold mb-1">
                        Role
                      </p>
                      <p className="text-gray-900 dark:text-white font-bold capitalize">
                        {user.role}
                      </p>
                    </div>

                    {user.role === "student" && user.studentId && (
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold mb-1">
                          Student ID
                        </p>
                        <p className="text-gray-900 dark:text-white font-bold">
                          {user.studentId}
                        </p>
                      </div>
                    )}

                    {user.role === "teacher" && (
                      <>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold mb-1">
                            Employee ID
                          </p>
                          <p className="text-gray-900 dark:text-white font-bold">
                            {user.employeeId || "Not Provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold mb-1">
                            Department
                          </p>
                          <p className="text-gray-900 dark:text-white font-bold">
                            {user.department || "Not Provided"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Info Box */}
              <div className="md:col-span-2">
                <div className="bg-white dark:bg-gray-800/30 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm h-full relative overflow-hidden transition-colors duration-300">
                  <div className="absolute -bottom-10 -right-10 opacity-5 dark:opacity-10 transition-opacity duration-300">
                    <svg
                      className="w-64 h-64 text-blue-900 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 transition-colors duration-300">
                    Personal Information
                  </h3>

                  {isEditing ? (
                    <form
                      onSubmit={handleUpdate}
                      className="animate-fade-in-up relative z-10"
                    >
                      <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300"
                          required
                        />
                      </div>

                      {/* 👇 Teacher ke liye extra fields */}
                      {user.role === "teacher" && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                              Employee ID
                            </label>
                            <input
                              type="text"
                              value={employeeId}
                              onChange={(e) => setEmployeeId(e.target.value)}
                              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium text-gray-900 dark:text-white"
                              placeholder="TCH-101"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                              Department
                            </label>
                            <input
                              type="text"
                              value={department}
                              onChange={(e) => setDepartment(e.target.value)}
                              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium text-gray-900 dark:text-white"
                              placeholder="Computer Science"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="animate-fade-in-up relative z-10">
                      <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed transition-colors duration-300">
                        Your profile information is currently visible to the
                        administrators. If you need to update your personal
                        details or fix a typo in your name, click the edit
                        button below.
                      </p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="sm:hidden bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg w-full"
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div
          className="mt-10 text-center animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors bg-white dark:bg-gray-900 px-6 py-3 rounded-full shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md"
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
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
