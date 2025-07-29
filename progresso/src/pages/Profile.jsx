import { useEffect, useState } from "react"; // Import useEffect
import {
  FaBookOpen,
  FaCode,
  FaSave,
  FaSignOutAlt,
  FaSpinner,
  FaTerminal,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../AuthContext.jsx";
import supabase from "../supabaseClient";

export default function Profile() {
  // onLogout prop will be called by handleLogout directly
  const { user, loading: authLoading } = useAuth(); // Get user and loading state from AuthContext

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [geeksforgeeksUrl, setGeeksforGeeksUrl] = useState("");
  const [hackerrankUrl, setHackerrankUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // For saving/fetching operations specific to this component
  const [fetchError, setFetchError] = useState(null); // For errors during initial fetch

  // Effect to fetch user data and populate form fields on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setFetchError(null);

      if (authLoading) {
        // Wait for auth state to be loaded
        return;
      }

      if (user) {
        // User's email is directly on the user object
        setEmail(user.email || "");

        // Custom data (name, URLs) are in user_metadata
        setName(user.user_metadata?.name || "");
        setLeetcodeUrl(user.user_metadata?.leetcode_url || "");
        setGeeksforGeeksUrl(user.user_metadata?.geeksforgeeks_url || "");
        setHackerrankUrl(user.user_metadata?.hackerrank_url || "");
      } else {
        // If no user is logged in, clear fields and show error (ProtectedRoute should handle redirect)
        setName("");
        setEmail("");
        setLeetcodeUrl("");
        setGeeksforGeeksUrl("");
        setHackerrankUrl("");
        setFetchError("No user logged in. Please sign in.");
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [user, authLoading]); // Re-run when user or authLoading state changes

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!user) {
      setMessage({
        type: "error",
        text: "You must be logged in to save changes.",
      });
      setLoading(false);
      return;
    }

    try {
      // Update basic user attributes (like email if changed) and user_metadata
      const { data, error } = await supabase.auth.updateUser({
        email: email, // Update email if it's been changed in the form
        data: {
          // This object goes into user_metadata
          name: name,
          leetcode_url: leetcodeUrl,
          geeksforgeeks_url: geeksforgeeksUrl,
          hackerrank_url: hackerrankUrl,
        },
      });

      if (error) {
        console.error("Supabase Update Error:", error.message);
        setMessage({
          type: "error",
          text: `Error saving changes: ${error.message}`,
        });
      } else {
        console.log("Profile updated successfully:", data);
        setMessage({ type: "success", text: "Profile updated successfully!" });
      }
    } catch (err) {
      console.error("Unexpected error during save:", err);
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase Logout Error:", error.message);
        setMessage({
          type: "error",
          text: `Error logging out: ${error.message}`,
        });
      } else {
        console.log("Logged out successfully.");
        // AuthContext will automatically update user to null,
        // ProtectedRoute will handle redirection.
        setMessage({ type: "success", text: "You have been logged out." });
      }
    } catch (err) {
      console.error("Unexpected error during logout:", err);
      setMessage({
        type: "error",
        text: "An unexpected error occurred during logout.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const clearUrl = (platform) => {
    switch (platform) {
      case "leetcode":
        setLeetcodeUrl("");
        break;
      case "geeksforgeeks":
        setGeeksforGeeksUrl("");
        break;
      case "hackerrank":
        setHackerrankUrl("");
        break;
      default:
        break;
    }
    setMessage({
      type: "info",
      text: `${
        platform.charAt(0).toUpperCase() + platform.slice(1)
      } URL cleared locally. Remember to save changes.`,
    });
    setTimeout(() => setMessage(""), 3000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center text-xl">
        Loading user profile...
      </div>
    );
  }

  return (
    <div className="flex-grow p-8 bg-gray-100 overflow-auto">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8 flex items-center justify-center gap-3">
          <FaUser className="text-blue-600" /> Your Profile
        </h1>

        {fetchError && (
          <div
            className="flex items-center p-3 mb-6 bg-red-50 text-red-700 rounded-md text-base"
            role="alert"
          >
            <FaExclamationTriangle className="mr-2 flex-shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}

        <form onSubmit={handleSaveChanges}>
          {/* Personal Information Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Personal Information
            </h2>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-0">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="your@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Coding Profiles Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Coding Profiles
            </h2>

            {/* LeetCode URL */}
            <div className="mb-4">
              <label
                htmlFor="leetcodeUrl"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                <FaCode className="inline-block mr-2 text-blue-500" /> LeetCode
                Profile URL
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  id="leetcodeUrl"
                  name="leetcodeUrl"
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="https://leetcode.com/your_profile/"
                  value={leetcodeUrl}
                  onChange={(e) => setLeetcodeUrl(e.target.value)}
                />
                {leetcodeUrl && (
                  <button
                    type="button"
                    onClick={() => clearUrl("leetcode")}
                    className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                    title="Remove URL"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>

            {/* GeeksforGeeks URL */}
            <div className="mb-4">
              <label
                htmlFor="geeksforgeeksUrl"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                <FaBookOpen className="inline-block mr-2 text-green-500" />{" "}
                GeeksforGeeks Profile URL
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  id="geeksforgeeksUrl"
                  name="geeksforgeeksUrl"
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="https://auth.geeksforgeeks.org/user/your_profile/"
                  value={geeksforgeeksUrl}
                  onChange={(e) => setGeeksforGeeksUrl(e.target.value)}
                />
                {geeksforgeeksUrl && (
                  <button
                    type="button"
                    onClick={() => clearUrl("geeksforgeeks")}
                    className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                    title="Remove URL"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>

            {/* HackerRank URL */}
            <div className="mb-0">
              <label
                htmlFor="hackerrankUrl"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                <FaTerminal className="inline-block mr-2 text-teal-500" />{" "}
                HackerRank Profile URL
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  id="hackerrankUrl"
                  name="hackerrankUrl"
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="https://www.hackerrank.com/your_profile"
                  value={hackerrankUrl}
                  onChange={(e) => setHackerrankUrl(e.target.value)}
                />
                {hackerrankUrl && (
                  <button
                    type="button"
                    onClick={() => clearUrl("hackerrank")}
                    className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                    title="Remove URL"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          </div>

          {message.text && (
            <p
              className={`text-sm italic text-center mb-6 ${
                message.type === "error"
                  ? "text-red-500"
                  : message.type === "info"
                  ? "text-blue-500"
                  : "text-green-600"
              }`}
            >
              {message.text}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <button
              type="submit"
              disabled={loading || authLoading} // Disable save button during component's loading or auth loading
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out w-full flex items-center justify-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}{" "}
              Save Changes
            </button>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading || authLoading} // Disable logout button during component's loading or auth loading
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out w-full max-w-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSignOutAlt />
              )}{" "}
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
