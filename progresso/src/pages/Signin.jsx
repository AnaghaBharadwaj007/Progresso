import { useState } from "react";
import {
  FaEnvelope,
  FaExclamationTriangle,
  FaLock,
  FaSpinner,
} from "react-icons/fa"; // Import icons

import supabase from "../supabaseClient"; // Make sure this path is correct

function Signin({ onSignInSuccess, onSignUpClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    // --- START Supabase Integration ---
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: email,
        password: password,
      }
    );
    // --- END Supabase Integration ---

    if (signInError) {
      console.error("Supabase Sign-in Error:", signInError.message);
      setError(signInError.message); // Display error from Supabase
    } else if (data.user) {
      // Sign-in successful
      console.log("Supabase Sign-in successful! User:", data.user);
      // Pass username (from user_metadata if stored, or email) to App.jsx
      // Assuming 'name' is stored in user_metadata during SignUp
      onSignInSuccess(
        data.user.user_metadata?.name || data.user.email || "User"
      );
    } else {
      // This case might happen if no error but also no user (e.g., email not confirmed)
      setError(
        "Sign-in failed. Please check your credentials or verify your email."
      );
    }
    setLoading(false); // End loading
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl p-10 space-y-8 animate-fade-in-up">
        <div className="flex justify-center mb-6">
          {/* Progresso Logo - Consistent with Home and Sign Up */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
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
        </div>
        <h2 className="text-center text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">
          Sign In to Progresso
        </h2>
        <p className="mt-2 text-center text-lg text-gray-600">
          Access your unified coding journey
        </p>

        <form onSubmit={handleSignIn} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="appearance-none rounded-t-md relative block w-full px-4 py-3 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="appearance-none rounded-b-md relative block w-full px-4 py-3 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div
              className="flex items-center p-3 bg-red-50 text-red-700 rounded-md text-base"
              role="alert"
            >
              <FaExclamationTriangle className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-xl font-semibold rounded-md text-white ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              }`}
            >
              {loading ? (
                <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              ) : null}
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>

        <p className="mt-2 text-center text-base text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={onSignUpClick}
            className="font-bold text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signin;
