import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const role = searchParams.get("role");
    const errorParam = searchParams.get("error");
    const employeeId = searchParams.get("employeeId");
    const department = searchParams.get("department");

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setTimeout(() => {
        window.history.replaceState({}, document.title, "/login");
        setError("");
      }, 4000);
    }

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name,
          role,
          employeeId,
          department,
        }),
      );

      if (role === "admin") navigate("/admin");
      else navigate("/");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4">
      {/* Main Container - Split Screen */}
      <div className="bg-white w-full max-w-6xl rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[700px]">
        {/* ================= LEFT SIDE - BRANDING SECTION ================= */}
        <div className="hidden md:block w-1/2 relative bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#312e81] overflow-hidden">
          {/* Background Glowing Effects */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30"></div>

          <div className="absolute inset-0 p-12 flex flex-col justify-between z-10">
            {/* Top - Company Logo Text */}
            <div className="relative z-10 w-max">
              {/* Main Logo Text */}
              <h1 className="text-4xl font-black tracking-wider flex items-center gap-1 animate-shine cursor-default">
                <span className="text-[#111827]">RRID</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                  TECH
                </span>
              </h1>

              {/* Sub Text */}
              <p className="text-blue-200 text-sm mt-2 tracking-[0.4em] font-semibold uppercase">
                Private Limited
              </p>
            </div>

            {/* OPTION 2: Vertical Neon Lines */}
            <div className="relative z-10 my-8 flex items-center gap-6">
              {/* Glowing Lines */}
              <div className="flex flex-col gap-2">
                <div className="w-1 h-12 bg-gradient-to-b from-blue-500 to-transparent rounded-full"></div>
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-transparent rounded-full ml-2"></div>
                <div className="w-1 h-16 bg-gradient-to-b from-blue-400 to-transparent rounded-full"></div>
              </div>

              {/* Text */}
              <div>
                <p className="text-white text-2xl font-light leading-snug">
                  "Building the <br />
                  <span className="font-bold text-blue-400 animate-pulse">
                    Future of Tech
                  </span>
                  "
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  — Research & Discovery
                </p>
              </div>
            </div>
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
                Welcome to <br />
                <span className="text-white">RRID</span>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                  TECH
                </span>
              </h1>
              <p className="text-blue-400 font-medium tracking-[0.2em] uppercase text-sm mb-6">
                Innovate . Learn . Build
              </p>

              {/* Paragraph ko aur niche karne ke liye 'mt-8' (margin-top) add kiya hai */}
              <p className="text-gray-300 text-lg leading-relaxed max-w-md mt-10">
                A secure, seamless, and modern platform to connect Students,
                Teachers, and Administrators in one unified ecosystem.
              </p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE - LOGIN FORM ================= */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            {/* Logo Image */}
            <div className="flex justify-center mb-8 animate-fade-in-up">
              <img
                src="/logo.png"
                alt="RRID Tech Logo"
                className="h-24 w-auto object-contain"
              />
            </div>
            {/* Heading */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-gray-500 mt-2 font-medium">
                Log in to continue to your dashboard
              </p>
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-5 text-sm font-medium text-center border border-red-100 animate-pulse">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all text-gray-800 placeholder-gray-400 font-medium"
                  placeholder="hello@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all text-gray-800 placeholder-gray-400 font-medium pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        ></path>
                      </svg>
                    ) : (
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Link
                  to="/forgot-password"
                  className="text-sm font-bold text-[#4f46e5] hover:text-blue-800 transition-all"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-[#4f46e5] text-white py-3.5 px-4 rounded-xl hover:bg-blue-700 focus:outline-none transition-all duration-300 font-bold text-lg shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 mt-2 hover:-translate-y-1 hover:shadow-xl"
              >
                Log in
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
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  ></path>
                </svg>
              </button>
            </form>

            <div className="mt-6">
              <div className="relative flex items-center justify-center mb-4">
                <div className="absolute border-t border-gray-300 dark:border-gray-700 w-full"></div>
                <span className="relative bg-white dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>

              <button
                onClick={() =>
                  (window.location.href =
                    "http://localhost:3000/api/auth/google")
                }
                className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 rounded-xl py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
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
            <div className="mt-6 text-center text-sm font-medium text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#4f46e5] font-bold hover:underline transition-all"
              >
                Create Account
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
