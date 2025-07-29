import { useState } from "react";
import {
  FaBookOpen,
  FaCode,
  FaEnvelope,
  FaExclamationTriangle,
  FaLink,
  FaLock,
  FaTerminal,
  FaUser,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import supabase from "../supabaseClient"; // Make sure this path is correct

export default function SignUp({ onSignUpSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [geeksforgeeksUrl, setGeeksforGeeksUrl] = useState("");
  const [hackerrankUrl, setHackerrankUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name || !email || !password) {
      setError("Please fill in all required fields (Name, Email, Password).");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    if (!leetcodeUrl && !geeksforgeeksUrl && !hackerrankUrl) {
      setError(
        "Please provide at least one coding platform profile URL to sync."
      );
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    // --- START Supabase Integration ---
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name, // Store name in user_metadata
          leetcode_url: leetcodeUrl, // Store LeetCode URL
          geeksforgeeks_url: geeksforgeeksUrl, // Store GeeksforGeeks URL
          hackerrank_url: hackerrankUrl, // Store HackerRank URL
        },
      },
    });
    // --- END Supabase Integration ---

    if (signUpError) {
      console.error("Supabase Sign-up Error:", signUpError.message);
      setError(signUpError.message); // Display error from Supabase
    } else if (data.user) {
      console.log("Supabase Sign-up successful! User:", data.user);
      alert(
        "Sign-up successful! Please check your email for a verification link."
      ); // Notify user about email verification
      if (onSignUpSuccess) {
        onSignUpSuccess(); // Navigate to sign-in page via prop
      }
    } else {
      // This case might happen if no error but also no user (e.g., confirmation email sent, but not immediately logged in)
      setError(
        "Sign-up initiated. Please check your email for a verification link."
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl p-10 space-y-8 animate-fade-in-up">
        {/* Increased max-w and padding */}
        <div>
          <h2 className="text-center text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">
            {/* Increased font size */}
            Join Progresso
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            {/* Increased font size */}
            Already a member?
            <Link
              to="/signin"
              className="font-semibold text-blue-600 hover:text-blue-700 ml-1 transition duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* General Account Details */}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-4 py-3 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                {/* Increased icon size and padding */}
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                {/* Increased icon size and padding */}
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-4 py-3 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Coding Platform Profiles Section */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
            {" "}
            {/* Increased padding */}
            <p className="block text-lg font-medium text-gray-700 mb-4 flex items-center">
              {" "}
              {/* Increased font size and mb */}
              <FaLink className="inline-block mr-3 text-blue-500 text-xl" />{" "}
              Connect Coding Profiles{" "}
              <span className="text-gray-500 ml-2 text-base">
                (At least one required)
              </span>{" "}
              {/* Increased icon size and font size for optional text */}
            </p>
            <div className="space-y-4">
              {/* LeetCode URL */}
              <div>
                <label htmlFor="leetcodeUrl" className="sr-only">
                  LeetCode Profile URL
                </label>
                <div className="relative">
                  <FaCode className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 text-xl" />{" "}
                  {/* Increased icon size and padding */}
                  <input
                    type="url"
                    id="leetcodeUrl"
                    name="leetcodeUrl"
                    className="appearance-none block w-full px-4 py-3 pl-12 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                    placeholder="LeetCode Profile URL"
                    value={leetcodeUrl}
                    onChange={(e) => setLeetcodeUrl(e.target.value)}
                  />
                </div>
              </div>
              {/* GeeksforGeeks URL */}
              <div>
                <label htmlFor="geeksforgeeksUrl" className="sr-only">
                  GeeksforGeeks Profile URL
                </label>
                <div className="relative">
                  <FaBookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 text-xl" />{" "}
                  {/* Increased icon size and padding */}
                  <input
                    type="url"
                    id="geeksforgeeksUrl"
                    name="geeksforgeeksUrl"
                    className="appearance-none block w-full px-4 py-3 pl-12 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                    placeholder="GeeksforGeeks Profile URL"
                    value={geeksforgeeksUrl}
                    onChange={(e) => setGeeksforGeeksUrl(e.target.value)}
                  />
                </div>
              </div>
              {/* HackerRank URL */}
              <div>
                <label htmlFor="hackerrankUrl" className="sr-only">
                  HackerRank Profile URL
                </label>
                <div className="relative">
                  <FaTerminal className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 text-xl" />{" "}
                  {/* Increased icon size and padding */}
                  <input
                    type="url"
                    id="hackerrankUrl"
                    name="hackerrankUrl"
                    className="appearance-none block w-full px-4 py-3 pl-12 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                    placeholder="HackerRank Profile URL"
                    value={hackerrankUrl}
                    onChange={(e) => setHackerrankUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div
              className="flex items-center p-3 bg-red-50 text-red-700 rounded-md text-base"
              role="alert"
            >
              {" "}
              {/* Increased font size */}
              <FaExclamationTriangle className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-xl font-semibold rounded-md text-white ${
                /* Increased text and padding */
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              }`}
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
