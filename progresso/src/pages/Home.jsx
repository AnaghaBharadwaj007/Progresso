import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../AuthContext"; // Import useAuth to access login state

// FeatureCard Component for the Scroll Reveal Section (no changes here)
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6 text-center transform transition duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// HomePage Component
export default function Home() {
  const { user, loading } = useAuth(); // Consume AuthContext to get user and loading state
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Updated handleTryNowClick for conditional navigation
  const handleTryNowClick = () => {
    if (loading) {
      // Optionally show a loading indicator or disable button
      console.log("Authentication status is still loading...");
      return;
    }
    if (user) {
      // If user is logged in
      navigate("/dashboard");
    } else {
      // If user is not logged in
      navigate("/signin");
    }
  };

  // Placeholder function for "Learn More" button click (no changes)
  const handleLearnMoreClick = () => {
    console.log("Learn More button clicked! (Will scroll to features)");
    document
      .getElementById("features-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      {/*
        Removed Navigation Bar here, as it's now rendered globally in App.jsx.
        Your App.jsx imports Navbar from "./components/Navbar" and renders it once.
      */}

      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-up">
            Unify Your Coding Journey
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-up delay-100">
            Track, analyze, and conquer coding challenges across all platforms
            in one place.
          </p>
          <div className="flex justify-center space-x-4 animate-fade-in-up delay-200">
            <button
              onClick={handleTryNowClick}
              className="px-8 py-3 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Try Now
            </button>
            <button
              onClick={handleLearnMoreClick}
              className="px-8 py-3 border-2 border-white text-white font-bold rounded-full shadow-lg hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Scroll Reveal Section (Feature Highlights) */}
      <section id="features-section" className="py-16 px-8 bg-gray-50">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Features That Empower Your Progress
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1: Track Daily/Weekly Progress */}
          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500 mb-4"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            }
            title="Track Your Progress"
            description="Monitor your daily and weekly coding activity across all connected platforms with insightful metrics."
          />

          {/* Feature 2: Auto-sync with Platforms */}
          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500 mb-4"
              >
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="m10 20 2-2 2 2" />
                <path d="M12 14v6" />
              </svg>
            }
            title="Auto-Sync Platforms"
            description="Seamlessly import your solved problems from LeetCode, Codeforces, HackerRank, and more."
          />

          {/* Feature 3: Goal-setting Dashboard */}
          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-500 mb-4"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            }
            title="Goal-Setting Dashboard"
            description="Set personalized coding goals and visualize your progress towards achieving them with a dedicated dashboard."
          />

          {/* Feature 4: Weekly Contest Reminders */}
          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-orange-500 mb-4"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M17.73 20A2 2 0 0 1 16 21H8a2 2 0 0 1-1.73-1" />
                <path d="M21.8 4c.2 2.7-.2 7.2-2.1 10.1" />
                <path d="M4.2 4c-.2 2.7.2 7.2 2.1 10.1" />
              </svg>
            }
            title="Contest Reminders"
            description="Never miss an important coding contest again with timely notifications and an integrated contest calendar."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full p-6 bg-gray-800 text-white text-center text-sm">
        <p>
          &copy; {new Date().getFullYear()} CodeTracker. All rights reserved.
        </p>
        <p className="mt-2">Built with React & Tailwind CSS</p>
      </footer>
    </div>
  );
}
