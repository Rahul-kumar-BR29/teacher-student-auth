import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function Register() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleVerified, setIsGoogleVerified] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      let endpoint = "/auth/register"; // Default Student
      if (role === "teacher") endpoint = "/auth/teacher/register";

      // Agar Google verified teacher hai, toh naya API
      if (role === "teacher" && isGoogleVerified) {
        endpoint = "/auth/google-teacher-register";
      }

      const { data } = await api.post(endpoint, form);
      setMsg(data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      // Google se data form mein bhar do aur user se password maango
      setForm({
        ...form,
        name: decoded.name,
        email: decoded.email,
        password: "",
      });
      setIsGoogleVerified(true);
      setMsg("Google verified! Please set a password for your account.");
    } catch (err) {
      setError("Google verification failed. Please try again.");
    }
  };

  const resetForm = () => {
    setIsGoogleVerified(false);
    setForm({
      name: "",
      email: "",
      password: "",
      employeeId: "",
      department: "",
    });
    setMsg("");
    setError("");
    setPasswordStrength(0);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-gray-950 flex items-center justify-center p-4 sm:p-8 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-6xl rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[750px] border border-transparent dark:border-gray-800 transition-colors duration-300">
        {/* LEFT SIDE - BRANDING */}
        <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-[#1e3a8a] to-[#312e81] overflow-hidden flex-col justify-between p-12">
          {/* Background Glow Effects */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30"></div>

          {/* 👇 BACKGROUND WATERMARK TEXT 👇 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2 className="text-[100px] font-black text-white/5 whitespace-nowrap select-none">
              RRID TECH
            </h2>
          </div>
          {/* 👆 WATERMARK KHATAM 👆 */}

          {/* Top Logo Area */}
          <div className="relative z-10 w-max">
            <h1 className="text-4xl font-black tracking-wider flex items-center gap-1 animate-shine cursor-default">
              <span className="text-white">RRID</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                TECH
              </span>
            </h1>
            <p className="text-blue-200 text-sm mt-2 tracking-[0.4em] font-semibold uppercase">
              Private Limited
            </p>
          </div>

          {/* 👇 ANIMATION (Exactly in the middle) 👇 */}
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center pointer-events-none w-full">
            {/* Peeche ka rotating glow */}
            <div className="absolute w-72 h-72 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-spin-slow"></div>

            {/* Glowing Text */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-2xl font-bold tracking-widest uppercase animate-pulse">
                Innovation Starts Here
              </h3>

              {/* Typewriter Effect wali line */}
              <div className="flex items-center gap-2 mt-4 text-blue-300 font-mono text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                <span className="animate-pulse">System initializing...</span>
              </div>

              {/* Ek sundar si horizontal line jo chamak rahi hai */}
              <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent mt-6 animate-pulse"></div>
            </div>
          </div>
          {/* 👆 ANIMATION KHATAM 👆 */}

          {/* Bottom Animated Text */}
          <div className="relative z-10 animate-fade-in-up mt-auto">
            <h2 className="text-white text-5xl font-extrabold leading-tight mb-6">
              Join the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse">
                Future of Tech
              </span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-md">
              Create your account to access exclusive courses, connect with
              expert mentors, and build real-world skills.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative">
          <div className="max-w-md mx-auto w-full">
            <div className="flex justify-center mb-6">
              <img
                src="/logo.png"
                alt="RRID Tech Logo"
                className="h-20 w-auto object-contain dark:bg-white dark:p-2 dark:rounded-xl"
              />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Create an Account
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Join our learning ecosystem today
              </p>
            </div>

            {/* Role Toggle Buttons */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setRole("student");
                  resetForm();
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${role === "student" ? "bg-white dark:bg-gray-700 text-[#4f46e5] dark:text-blue-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("teacher");
                  resetForm();
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${role === "teacher" ? "bg-white dark:bg-gray-700 text-[#4f46e5] dark:text-blue-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
              >
                Teacher
              </button>
            </div>

            {msg && (
              <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-xl mb-4 text-sm text-center font-medium border border-green-100 dark:border-green-800">
                {msg}
              </div>
            )}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 text-sm text-center font-medium border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}

            {/* 👇 FORM START 👇 */}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-gray-900 dark:text-white"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={isGoogleVerified}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5] ${isGoogleVerified ? "bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-[#f8fafc] dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"}`}
                  placeholder="you@example.com"
                />
              </div>

              {role === "teacher" && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={form.employeeId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-gray-900 dark:text-white"
                      placeholder="TCH-101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-gray-900 dark:text-white"
                      placeholder="Science"
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={(e) => {
                      handleChange(e);
                      const val = e.target.value;
                      let strength = 0;
                      if (val.length > 5) strength++;
                      if (val.length > 7 && /[A-Z]/.test(val)) strength++;
                      if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val))
                        strength++;
                      setPasswordStrength(strength);
                    }}
                    required
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-gray-900 dark:text-white pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength === 1 ? "w-1/3 bg-red-500" : passwordStrength === 2 ? "w-2/3 bg-yellow-500" : passwordStrength === 3 ? "w-full bg-green-500" : "w-0"}`}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#4f46e5] text-white py-3.5 rounded-xl hover:bg-blue-700 transition-all duration-300 font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5"
              >
                Create Account
              </button>
            </form>

            {/* 👇 Backend OAuth Google Button (Register ke liye) 👇 */}
            <div className="mt-6 animate-fade-in-up">
              <div className="relative flex items-center justify-center mb-4">
                <div className="absolute border-t border-gray-300 dark:border-gray-700 w-full"></div>
                <span className="relative bg-white dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-gray-400">
                  Or register with
                </span>
              </div>

              <button
                onClick={() =>
                  (window.location.href =
                    "http://localhost:3000/api/auth/google")
                }
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-semibold text-gray-700 dark:text-gray-200 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="mt-6 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#4f46e5] dark:text-blue-400 font-bold hover:underline"
              >
                Log in
              </Link>
            </div>
            <div className="mt-4 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500 font-medium mb-3">
                © 2026 RRID Tech Private Limited. All rights reserved.
              </p>
              <div className="flex justify-center gap-5 text-xs font-bold text-[#4f46e5]">
                <Link to="#" className="hover:text-blue-800 transition-colors">
                  About
                </Link>
                <Link to="#" className="hover:text-blue-800 transition-colors">
                  Terms & Conditions
                </Link>
                <Link to="#" className="hover:text-blue-800 transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
