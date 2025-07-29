import { FaSignOutAlt, FaSpinner } from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import supabase from "../supabaseClient";

export default function Navbar() {
  const { user, loading } = useAuth(); // Get user and loading state from AuthContext
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      alert("Error logging out: " + error.message);
    } else {
      console.log("Logged out successfully.");
      // AuthContext will automatically update 'user' to null,
      // and ProtectedRoutes will handle redirection if on a protected page.
      // We can explicitly navigate to home for a clean logout flow.
      navigate("/");
    }
  };

  // Get username from user metadata or email, if user exists
  const username =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "User";

  return (
    <nav className="w-full p-4 bg-white shadow-md flex justify-between items-center">
      {/* Logo - Links to Home Page */}
      <div className="flex items-center space-x-2">
        <Link to="/" className="flex items-center space-x-2">
          {/* Progresso Logo SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <path d="m10 10-2 2 2 2" />
            <path d="m14 14 2-2-2-2" />
          </svg>
          <span className="text-2xl font-bold text-gray-800">Progresso</span>
        </Link>
      </div>

      {/* Main Navigation Links (Visible only if logged in and not loading) */}
      {!loading && user && (
        <div className="flex items-center space-x-6">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `font-medium transition-colors duration-200 ${
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-gray-800 hover:text-blue-600"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/problems"
            className={({ isActive }) =>
              `font-medium transition-colors duration-200 ${
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-gray-800 hover:text-blue-600"
              }`
            }
          >
            Problems
          </NavLink>
          <NavLink
            to="/goals"
            className={({ isActive }) =>
              `font-medium transition-colors duration-200 ${
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-gray-800 hover:text-blue-600"
              }`
            }
          >
            Goals
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `font-medium transition-colors duration-200 ${
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-gray-800 hover:text-blue-600"
              }`
            }
          >
            Profile
          </NavLink>
        </div>
      )}

      {/* Auth Status / User Info on the right */}
      <div className="w-auto px-2 py-1">
        {" "}
        {/* Container to prevent layout shift */}
        {loading ? (
          <FaSpinner className="animate-spin text-blue-600 text-xl" />
        ) : user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-semibold">{username}!</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition duration-300 ease-in-out"
            >
              <FaSignOutAlt className="inline-block mr-1" /> Logout
            </button>
          </div>
        ) : (
          // Empty div if not logged in and not loading, as per requirement
          <div className="w-auto px-6 py-2"></div>
        )}
      </div>
    </nav>
  );
}
