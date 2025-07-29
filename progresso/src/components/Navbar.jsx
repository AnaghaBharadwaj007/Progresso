import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full p-4 bg-white shadow-md flex justify-between items-center">
      {/* Logo - Links to Home Page */}
      <div className="flex items-center space-x-2">
        <Link to="/" className="flex items-center space-x-2">
          {/* Progresso Logo SVG - Consistent with your Home/SignIn pages */}
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

      {/* Main Navigation Links */}
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

      {/* Auth Button on the right - consistent with Home page's "Try Now" */}
      <div>
        <Link
          to="/signin"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}
