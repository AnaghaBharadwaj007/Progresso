import { useState } from "react";
import { FaEnvelope, FaExclamationTriangle, FaLock } from "react-icons/fa"; // Import icons

function Signin({ onSignInSuccess, onSignUpClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(""); // Add error state

  const handleSignIn = async (e) => {
    // Made async to simulate network request
    e.preventDefault();
    setLoading(true); // Start loading
    setError(""); // Clear previous errors

    console.log("Attempting sign-in with:", { email, password });

    // --- Placeholder for actual Supabase authentication logic ---
    // In a real app, you'd call Supabase auth here
    // try {
    //   const { data, error: signInError } = await supabase.auth.signInWithPassword({
    //     email: email,
    //     password: password,
    //   });
    //   if (signInError) {
    //     setError(signInError.message);
    //   } else {
    //     console.log("Sign-in successful:", data);
    //     // Assuming data.user.user_metadata.name holds the username
    //     onSignInSuccess(data.user?.user_metadata?.name || data.user?.email || 'User');
    //   }
    // } catch (err) {
    //   setError("An unexpected error occurred during sign in.");
    //   console.error("Sign-in error:", err);
    // } finally {
    //   setLoading(false);
    // }

    // Simulate successful sign-in with delay
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const dummyUsername = email.split("@")[0]; // Use email prefix as dummy username
      onSignInSuccess(dummyUsername); // Pass a dummy username
      console.log("Sign-in successful!");
    } catch (err) {
      setError("Sign-in failed. Please check your credentials.");
      console.error("Simulated sign-in error:", err);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl p-10 space-y-8 animate-fade-in-up">
        {" "}
        {/* Increased max-w, padding, and added shadow/animation */}
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
          {" "}
          {/* Increased font size */}
          Sign In to Progresso
        </h2>
        <p className="mt-2 text-center text-base text-gray-600">
          {" "}
          {/* Increased font size */}
          Access your unified coding journey
        </p>
        <form onSubmit={handleSignIn} className="mt-8 space-y-6">
          {" "}
          {/* Increased spacing */}
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>{" "}
              {/* sr-only for accessibility */}
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />{" "}
                {/* Added icon and adjusted padding */}
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
              </label>{" "}
              {/* sr-only for accessibility */}
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />{" "}
                {/* Added icon and adjusted padding */}
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
              {" "}
              {/* Increased font size */}
              <FaExclamationTriangle className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading} // Disable button when loading
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
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>
        <p className="text-center text-base text-gray-600">
          {" "}
          {/* Increased font size */}
          Don't have an account?{" "}
          <button
            onClick={onSignUpClick}
            className="text-blue-600 hover:text-blue-800 font-bold focus:outline-none"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signin;
