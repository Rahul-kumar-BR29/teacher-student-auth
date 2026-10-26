import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [isDark, setIsDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Ref for Click Outside logic
  const userMenuRef = useRef(null);

  // Theme load logic
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Theme change logic
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // 👇 Bahar click hone par Avatar menu band karne ka logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    setIsDark(false);
    navigate("/login");
  };

  // Check if we are on Notifications page
  const isNotificationPage = location.pathname.includes("/notifications");

  const getInitials = (name = "RR") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");

  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <h1 className="text-3xl font-black tracking-wider flex items-center gap-1 animate-shine cursor-default">
            <span className="text-[#111827] dark:text-white">RRID</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
              TECH
            </span>
          </h1>
        </Link>

        {/* Right Side Menu */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Notification Bell */}
          {user && !isNotificationPage && (
            <Link
              to={
                user?.role === "admin"
                  ? "/admin/notices"
                  : user?.role === "teacher"
                    ? "/teacher/notices"
                    : "/notifications"
              }
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm relative"
              title="Notifications"
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-gray-800"></span>
            </Link>
          )}

          {/* Dark Mode Toggle */}
          {user && (
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
              title="Toggle Dark Mode"
            >
              {isDark ? (
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
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
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
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  ></path>
                </svg>
              )}
            </button>
          )}

          {/* User Info & Logout / Avatar */}
          {user ? (
            <div className="flex items-center space-x-6">
              <Link
                to="/profile"
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hidden sm:block"
              >
                Hi, {user.name}
              </Link>

              {/* 👇 Avatar Dropdown (Only on Notification Page) 👇 */}
              {isNotificationPage ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white shadow-md focus:outline-none"
                  >
                    {getInitials(user?.name)}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 bg-emerald-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-12 w-64 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-xl z-50 animate-fade-in-up">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mb-3">
                        {user?.email}
                      </p>
                      <div className="flex items-center justify-between text-xs font-medium mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md uppercase">
                          {user?.role}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md uppercase">
                          {user?.status || "Active"}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-500 py-1.5"
                        >
                          My Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left text-sm font-medium text-red-500 hover:text-red-600 py-1.5 mt-1"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Normal Logout Button (Other Pages) */
                <button
                  onClick={handleLogout}
                  className="bg-gray-900 dark:bg-gray-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-600 transition-all shadow-md hover:-translate-y-0.5"
                >
                  Logout
                </button>
              )}
            </div>
          ) : (
            <div className="space-x-4 text-sm font-bold">
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:-translate-y-0.5"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
