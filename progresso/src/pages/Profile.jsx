import { useState } from "react";
import {
  FaBookOpen,
  FaCode,
  FaSave,
  FaSignOutAlt,
  FaTerminal,
  FaTrash,
  FaUser,
} from "react-icons/fa"; // Added FaCode, FaBookOpen, FaTerminal

export default function Profile({ onLogout }) {
  // State for user details, initialized with empty strings or default placeholders
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [geeksforgeeksUrl, setGeeksforGeeksUrl] = useState(""); // Corrected typo here
  const [hackerrankUrl, setHackerrankUrl] = useState("");
  const [message, setMessage] = useState(""); // For success/error messages

  const handleSaveChanges = (e) => {
    e.preventDefault();
    console.log("Saving changes:", {
      name,
      email,
      leetcodeUrl,
      geeksforgeeksUrl,
      hackerrankUrl,
    });

    // --- Placeholder for actual API call to update user profile ---
    // In a real application, you would send this data to your backend/database (e.g., Supabase)
    // You'd typically get the current user ID/info from an authentication context here
    // const { data, error } = await supabase.from('users').update({
    //   name: name,
    //   email: email,
    //   leetcode_url: leetcodeUrl,
    //   geeksforgeeks_url: geeksforgeeksUrl,
    //   hackerrank_url: hackerrankUrl
    // }).eq('id', currentUserId);
    // if (error) { ... setError message ... } else { ... set success message ... }

    // Simulate successful save for now
    setMessage({ type: "success", text: "Profile updated successfully!" });
    setTimeout(() => setMessage(""), 3000);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    // --- Placeholder for actual logout logic ---
    // e.g., await supabase.auth.signOut();
    if (onLogout) {
      onLogout(); // Notify App.jsx to handle logout state change
    }
    alert("Logged out! (Simulated)");
  };

  const clearUrl = (platform) => {
    switch (platform) {
      case "leetcode":
        setLeetcodeUrl("");
        break;
      case "geeksforgeeks":
        setGeeksforGeeksUrl("");
        break; // Corrected typo here too
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
      } URL cleared.`,
    });
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="flex-grow p-8 bg-gray-100 overflow-auto">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8 flex items-center justify-center gap-3">
          <FaUser className="text-blue-600" /> Your Profile
        </h1>

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
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out w-full"
            >
              <FaSave className="inline-block mr-2" /> Save Changes
            </button>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out w-full max-w-sm"
            >
              <FaSignOutAlt className="inline-block mr-2" /> Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
